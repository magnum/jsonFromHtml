<script setup>
import { computed, ref } from 'vue'
import { buildEvalUrl } from '../shared/buildEvalUrl.js'

const pageUrl = ref(
  'https://www.teleborsa.it/fondi/vera-vita-pip-bilanciato-global-vebigl-RkMuVkVCSUdM',
)
const code = ref(`(function (document) {
  return JSON.generate({
    value: document.querySelector("#ctl00_phContents_ctlHeader_lblPrice").innerText
  })
})(document)
`)
const output = ref('')
const pending = ref(false)
const copied = ref(false)

const callableUrl = computed(() => {
  if (!pageUrl.value.trim() || !code.value.trim()) return ''
  return buildEvalUrl(window.location.origin, pageUrl.value.trim(), code.value)
})

async function submit() {
  output.value = ''
  if (!callableUrl.value) {
    output.value = 'Inserisci url e code'
    return
  }

  pending.value = true
  try {
    const response = await fetch(callableUrl.value)
    output.value = await response.text()
  } catch (error) {
    output.value = error instanceof Error ? error.message : 'Richiesta fallita'
  } finally {
    pending.value = false
  }
}

async function copyUrl() {
  if (!callableUrl.value) return
  await navigator.clipboard.writeText(callableUrl.value)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1400)
}
</script>

<template>
  <main class="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-10 sm:px-6">
    <header class="mb-8">
      <p class="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">jsonFromHtml</p>
      <h1 class="mt-2 font-serif text-4xl tracking-tight text-stone-900">Build</h1>
      <p class="mt-3 max-w-xl text-sm leading-6 text-stone-600">
        Incolla l'indirizzo di una pagina e un'espressione JavaScript. Il codice gira sul
        <span class="font-mono text-[13px]">document</span> della pagina scaricata.
        <span class="font-mono text-[13px]">JSON.generate</span> equivale a
        <span class="font-mono text-[13px]">JSON.stringify</span>.
      </p>
    </header>

    <form class="flex flex-col gap-5" @submit.prevent="submit">
      <label class="flex flex-col gap-2">
        <span class="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">url</span>
        <input
          v-model="pageUrl"
          type="url"
          name="url"
          required
          spellcheck="false"
          class="rounded-md border border-stone-300 bg-white px-3 py-2 font-mono text-sm text-stone-900 outline-none focus:border-stone-800"
        />
      </label>

      <label class="flex flex-col gap-2">
        <span class="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">code</span>
        <textarea
          v-model="code"
          name="code"
          required
          spellcheck="false"
          rows="8"
          class="min-h-48 rounded-md border border-stone-300 bg-white px-3 py-2 font-mono text-sm leading-6 text-stone-900 outline-none focus:border-stone-800"
        />
      </label>

      <label class="flex flex-col gap-2">
        <span class="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">output</span>
        <textarea
          :value="output"
          name="output"
          readonly
          spellcheck="false"
          rows="6"
          placeholder="Il risultato compare qui dopo Submit"
          class="min-h-32 rounded-md border border-stone-300 bg-stone-50 px-3 py-2 font-mono text-sm leading-6 text-stone-900 outline-none"
        />
      </label>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between gap-3">
          <span id="input-label" class="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">input</span>
          <button
            type="button"
            class="text-xs font-medium text-stone-700 underline decoration-stone-300 underline-offset-2 disabled:text-stone-400"
            :disabled="!callableUrl"
            @click="copyUrl"
          >
            {{ copied ? 'Copiato' : 'Copia' }}
          </button>
        </div>
        <input
          :value="callableUrl"
          name="input"
          aria-labelledby="input-label"
          readonly
          spellcheck="false"
          placeholder="L'URL completo compare qui"
          class="rounded-md border border-stone-300 bg-white px-3 py-2 font-mono text-xs text-stone-800 outline-none"
        />
      </div>

      <button
        type="submit"
        class="mt-1 h-11 rounded-md bg-stone-900 text-sm font-semibold text-white disabled:bg-stone-400"
        :disabled="pending"
      >
        {{ pending ? 'Esecuzione…' : 'Submit' }}
      </button>
    </form>
  </main>
</template>

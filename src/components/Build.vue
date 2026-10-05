<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { buildEvalUrl } from '../shared/buildEvalUrl.js'
import { buildPageUrl } from '../shared/buildPageUrl.js'
import { loadBuildParams, saveBuildParams } from '../shared/buildStorage.js'
import { resolveBuildFields } from '../shared/resolveBuildFields.js'

const DEFAULT_URL = 'https://www.teleborsa.it/fondi/vera-vita-pip-bilanciato-global-vebigl-RkMuVkVCSUdM'
const DEFAULT_CODE = `(function (document) {
  return JSON.generate({
    value: document.querySelector("#ctl00_phContents_ctlHeader_lblPrice").innerText
  })
})(document)
`

const route = useRoute()
const output = ref('')
const pending = ref(false)
const copied = ref('')

function queryText(value) {
  if (Array.isArray(value)) return value[0] ?? ''
  return typeof value === 'string' ? value : ''
}

function fieldsForQuery() {
  return resolveBuildFields({
    query: {
      url: queryText(route.query.url),
      code: queryText(route.query.code),
    },
    stored: loadBuildParams(window.localStorage),
    defaults: { url: DEFAULT_URL, code: DEFAULT_CODE },
  })
}

const initial = fieldsForQuery()
const pageUrl = ref(initial.url)
const code = ref(initial.code)

watch(
  () => [queryText(route.query.url), queryText(route.query.code)],
  () => {
    const next = fieldsForQuery()
    pageUrl.value = next.url
    code.value = next.code
  },
)

const directUrl = computed(() => {
  if (!pageUrl.value.trim() || !code.value.trim()) return ''
  return buildEvalUrl(window.location.origin, pageUrl.value.trim(), code.value)
})

const buildUrl = computed(() => {
  if (!pageUrl.value.trim() || !code.value.trim()) return ''
  return buildPageUrl(window.location.origin, pageUrl.value.trim(), code.value)
})

async function submit() {
  output.value = ''
  if (!pageUrl.value.trim() || !code.value.trim()) {
    output.value = 'Inserisci url e code'
    return
  }

  try {
    saveBuildParams(window.localStorage, {
      url: pageUrl.value.trim(),
      code: code.value,
    })
  } catch {
    // Submit continues when storage is unavailable.
  }

  pending.value = true
  try {
    const response = await fetch(directUrl.value)
    output.value = await response.text()
  } catch (error) {
    output.value = error instanceof Error ? error.message : 'Richiesta fallita'
  } finally {
    pending.value = false
  }
}

async function copyUrl(value, which) {
  if (!value) return
  await navigator.clipboard.writeText(value)
  copied.value = which
  window.setTimeout(() => {
    if (copied.value === which) copied.value = ''
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
          <span id="direct-url-label" class="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">direct url</span>
          <button
            type="button"
            class="text-xs font-medium text-stone-700 underline decoration-stone-300 underline-offset-2 disabled:text-stone-400"
            :disabled="!directUrl"
            @click="copyUrl(directUrl, 'direct')"
          >
            {{ copied === 'direct' ? 'Copiato' : 'Copia' }}
          </button>
        </div>
        <input
          :value="directUrl"
          name="direct-url"
          aria-labelledby="direct-url-label"
          readonly
          spellcheck="false"
          placeholder="L'URL /eval compare qui"
          class="rounded-md border border-stone-300 bg-white px-3 py-2 font-mono text-xs text-stone-800 outline-none"
        />
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between gap-3">
          <span id="build-url-label" class="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">build url</span>
          <button
            type="button"
            class="text-xs font-medium text-stone-700 underline decoration-stone-300 underline-offset-2 disabled:text-stone-400"
            :disabled="!buildUrl"
            @click="copyUrl(buildUrl, 'build')"
          >
            {{ copied === 'build' ? 'Copiato' : 'Copia' }}
          </button>
        </div>
        <input
          :value="buildUrl"
          name="build-url"
          aria-labelledby="build-url-label"
          readonly
          spellcheck="false"
          placeholder="L'URL /build compare qui"
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

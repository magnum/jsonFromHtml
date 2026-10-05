import { EvalRequestError } from './errors.js'
import { assertPublicHttpUrl, assertPublicResolution } from './publicUrl.js'

const MAX_CHARS = 1_500_000
const MAX_HOPS = 4

export async function fetchHtml(rawUrl, { fetchImpl = globalThis.fetch, lookup } = {}) {
  let current = assertPublicHttpUrl(rawUrl)

  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    await assertPublicResolution(current, lookup)

    let response
    try {
      response = await fetchImpl(current.href, {
        redirect: 'manual',
        headers: {
          accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
          'user-agent': 'Mozilla/5.0 (compatible; jsonFromHtml/1.0)',
        },
        signal: AbortSignal.timeout(8000),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fetch fallito'
      throw new EvalRequestError(message, 502)
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) throw new EvalRequestError('Redirect senza destinazione', 502)
      current = assertPublicHttpUrl(new URL(location, current).href)
      continue
    }

    if (!response.ok) throw new EvalRequestError(`HTTP ${response.status}`, 502)

    const text = await response.text()
    if (text.length > MAX_CHARS) throw new EvalRequestError('Pagina troppo grande', 502)
    return text
  }

  throw new EvalRequestError('Troppi redirect', 502)
}

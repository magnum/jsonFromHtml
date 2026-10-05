import { evaluateOnHtml } from './evaluate.js'
import { EvalRequestError } from './errors.js'
import { fetchHtml as defaultFetchHtml } from './fetchHtml.js'

export { EvalRequestError } from './errors.js'

export async function handleEval(searchParams, { fetchHtml = defaultFetchHtml } = {}) {
  const pageUrl = searchParams.get('url')?.trim() ?? ''
  const code = searchParams.get('code') ?? ''
  if (!pageUrl) throw new EvalRequestError('Parametro url mancante')
  if (!code.trim()) throw new EvalRequestError('Parametro code mancante')

  const html = await fetchHtml(pageUrl)
  return evaluateOnHtml(html, code)
}

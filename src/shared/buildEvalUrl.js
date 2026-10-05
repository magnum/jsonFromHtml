import { minifyCode } from './minifyCode.js'

export function buildEvalUrl(origin, pageUrl, code) {
  const base = String(origin).replace(/\/$/, '')
  const params = new URLSearchParams()
  params.set('url', pageUrl)
  params.set('code', minifyCode(code))
  return `${base}/eval?${params.toString()}`
}

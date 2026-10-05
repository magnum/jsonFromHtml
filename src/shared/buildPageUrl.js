export function buildPageUrl(origin, pageUrl, code) {
  const base = String(origin).replace(/\/$/, '')
  const params = new URLSearchParams()
  params.set('url', pageUrl)
  params.set('code', code)
  return `${base}/build?${params.toString()}`
}

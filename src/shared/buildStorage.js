export const BUILD_STORAGE_KEY = 'jsonFromHtml.build'

export function saveBuildParams(storage, params) {
  storage.setItem(
    BUILD_STORAGE_KEY,
    JSON.stringify({
      url: params.url,
      code: params.code,
    }),
  )
}

export function loadBuildParams(storage) {
  const raw = storage.getItem(BUILD_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (typeof parsed.url !== 'string' || typeof parsed.code !== 'string') return null
    return { url: parsed.url, code: parsed.code }
  } catch {
    return null
  }
}

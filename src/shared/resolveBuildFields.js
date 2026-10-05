function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function resolveBuildFields({ query, stored, defaults }) {
  const queryUrl = text(query?.url)
  const queryCode = text(query?.code)
  const storedUrl = text(stored?.url)
  const storedCode = text(stored?.code)

  if (!queryUrl && !queryCode) {
    if (storedUrl || storedCode) {
      return {
        url: storedUrl || defaults.url,
        code: storedCode || defaults.code,
      }
    }
    return { url: defaults.url, code: defaults.code }
  }

  return {
    url: queryUrl || storedUrl || defaults.url,
    code: queryCode || storedCode || defaults.code,
  }
}

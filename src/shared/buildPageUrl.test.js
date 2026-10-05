import { describe, expect, it } from 'vitest'
import { buildPageUrl } from './buildPageUrl.js'

describe('buildPageUrl', () => {
  it('builds a /build url that carries url and code', () => {
    const href = buildPageUrl(
      'https://app.example/',
      'https://www.teleborsa.it/fondi/vera-vita',
      '(function (document) {\n  return 1\n})(document)',
    )
    const url = new URL(href)

    expect(url.origin + url.pathname).toBe('https://app.example/build')
    expect(url.searchParams.get('url')).toBe('https://www.teleborsa.it/fondi/vera-vita')
    expect(url.searchParams.get('code')).toBe('(function (document) {\n  return 1\n})(document)')
  })
})

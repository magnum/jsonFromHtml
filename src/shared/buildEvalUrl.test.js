import { describe, expect, it } from 'vitest'
import { buildEvalUrl } from './buildEvalUrl.js'

describe('buildEvalUrl', () => {
  it('builds a browser-callable /eval url with minified code', () => {
    const href = buildEvalUrl(
      'https://app.example/',
      'https://www.teleborsa.it/fondi/vera-vita',
      '(function (document) {\n  return document.querySelector("#p").innerText\n})(document)',
    )
    const url = new URL(href)

    expect(url.origin + url.pathname).toBe('https://app.example/eval')
    expect(url.searchParams.get('url')).toBe('https://www.teleborsa.it/fondi/vera-vita')
    expect(url.searchParams.get('code')).toBe(
      '(function(document){return document.querySelector("#p").innerText})(document)',
    )
  })
})

import { describe, expect, it } from 'vitest'
import { EvalRequestError } from './errors.js'
import { handleEval } from './handleEval.js'

const html = '<span id="p">16,798</span>'

function params(query) {
  return new URLSearchParams(query)
}

describe('handleEval', () => {
  it('fetches the page and returns the code result', async () => {
    const result = await handleEval(
      params({
        url: 'https://www.teleborsa.it/fondi/vera-vita',
        code: '(function (document) { return document.querySelector("#p").innerText })(document)',
      }),
      {
        fetchHtml: async (url) => {
          expect(url).toBe('https://www.teleborsa.it/fondi/vera-vita')
          return html
        },
      },
    )

    expect(result).toBe('16,798')
  })

  it('rejects a missing url before fetching', async () => {
    await expect(handleEval(params({ code: '1' }), { fetchHtml: async () => html })).rejects.toBeInstanceOf(
      EvalRequestError,
    )
  })

  it('refuses a redirect target that is not public', async () => {
    const { fetchHtml } = await import('./fetchHtml.js')

    await expect(
      fetchHtml('https://example.com/start', {
        lookup: async () => [{ address: '1.1.1.1', family: 4 }],
        fetchImpl: async (href) => {
          if (href === 'https://example.com/start') {
            return new Response(null, {
              status: 302,
              headers: { location: 'http://127.0.0.1/secret' },
            })
          }
          throw new Error(`unexpected fetch ${href}`)
        },
      }),
    ).rejects.toThrow(EvalRequestError)
  })

  it('refuses a hostname that resolves to a private address', async () => {
    const { fetchHtml } = await import('./fetchHtml.js')

    await expect(
      fetchHtml('https://example.com/', {
        lookup: async () => [{ address: '10.0.0.8', family: 4 }],
        fetchImpl: async () => {
          throw new Error('should not fetch')
        },
      }),
    ).rejects.toThrow(/non pubblico/)
  })
})

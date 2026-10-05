import { describe, expect, it } from 'vitest'
import { evaluateOnHtml } from './evaluate.js'
import { EvalRequestError } from './errors.js'

const html = `<!doctype html><html><body>
  <span id="ctl00_phContents_ctlHeader_lblPrice">16,798</span>
</body></html>`

describe('evaluateOnHtml', () => {
  it('runs the expression against the fetched document and returns its value', () => {
    const code = `(function (document) {
      return JSON.stringify({
        value: document.querySelector("#ctl00_phContents_ctlHeader_lblPrice").innerText
      })
    })(document)`

    expect(evaluateOnHtml(html, code)).toBe('{"value":"16,798"}')
  })

  it('accepts JSON.generate as an alias of JSON.stringify', () => {
    const code = `(function (document) {
      return JSON.generate({
        value: document.querySelector("#ctl00_phContents_ctlHeader_lblPrice").innerText
      })
    })(document)`

    expect(evaluateOnHtml(html, code)).toBe('{"value":"16,798"}')
  })

  it('returns the error message when the code throws', () => {
    expect(() => evaluateOnHtml(html, 'document.querySelector("#missing").innerText')).toThrow(
      EvalRequestError,
    )
  })

  it('does not expose process to the evaluated code', () => {
    expect(() => evaluateOnHtml(html, 'process.env')).toThrow(/process is not defined/)
  })
})

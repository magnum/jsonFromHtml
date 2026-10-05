import { describe, expect, it } from 'vitest'
import { minifyCode } from './minifyCode.js'

describe('minifyCode', () => {
  it('collapses whitespace and drops comments without touching strings', () => {
    const source = `(function (document) {
      // prezzo
      return JSON.stringify({
        value: document.querySelector("#ctl00_phContents_ctlHeader_lblPrice").innerText
      });
    })(document)`

    expect(minifyCode(source)).toBe(
      '(function(document){return JSON.stringify({value:document.querySelector("#ctl00_phContents_ctlHeader_lblPrice").innerText});})(document)',
    )
  })

  it('keeps spaces that would glue words or plus operators', () => {
    expect(minifyCode('return  a  +  +b')).toBe('return a+ +b')
  })
})

import { describe, expect, it } from 'vitest'
import { resolveBuildFields } from './resolveBuildFields.js'

const defaults = {
  url: 'https://default.example',
  code: 'return 1',
}

describe('resolveBuildFields', () => {
  it('uses the query when /build is opened with parameters', () => {
    expect(
      resolveBuildFields({
        query: { url: 'https://from.query', code: 'return query' },
        stored: { url: 'https://stored.example', code: 'return stored' },
        defaults,
      }),
    ).toEqual({
      url: 'https://from.query',
      code: 'return query',
    })
  })

  it('reads local storage when /build has no parameters', () => {
    expect(
      resolveBuildFields({
        query: { url: '', code: '' },
        stored: { url: 'https://stored.example', code: 'return stored' },
        defaults,
      }),
    ).toEqual({
      url: 'https://stored.example',
      code: 'return stored',
    })
  })

  it('falls back to defaults when there is no query and no storage', () => {
    expect(
      resolveBuildFields({
        query: {},
        stored: null,
        defaults,
      }),
    ).toEqual(defaults)
  })
})

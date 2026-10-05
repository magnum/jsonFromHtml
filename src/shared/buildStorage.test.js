import { describe, expect, it } from 'vitest'
import { BUILD_STORAGE_KEY, loadBuildParams, saveBuildParams } from './buildStorage.js'

function memoryStorage(initial = {}) {
  const data = { ...initial }
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value)
    },
  }
}

describe('build storage', () => {
  it('saves url and code together and reads them back', () => {
    const storage = memoryStorage()
    saveBuildParams(storage, {
      url: 'https://example.com/page',
      code: 'return document.body',
    })

    expect(JSON.parse(storage.getItem(BUILD_STORAGE_KEY))).toEqual({
      url: 'https://example.com/page',
      code: 'return document.body',
    })
    expect(loadBuildParams(storage)).toEqual({
      url: 'https://example.com/page',
      code: 'return document.body',
    })
  })

  it('returns null when nothing valid is stored', () => {
    expect(loadBuildParams(memoryStorage())).toBeNull()
    expect(loadBuildParams(memoryStorage({ [BUILD_STORAGE_KEY]: '{oops' }))).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { EvalRequestError } from './errors.js'
import { assertPublicHttpUrl, isPublicIp } from './publicUrl.js'

describe('isPublicIp', () => {
  it('rejects loopback, private, and link-local addresses', () => {
    for (const ip of [
      '127.0.0.1',
      '10.1.2.3',
      '172.16.0.5',
      '192.168.1.10',
      '169.254.169.254',
      '0.0.0.0',
      '::1',
      'fc00::1',
      'fe80::1',
    ]) {
      expect(isPublicIp(ip)).toBe(false)
    }
  })

  it('accepts public addresses', () => {
    expect(isPublicIp('1.1.1.1')).toBe(true)
    expect(isPublicIp('8.8.8.8')).toBe(true)
    expect(isPublicIp('2606:4700:4700::1111')).toBe(true)
  })
})

describe('assertPublicHttpUrl', () => {
  it('accepts https pages on the default port', () => {
    const url = assertPublicHttpUrl(
      'https://www.teleborsa.it/fondi/vera-vita-pip-bilanciato-global-vebigl-RkMuVkVCSUdM',
    )
    expect(url.hostname).toBe('www.teleborsa.it')
  })

  it('rejects non-http schemes, credentials, odd ports, and local hosts', () => {
    const blocked = [
      'file:///etc/passwd',
      'ftp://example.com',
      'https://user:pass@example.com',
      'https://example.com:8443/a',
      'http://localhost/admin',
      'http://127.0.0.1/',
      'http://169.254.169.254/latest/meta-data',
      'http://[::1]/',
      'http://metadata.google.internal/',
    ]

    for (const raw of blocked) {
      expect(() => assertPublicHttpUrl(raw)).toThrow(EvalRequestError)
    }
  })
})

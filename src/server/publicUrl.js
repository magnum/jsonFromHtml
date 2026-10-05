import { lookup as defaultLookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { EvalRequestError } from './errors.js'

const BLOCKED_HOSTS = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata.internal',
])

const PRIVATE_V4 = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]

function ipv4ToInt(ip) {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return null
  }
  return (((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0)
}

function inCidr(ip, base, bits) {
  const address = ipv4ToInt(ip)
  const network = ipv4ToInt(base)
  if (address == null || network == null) return false
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0
  return (address & mask) === (network & mask)
}

function isPublicV4(ip) {
  return !PRIVATE_V4.some(([base, bits]) => inCidr(ip, base, bits))
}

function firstHextet(ip) {
  if (ip.startsWith('::')) return 0
  return Number.parseInt(ip.split(':')[0] || '0', 16)
}

function isPublicV6(ip) {
  const lower = ip.toLowerCase()
  if (lower === '::' || lower === '::1') return false

  const dotted = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (dotted) return isPublicV4(dotted[1])

  if (lower.startsWith('::ffff:')) {
    const rest = lower.slice('::ffff:'.length)
    if (/^[0-9a-f]+:[0-9a-f]+$/.test(rest)) {
      const [high, low] = rest.split(':').map((part) => Number.parseInt(part, 16))
      const v4 = `${(high >> 8) & 255}.${high & 255}.${(low >> 8) & 255}.${low & 255}`
      return isPublicV4(v4)
    }
  }

  const head = firstHextet(lower)
  if ((head & 0xfe00) === 0xfc00) return false
  if ((head & 0xffc0) === 0xfe80) return false
  if ((head & 0xff00) === 0xff00) return false
  return true
}

export function isPublicIp(address) {
  const kind = isIP(address)
  if (kind === 4) return isPublicV4(address)
  if (kind === 6) return isPublicV6(address)
  return false
}

export function assertPublicHttpUrl(raw) {
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new EvalRequestError('URL non valido')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new EvalRequestError('Sono ammessi solo http e https')
  }
  if (url.username || url.password) {
    throw new EvalRequestError('URL con credenziali non ammesso')
  }
  if (url.port && url.port !== '80' && url.port !== '443') {
    throw new EvalRequestError('Porta non ammessa')
  }

  const host = bareHost(url.hostname).toLowerCase()
  if (
    BLOCKED_HOSTS.has(host) ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    throw new EvalRequestError('Host non ammesso')
  }
  if (isIP(host) && !isPublicIp(host)) {
    throw new EvalRequestError('Indirizzo non pubblico')
  }

  return url
}

function bareHost(hostname) {
  if (hostname.startsWith('[') && hostname.endsWith(']')) return hostname.slice(1, -1)
  return hostname
}

export async function assertPublicResolution(url, lookup = defaultLookup) {
  const host = bareHost(url.hostname)
  if (isIP(host)) {
    if (!isPublicIp(host)) throw new EvalRequestError('Indirizzo non pubblico')
    return
  }

  let records
  try {
    records = await lookup(host, { all: true, verbatim: true })
  } catch {
    throw new EvalRequestError("Impossibile risolvere l'host", 502)
  }

  if (!records?.length) throw new EvalRequestError('Host senza indirizzi', 502)
  for (const record of records) {
    if (!isPublicIp(record.address)) {
      throw new EvalRequestError("L'host risolve su un indirizzo non pubblico", 502)
    }
  }
}

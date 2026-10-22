import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

export const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' }
export const SIGNED_OUT_COOKIE = 'juli-mobile-signed-out'

const ticketKey = secret => createHash('sha256').update(`juli-mobile-v1\0${secret}`).digest()
const ticketContext = Buffer.from('juli-mobile-v1')

export function sealTicket({ tokenHash, userId }, secret, now = Date.now()) {
  if (!secret || secret.length < 32) throw new Error('Mobile session signing is not configured')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', ticketKey(secret), iv)
  cipher.setAAD(ticketContext)
  const payload = JSON.stringify({ tokenHash, userId, expires: now + 60_000 })
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()])
  return [iv, encrypted, cipher.getAuthTag()].map(value => value.toString('base64url')).join('.')
}

export function openTicket(ticket, secret, now = Date.now()) {
  if (!secret || typeof ticket !== 'string' || ticket.length > 4096) return null
  try {
    const parts = ticket.split('.')
    if (parts.length !== 3) return null
    const [iv, encrypted, tag] = parts.map(value => Buffer.from(value, 'base64url'))
    if (iv.length !== 12 || tag.length !== 16) return null
    const decipher = createDecipheriv('aes-256-gcm', ticketKey(secret), iv)
    decipher.setAAD(ticketContext)
    decipher.setAuthTag(tag)
    const value = JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString())
    if (typeof value.tokenHash !== 'string' || !value.tokenHash || typeof value.userId !== 'string' ||
        !Number.isFinite(value.expires) || value.expires <= now || value.expires > now + 60_000) return null
    return value
  } catch { return null }
}

export function acceptsOrigin(request) {
  const origin = request.headers.get('origin')
  return !origin || origin === new URL(request.url).origin
}

// Android WebView postUrl() sends `Origin: null`. Accept it only for the app's
// own top-level navigation: a web page cannot change the victim's User-Agent,
// and anything a page initiates carries Sec-Fetch-Site cross-site/same-site.
export function acceptsNativeNavigation(request) {
  if (acceptsOrigin(request)) return true
  const fetchSite = request.headers.get('sec-fetch-site')
  return request.headers.get('origin') === 'null' &&
    /\bJuliNative\//.test(request.headers.get('user-agent') ?? '') &&
    fetchSite !== 'cross-site' && fetchSite !== 'same-site'
}

export async function readBody(request, maxBytes = 8192) {
  const reader = request.body?.getReader()
  if (!reader) throw new Error('Missing body')
  const chunks = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) { await reader.cancel(); throw new Error('Body too large') }
    chunks.push(Buffer.from(value))
  }
  return Buffer.concat(chunks).toString('utf8')
}

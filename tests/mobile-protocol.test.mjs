import assert from 'node:assert/strict'
import { test } from 'node:test'
import { sealTicket, openTicket, acceptsOrigin, acceptsNativeNavigation, readBody } from '../lib/server/mobile/protocol.js'
const secret = 'test-only-secret'.repeat(4)
const now = 100000
const subject = { tokenHash: 'one-time-token', userId: 'verified-user' }

test('ticket is bound to the authenticated identity and expires after 60 seconds', () => {
  const ticket = sealTicket(subject, secret, now)
  assert.deepEqual(openTicket(ticket, secret, now), { ...subject, expires: now + 60000 })
  assert.equal(openTicket(ticket, secret, now + 60000), null)
  assert.equal(openTicket(ticket, secret, now - 1), null)
  assert.equal(openTicket(ticket, 'another-secret', now), null)
  assert.equal(Buffer.from(ticket.split('.')[1], 'base64url').toString().includes(subject.tokenHash), false)
})
test('tampering, malformed signatures and oversized input are rejected', () => {
  const ticket = sealTicket(subject, secret, now)
  const [iv, payload, signature] = ticket.split('.')
  const altered = Buffer.from(JSON.stringify({ ...subject, userId: 'someone-else', expires: now + 60000 })).toString('base64url')
  for (const invalid of [`${iv}.${altered}.${signature}`, `${iv}.${payload}.x`, `${ticket}.extra`, '', 'x'.repeat(5000), null]) assert.equal(openTicket(invalid, secret, now), null)
  assert.throws(() => sealTicket(subject, 'short', now))
})
test('native requests and same-origin requests are accepted; cross-origin login CSRF is rejected', () => {
  const url = 'https://juli-organizador.vercel.app/api/mobile/session'
  assert.equal(acceptsOrigin(new Request(url)), true)
  assert.equal(acceptsOrigin(new Request(url, { headers: { origin: 'https://juli-organizador.vercel.app' } })), true)
  assert.equal(acceptsOrigin(new Request(url, { headers: { origin: 'https://attacker.test' } })), false)
  assert.equal(acceptsOrigin(new Request(url, { headers: { origin: 'null' } })), false)
})
test('Android WebView null-origin navigation is accepted only from the native app', () => {
  const url = 'https://juli-organizador.vercel.app/api/mobile/session'
  const native = 'Mozilla/5.0 (Linux; Android 14; wv) Chrome/141.0 Mobile Safari/537.36 JuliNative/1.0'
  const request = headers => new Request(url, { method: 'POST', headers })
  assert.equal(acceptsNativeNavigation(request({ origin: 'null', 'user-agent': native, 'sec-fetch-site': 'none' })), true)
  assert.equal(acceptsNativeNavigation(request({ origin: 'null', 'user-agent': native })), true)
  assert.equal(acceptsNativeNavigation(request({ origin: 'null', 'user-agent': 'Mozilla/5.0 Chrome/141.0' })), false)
  assert.equal(acceptsNativeNavigation(request({ origin: 'null', 'user-agent': native, 'sec-fetch-site': 'cross-site' })), false)
  assert.equal(acceptsNativeNavigation(request({ origin: 'https://attacker.test', 'user-agent': native })), false)
})
test('request bodies are bounded even without a content-length header', async () => {
  const request = body => new Request('https://example.test', { method: 'POST', body })
  assert.equal(await readBody(request('valid'), 5), 'valid')
  await assert.rejects(readBody(request('oversized'), 5))
})

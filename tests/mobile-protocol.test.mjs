import assert from 'node:assert/strict'
import { test } from 'node:test'
import { sealTicket, openTicket, acceptsOrigin, readBody } from '../lib/server/mobile/protocol.js'
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
test('request bodies are bounded even without a content-length header', async () => {
  const request = body => new Request('https://example.test', { method: 'POST', body })
  assert.equal(await readBody(request('valid'), 5), 'valid')
  await assert.rejects(readBody(request('oversized'), 5))
})

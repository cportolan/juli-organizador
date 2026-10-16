import { createHmac, timingSafeEqual } from 'node:crypto'

export const UNLOCK_SECONDS = 1800

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

// Bind grants to user, session, resource and current password hashes without exposing hashes.
export function issueToken(binding, secret, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ binding, exp: now + UNLOCK_SECONDS * 1000 })).toString('base64url')
  return `${payload}.${sign(payload, secret)}`
}

export function verifyToken(token, binding, secret, now = Date.now()) {
  try {
    const [payload, signature, extra] = token.split('.')
    if (!payload || !signature || extra) return false
    const expected = Buffer.from(sign(payload, secret))
    const actual = Buffer.from(signature)
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return parsed.binding === binding && Number.isFinite(parsed.exp) && parsed.exp > now
  } catch {
    return false
  }
}

export function passwordVersion(hash) {
  return createHmac('sha256', 'people-password-version').update(hash ?? '').digest('hex')
}

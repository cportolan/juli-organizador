// Run explicitly against a local server with --env-file=.env.local.
// Uses a temporary Auth user; never touches Juli's credentials or data.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
const origin = process.env.MOBILE_TEST_ORIGIN || 'http://localhost:3002'
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
const email = `mobile-auth-${randomUUID()}@example.invalid`
const password = `${randomUUID()}Aa!`
const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
assert.ifError(error)
const auth = input => fetch(`${origin}/api/mobile/auth`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })
const open = ticket => fetch(`${origin}/api/mobile/session`, { method: 'POST', body: new URLSearchParams({ ticket }), redirect: 'manual' })
try {
  const denied = await auth({ grant: 'password', email, password: 'wrong-password' })
  assert.equal(denied.status, 401)
  const foreign = await fetch(`${origin}/api/mobile/auth`, { method: 'POST', headers: { origin: 'https://attacker.test', 'content-type': 'application/json' }, body: '{}' })
  assert.equal(foreign.status, 403)
  const malformed = await auth(null)
  assert.equal(malformed.status, 400)
  const response = await auth({ grant: 'password', email, password })
  assert.equal(response.status, 200, 'password login failed')
  assert.match(response.headers.get('cache-control'), /no-store/)
  const first = await response.json()
  assert.equal(first.email, email)
  assert.ok(first.refreshToken && first.ticket)
  assert.equal(first.password, undefined)
  const session = await open(first.ticket)
  assert.equal(session.status, 303)
  assert.equal(new URL(session.headers.get('location')).pathname, '/calendario')
  const cookieJar = session.headers.getSetCookie().map(value => {
    const [pair] = value.split(';'); const index = pair.indexOf('=')
    return { name: pair.slice(0, index), value: decodeURIComponent(pair.slice(index + 1)) }
  }).filter(cookie => cookie.name.startsWith('sb-'))
  assert.ok(cookieJar.length)
  const replay = await open(first.ticket)
  assert.equal(new URL(replay.headers.get('location')).pathname, '/login')
  const web = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: { getAll: () => cookieJar, setAll: values => values.forEach(value => {
      const index = cookieJar.findIndex(cookie => cookie.name === value.name)
      if (index === -1) cookieJar.push(value); else cookieJar[index] = value
    }) },
  })
  const { data: verified, error: verifyError } = await web.auth.getUser()
  assert.ifError(verifyError)
  assert.equal(verified.user.id, created.user.id)
  for (let i = 0; i < 3; i++) assert.ifError((await web.auth.refreshSession()).error)
  const refresh = await auth({ grant: 'refresh', refreshToken: first.refreshToken })
  assert.equal(refresh.status, 200, 'native refresh must survive independent web token rotations')
  const second = await refresh.json()
  assert.ok(second.ticket && second.refreshToken)
  assert.ifError((await web.auth.signOut({ scope: 'global' })).error)
  const revoked = await auth({ grant: 'refresh', refreshToken: second.refreshToken })
  assert.equal(revoked.status, 401, 'sign-out must revoke the saved native session')
  console.log('PASS: password, origin, malformed input, one-use ticket, identity, separate token rotation, global logout.')
} finally {
  const { error: cleanupError } = await admin.auth.admin.deleteUser(created.user.id)
  assert.ifError(cleanupError)
  console.log('Temporary test user deleted.')
}

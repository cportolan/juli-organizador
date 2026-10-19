import test from 'node:test'
import assert from 'node:assert/strict'
import { getHolidaysInRange } from './holidays.js'

test('cache por año, puentes, deduplicación y fallas con último resultado válido', async () => {
  const originalFetch = globalThis.fetch
  const originalNow = Date.now
  let now = originalNow()
  let calls = 0
  let fail = false
  Date.now = () => now
  globalThis.fetch = async () => {
    calls += 1
    if (fail) throw new Error('offline')
    return { ok: true, json: async () => [{ fecha: '2026-07-10', nombre: 'Puente', tipo: 'puente' }] }
  }
  try {
    const range = { from: '2026-01-01', to: '2026-12-31' }
    const [first, second] = await Promise.all([getHolidaysInRange(range), getHolidaysInRange(range)])
    assert.deepEqual(first, [{ date: '2026-07-10', name: 'Puente', type: 'puente' }])
    assert.deepEqual(second, first)
    assert.equal(calls, 1)
    now += 86400001
    fail = true
    assert.deepEqual(await getHolidaysInRange(range), first)
    assert.equal(calls, 2)
    assert.deepEqual(await getHolidaysInRange({ from: '2027-01-01', to: '2027-12-31' }), [])
    assert.equal(calls, 3)
    await getHolidaysInRange({ from: '2027-01-01', to: '2027-12-31' })
    assert.equal(calls, 3)
  } finally {
    globalThis.fetch = originalFetch
    Date.now = originalNow
  }
})

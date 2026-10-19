import test from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, checkPassword } from './access.js'

test('fichas sin mínimo; sección con mínimo 8; bcrypt máximo 72 bytes UTF-8', async () => {
  await assert.rejects(hashPassword('x'), /8 caracteres/)
  await assert.rejects(hashPassword('', { minimumLength: 1 }), /Escribí/)
  for (const value of ['x', ' ', 'á'.repeat(36)]) {
    const hash = await hashPassword(value, { minimumLength: 1 })
    assert.equal(await checkPassword(value, hash), true)
  }
  await assert.rejects(hashPassword('á'.repeat(37), { minimumLength: 1 }), /72 bytes/)
  await assert.rejects(hashPassword('x'.repeat(73)), /72 bytes/)
})

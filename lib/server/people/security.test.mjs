import assert from 'node:assert/strict'
import test from 'node:test'
import { File } from 'node:buffer'
import { issueToken, verifyToken, passwordVersion, UNLOCK_SECONDS } from './tokens.js'
import { validateFile, MAX_ATTACHMENT_SIZE } from './fileValidation.js'

const secret = 'a'.repeat(64)
test('desbloqueos rechazan firma adulterada, vencimiento y otro usuario/sesión/ficha/contraseña', () => {
  const binding = JSON.stringify(['user', 'session', passwordVersion('hash'), 'person'])
  const token = issueToken(binding, secret, 1000)
  assert.equal(verifyToken(token, binding, secret, 1001), true)
  assert.equal(verifyToken(`${token}x`, binding, secret, 1001), false)
  assert.equal(verifyToken(token, binding, secret, 1000 + UNLOCK_SECONDS * 1000), false)
  assert.equal(verifyToken(token, binding, 'b'.repeat(64), 1001), false)
  for (const changed of [ ['other', 'session', passwordVersion('hash'), 'person'],
    ['user', 'other', passwordVersion('hash'), 'person'], ['user', 'session', passwordVersion('new'), 'person'],
    ['user', 'session', passwordVersion('hash'), 'other'] ]) {
    assert.equal(verifyToken(token, JSON.stringify(changed), secret, 1001), false)
  }
  assert.equal(verifyToken('malformed', binding, secret), false)
  assert.equal(token.includes('hash'), false)
})

test('valida contenido real, extensión y MIME; rechaza HTML/SVG, vacíos y más de 10 MB', async () => {
  const pdf = new File(['%PDF-1.7\nexample'], 'nota.pdf', { type: 'application/pdf' })
  assert.equal((await validateFile(pdf)).mimeType, 'application/pdf')
  const txt = new File(['hola'], 'nota.txt', { type: 'text/plain' })
  assert.equal((await validateFile(txt)).mimeType, 'text/plain')
  for (const file of [new File(['<script>alert(1)</script>'], 'nota.pdf', { type: 'application/pdf' }),
    new File(['%PDF-1.7\nexample'], 'nota.png', { type: 'image/png' }),
    new File(['<svg/>'], 'nota.svg', { type: 'image/svg+xml' }),
    new File([], 'nota.txt'), new File([new Uint8Array(MAX_ATTACHMENT_SIZE + 1)], 'nota.txt'),
    new File([new Uint8Array([0xff, 0])], 'nota.txt')]) {
    await assert.rejects(validateFile(file))
  }
})

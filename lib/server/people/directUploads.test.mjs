import test from 'node:test'
import assert from 'node:assert/strict'
import { state } from './testing/services.mjs'
import * as actions from '../../../features/people/actions.js'
import { cleanupUploads } from './directUploads.js'
import { peopleContext } from './access.js'
import { uploadAttachmentFile } from '../../../features/people/uploadAttachmentFile.js'
import { File } from 'node:buffer'

process.env.PEOPLE_COOKIE_SECRET = 'direct-upload-test-secret'.repeat(3)

test('subida directa: acceso, tamaño/tipo real, repetición y limpieza de temporales', async () => {
  state.user = 'owner'
  state.tables = { settings: [], people: [{ id: 'person', user_id: 'owner', password_hash: null },
    { id: 'foreign', user_id: 'other', password_hash: null },
    { id: 'locked', user_id: 'owner', password_hash: 'hash' }], person_attachments: [], attachment_uploads: [] }
  state.files.clear()
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => {
    const path = new URL(url).pathname.slice(1)
    const file = state.files.get(path)
    return file ? new Response(file.bytes) : new Response('', { status: 404 })
  }
  try {
    const bytes = Buffer.from('%PDF-1.7\n' + 'x'.repeat(5 * 1024 * 1024))
    const metadata = { personId: 'person', title: 'Documento', fileName: 'nota.pdf', mimeType: 'application/pdf', size: bytes.length }
    assert.equal((await actions.createAttachmentUpload({ ...metadata, personId: 'foreign' })).ok, false)
    assert.equal((await actions.createAttachmentUpload({ ...metadata, personId: 'locked' })).ok, false)
    for (const invalid of [{ size: 11 * 1024 * 1024 }, { size: 0 }, { size: 1.5 }, { mimeType: 'text/html' }, { fileName: 'a.exe' }, { fileName: 'a.__proto__', mimeType: '' }, { fileName: 'a.constructor', mimeType: '' }]) {
      assert.equal((await actions.createAttachmentUpload({ ...metadata, ...invalid })).ok, false)
    }
    const created = await actions.createAttachmentUpload(metadata)
    assert.equal(created.ok, true)
    assert.deepEqual(Object.keys(created.data).sort(), ['path', 'token', 'uploadId'])
    state.files.set(created.data.path, { bytes, type: metadata.mimeType })
    state.user = 'other'
    assert.equal((await actions.confirmAttachmentUpload({ uploadId: created.data.uploadId })).ok, false)
    state.user = 'owner'
    const confirmed = await actions.confirmAttachmentUpload({ uploadId: created.data.uploadId })
    assert.equal(confirmed.ok, true)
    assert.equal(confirmed.data.size, bytes.length)
    assert.equal(confirmed.data.mimeType, metadata.mimeType)
    assert.equal(state.files.has(created.data.path), false)
    assert.equal(confirmed.data.url.includes('/pending/'), false)
    const retry = await actions.confirmAttachmentUpload({ uploadId: created.data.uploadId })
    assert.equal(retry.data.id, confirmed.data.id)
    assert.equal(state.tables.person_attachments.length, 1)

    // A signed upload token can recreate staging until it expires; cleanup only removes staging.
    state.files.set(created.data.path, { bytes, type: metadata.mimeType })
    const intent = state.tables.attachment_uploads[0]
    intent.cleanup_after = '2000-01-01T00:00:00Z'
    await cleanupUploads(await peopleContext())
    assert.equal(state.files.has(created.data.path), false)
    assert.equal(state.files.has(state.tables.person_attachments[0].storage_path), true)

    for (const actual of [{ bytes: Buffer.from('fake pdf bytes'), type: 'application/pdf' },
      { bytes: Buffer.from('%PDF-1.7\nx'), type: 'image/png' },
      { bytes: Buffer.from('%PDF-1.7\nx'), type: 'application/pdf', declaredSize: 999 }]) {
      const upload = await actions.createAttachmentUpload({ ...metadata, size: actual.declaredSize ?? actual.bytes.length })
      state.files.set(upload.data.path, actual)
      const result = await actions.confirmAttachmentUpload({ uploadId: upload.data.uploadId })
      assert.equal(result.ok, false)
      assert.equal(state.files.has(upload.data.path), false)
      assert.equal(state.tables.person_attachments.length, 1)
    }
    const file = new File([bytes], 'helper.pdf', { type: 'application/pdf' })
    const helperObject = await uploadAttachmentFile({ personId: 'person', title: 'Helper', file })
    assert.equal(helperObject.ok, true, JSON.stringify(helperObject))
    const form = new FormData()
    form.set('personId', 'person')
    form.set('title', 'FormData')
    form.set('file', file)
    const helperForm = await uploadAttachmentFile(form)
    assert.equal(helperForm.ok, true)
    assert.equal(helperForm.data.title, 'FormData')
    const untyped = await uploadAttachmentFile({ personId: 'person', title: 'Sin MIME', file: new File([bytes], 'untyped.pdf') })
    assert.equal(untyped.ok, true)
    const expiresLocked = await actions.createAttachmentUpload(metadata)
    state.tables.people[0].password_hash = 'new-password'
    assert.equal((await actions.confirmAttachmentUpload({ uploadId: expiresLocked.data.uploadId })).ok, false)
    state.tables.people[0].password_hash = null
    const expired = await actions.createAttachmentUpload(metadata)
    state.tables.attachment_uploads.find((row) => row.id === expired.data.uploadId).expires_at = '2000-01-01T00:00:00Z'
    assert.equal((await actions.confirmAttachmentUpload({ uploadId: expired.data.uploadId })).ok, false)
    state.tables.settings.push({ user_id: 'owner', people_password_hash: 'hash' })
    assert.equal((await actions.createAttachmentUpload(metadata)).ok, false)
    assert.equal((await actions.confirmAttachmentUpload({ uploadId: expired.data.uploadId })).ok, false)
    state.user = null
    assert.equal((await actions.createAttachmentUpload(metadata)).ok, false)
  } finally { globalThis.fetch = originalFetch }
})

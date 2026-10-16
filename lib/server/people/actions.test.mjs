// Run with: node --experimental-loader ./lib/server/people/testing/loader.mjs --test lib/server/people/actions.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import { File } from 'node:buffer'
import { state } from './testing/services.mjs'
import * as actions from '../../../features/people/actions.js'
import { getPeople, isPeopleSectionUnlocked } from '../../../features/people/api.js'

process.env.PEOPLE_COOKIE_SECRET = 'test-secret-'.repeat(6)

test('contrato y autorización: sección, ficha, adjuntos, sesión y aislamiento de dueño', async () => {
  const sectionHash = await bcrypt.hash('section123', 4)
  const personHash = await bcrypt.hash('person123', 4)
  state.tables = {
    settings: [{ user_id: 'owner', people_lock_enabled: true, people_password_hash: sectionHash }],
    people: [{ id: 'protected', user_id: 'owner', name: 'Persona', position: 0, has_password: true,
      password_hash: personHash, content: { type: 'doc', content: [] } },
    { id: 'other', user_id: 'other-user', name: 'Ajena', password_hash: null }],
    person_attachments: [{ id: 'att', user_id: 'owner', person_id: 'protected', title: 'Nota',
      storage_path: 'owner/protected/note.pdf', file_name: 'note.pdf', mime_type: 'application/pdf', size: 40 }],
  }
  assert.equal(await isPeopleSectionUnlocked(), false)
  await assert.rejects(getPeople(), /Desbloqueá/)
  assert.equal((await actions.getPerson({ id: 'protected', password: 'person123' })).ok, false)
  assert.equal((await actions.unlockPeopleSection('bad')).error, 'La contraseña no es correcta.')
  assert.deepEqual(await actions.unlockPeopleSection('section123'), { ok: true, data: { unlocked: true } })
  assert.equal(await isPeopleSectionUnlocked(), true)
  const cookie = state.cookies.get('oj-people-unlock')
  assert.equal(cookie.options.httpOnly, true)
  assert.equal(cookie.options.sameSite, 'strict')
  assert.equal(cookie.options.maxAge, 1800)
  assert.deepEqual(await getPeople(), [{ id: 'protected', name: 'Persona', position: 0, hasPassword: true }])
  assert.equal((await actions.getPerson({ id: 'protected' })).error, 'Esta ficha tiene contraseña.')
  assert.equal((await actions.getPerson({ id: 'protected', password: 'bad' })).error, 'La contraseña de la ficha no es correcta.')
  assert.equal((await actions.getAttachments('protected')).ok, false)
  assert.equal((await actions.savePersonContent({ id: 'protected', content: { type: 'doc' } })).ok, false)
  const person = await actions.getPerson({ id: 'protected', password: 'person123' })
  assert.equal(person.ok, true)
  assert.equal(Object.hasOwn(person.data, 'password_hash'), false)
  const attachments = await actions.getAttachments('protected')
  assert.equal(attachments.ok, true)
  assert.equal(attachments.data[0].url, 'https://storage.test/owner/protected/note.pdf?ttl=300')
  assert.equal(Object.hasOwn(attachments.data[0], 'storage_path'), false)
  assert.equal((await actions.savePersonContent({ id: 'protected', content: { type: 'doc' } })).ok, true)
  assert.equal((await actions.getPerson({ id: 'other' })).ok, false)
  assert.equal((await actions.deletePerson('other')).ok, false)
  assert.equal((await actions.setPersonPassword({ id: 'protected', currentPassword: 'bad', newPassword: 'changed123' })).ok, false)
  const changed = await actions.setPersonPassword({ id: 'protected', currentPassword: 'person123', newPassword: 'changed123' })
  assert.deepEqual(changed, { ok: true, data: { hasPassword: true } })
  assert.equal(await bcrypt.compare('changed123', state.tables.people[0].password_hash), true)
  const created = await actions.createPerson({ name: ' Nueva ' })
  assert.equal(created.ok, true)
  assert.equal(created.data.name, 'Nueva')
  assert.equal((await actions.renamePerson({ id: created.data.id, name: 'Renombrada' })).data.name, 'Renombrada')
  const form = new FormData()
  form.set('personId', 'protected')
  form.set('title', 'Documento')
  form.set('file', new File(['%PDF-1.7\nexample'], 'nota.pdf', { type: 'application/pdf' }))
  const uploaded = await actions.uploadAttachment(form)
  assert.equal(uploaded.ok, true)
  assert.equal(uploaded.data.personId, 'protected')
  assert.equal(uploaded.data.mimeType, 'application/pdf')
  assert.equal((await actions.renameAttachment({ id: uploaded.data.id, title: 'Otro título' })).data.title, 'Otro título')
  assert.deepEqual(await actions.deleteAttachment(uploaded.data.id), { ok: true, data: { id: uploaded.data.id } })
  assert.deepEqual(await actions.deletePerson(created.data.id), { ok: true, data: { id: created.data.id } })
  state.tables.people[0].password_hash = await bcrypt.hash('different', 4)
  assert.equal((await actions.getAttachments('protected')).ok, false)
  state.session = 'new-session'
  assert.equal(await isPeopleSectionUnlocked(), false)
  state.session = 'session-1'
  state.tables.settings[0].people_password_hash = await bcrypt.hash('newsection', 4)
  assert.equal(await isPeopleSectionUnlocked(), false)
  state.user = null
  assert.equal((await actions.unlockPeopleSection('newsection')).error, 'Necesitás iniciar sesión.')
})

'use server'

import { actionSuccess } from '@/lib/server/actionResult'
import { peopleAction } from '@/lib/server/people/action'
import {
  peopleContext, grantAccess, loadPerson, requirePersonGrant,
  checkPassword, hashPassword, toPerson, requireName, checkResult,
} from '@/lib/server/people/access'
import { listAttachments, uploadFile, attachmentContext, removeFiles, toAttachment } from '@/lib/server/people/attachments'

export async function unlockPeopleSection(password) {
  return peopleAction(async () => {
    const context = await peopleContext({ requireSection: false })
    const hash = context.settings?.people_password_hash
    if (hash && !await checkPassword(password, hash)) throw new Error('La contraseña no es correcta.')
    if (hash) grantAccess(context)
    return actionSuccess({ unlocked: true })
  })
}

export async function getPerson({ id, password } = {}) {
  return peopleAction(async () => {
    const context = await peopleContext()
    const person = await loadPerson(context, id)
    if (person.password_hash) {
      if (!password) throw new Error('Esta ficha tiene contraseña.')
      if (!await checkPassword(password, person.password_hash)) throw new Error('La contraseña de la ficha no es correcta.')
    }
    // Also replaces the previous active tab grant when this tab has no password.
    grantAccess(context, person)
    return actionSuccess({ ...toPerson(person), content: person.content })
  })
}

export async function createPerson({ name } = {}) {
  return peopleAction(async () => {
    const context = await peopleContext()
    const row = checkResult(await context.admin.from('people').select('position')
      .eq('user_id', context.user.id).order('position', { ascending: false }).limit(1), 'No se pudo crear la ficha.')
    const person = checkResult(await context.admin.from('people').insert({ user_id: context.user.id,
      name: requireName(name), position: (row[0]?.position ?? -1) + 1,
    }).select('id, name, position, has_password').single(), 'No se pudo crear la ficha.')
    return actionSuccess(toPerson(person))
  })
}

export async function renamePerson({ id, name } = {}) {
  return peopleAction(async () => {
    const context = await peopleContext()
    await loadPerson(context, id)
    const person = checkResult(await context.admin.from('people').update({ name: requireName(name) })
      .eq('user_id', context.user.id).eq('id', id).select('id, name, position, has_password').single(), 'No se pudo renombrar la ficha.')
    return actionSuccess(toPerson(person))
  })
}

export async function reorderPeople(ids) {
  return peopleAction(async () => {
    const context = await peopleContext()
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string') || new Set(ids).size !== ids.length) {
      throw new Error('El orden de las fichas no es válido.')
    }
    checkResult(await context.admin.rpc('reorder_people', { owner_id: context.user.id, person_ids: ids }), 'No se pudo guardar el orden de las fichas.')
    return { ok: true }
  })
}

export async function deletePerson(id) {
  return peopleAction(async () => {
    const context = await peopleContext()
    await loadPerson(context, id)
    const rows = checkResult(await context.admin.from('person_attachments').select('storage_path')
      .eq('user_id', context.user.id).eq('person_id', id), 'No se pudieron cargar los adjuntos.')
    await removeFiles(context, rows.map((row) => row.storage_path))
    checkResult(await context.admin.from('people').delete().eq('user_id', context.user.id).eq('id', id), 'No se pudo borrar la ficha.')
    return actionSuccess({ id })
  })
}

export async function savePersonContent({ id, content } = {}) {
  return peopleAction(async () => {
    const context = await peopleContext()
    const person = await loadPerson(context, id)
    requirePersonGrant(context, person)
    if (content !== null && (typeof content !== 'object' || Array.isArray(content) || content.type !== 'doc')) {
      throw new Error('El contenido de la ficha no es válido.')
    }
    if (Buffer.byteLength(JSON.stringify(content)) > 1024 * 1024) throw new Error('La ficha es demasiado grande.')
    const row = checkResult(await context.admin.from('people').update({ content: content ?? { type: 'doc', content: [] } })
      .eq('user_id', context.user.id).eq('id', id).select('id, updated_at').single(), 'No se pudo guardar la ficha.')
    return actionSuccess({ id: row.id, updatedAt: row.updated_at })
  })
}

export async function setPersonPassword({ id, currentPassword, newPassword } = {}) {
  return peopleAction(async () => {
    const context = await peopleContext()
    const person = await loadPerson(context, id)
    if (person.password_hash && !await checkPassword(currentPassword, person.password_hash)) throw new Error('La contraseña actual no es correcta.')
    const passwordHash = newPassword === null ? null : await hashPassword(newPassword)
    checkResult(await context.admin.from('people').update({ password_hash: passwordHash, has_password: passwordHash !== null })
      .eq('user_id', context.user.id).eq('id', id), 'No se pudo guardar la contraseña de la ficha.')
    grantAccess(context, { ...person, password_hash: passwordHash })
    return actionSuccess({ hasPassword: passwordHash !== null })
  })
}

export async function getAttachments(personId) {
  return peopleAction(async () => actionSuccess(await listAttachments(await peopleContext(), personId)))
}

export async function uploadAttachment(formData) {
  return peopleAction(async () => actionSuccess(await uploadFile(await peopleContext(), formData)))
}

export async function renameAttachment({ id, title } = {}) {
  return peopleAction(async () => {
    const { context, attachment } = await attachmentContext(id)
    const row = checkResult(await context.admin.from('person_attachments').update({ title: requireName(title) })
      .eq('user_id', context.user.id).eq('id', attachment.id).select('*').single(), 'No se pudo renombrar el adjunto.')
    return actionSuccess(await toAttachment(context, row))
  })
}

export async function deleteAttachment(id) {
  return peopleAction(async () => {
    const { context, attachment } = await attachmentContext(id)
    await removeFiles(context, [attachment.storage_path])
    checkResult(await context.admin.from('person_attachments').delete().eq('user_id', context.user.id)
      .eq('id', attachment.id), 'No se pudo borrar el adjunto.')
    return actionSuccess({ id })
  })
}

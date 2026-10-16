import 'server-only'
import { randomUUID } from 'node:crypto'
import { peopleContext, loadPerson, requirePersonGrant, checkResult, requireName } from './access'
import { validateFile } from './fileValidation'

export async function toAttachment(context, row) {
  const signed = checkResult(await context.admin.storage.from('attachments').createSignedUrl(row.storage_path, 300), 'No se pudo generar el enlace del adjunto.')
  return { id: row.id, personId: row.person_id, title: row.title, fileName: row.file_name,
    mimeType: row.mime_type, size: row.size, url: signed.signedUrl, createdAt: row.created_at }
}

export async function listAttachments(context, personId) {
  const person = await loadPerson(context, personId)
  requirePersonGrant(context, person)
  const rows = checkResult(await context.admin.from('person_attachments').select('*')
    .eq('user_id', context.user.id).eq('person_id', person.id).order('created_at', { ascending: false }), 'No se pudieron cargar los adjuntos.')
  return Promise.all(rows.map((row) => toAttachment(context, row)))
}

export async function attachmentContext(id) {
  const context = await peopleContext()
  const attachment = checkResult(await context.admin.from('person_attachments').select('*')
    .eq('user_id', context.user.id).eq('id', id).maybeSingle(), 'No se encontró el adjunto.')
  if (!attachment) throw new Error('No se encontró el adjunto.')
  requirePersonGrant(context, await loadPerson(context, attachment.person_id))
  return { context, attachment }
}

export async function removeFiles(context, paths) {
  // Bound requests for large collections. Errors preserve metadata for retry.
  for (let index = 0; index < paths.length; index += 100) {
    checkResult(await context.admin.storage.from('attachments').remove(paths.slice(index, index + 100)), 'No se pudieron borrar los archivos.')
  }
}

export async function uploadFile(context, formData) {
  if (!(formData instanceof FormData)) throw new Error('El adjunto no es válido.')
  const person = await loadPerson(context, formData.get('personId'))
  requirePersonGrant(context, person)
  const file = formData.get('file')
  const { bytes, mimeType, extension } = await validateFile(file)
  const title = requireName(formData.get('title') || file.name)
  const path = `${context.user.id}/${person.id}/${randomUUID()}.${extension}`
  checkResult(await context.admin.storage.from('attachments').upload(path, bytes, { contentType: mimeType, upsert: false }), 'No se pudo subir el adjunto.')
  const result = await context.admin.from('person_attachments').insert({ user_id: context.user.id,
    person_id: person.id, title, file_name: file.name, mime_type: mimeType, size: bytes.length, storage_path: path,
  }).select('*').single()
  if (result.error) {
    await removeFiles(context, [path])
    throw new Error('No se pudo guardar el adjunto.')
  }
  return toAttachment(context, result.data)
}

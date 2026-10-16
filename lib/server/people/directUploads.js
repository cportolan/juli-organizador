import 'server-only'
import { randomUUID } from 'node:crypto'
import { checkResult, loadPerson, requirePersonGrant, requireName } from './access'
import { validateUploadMetadata } from './fileValidation'
import { inspectUpload } from './inspectUpload'
import { removeFiles, toAttachment } from './attachments'

export async function cleanupUploads(context) {
  const result = await context.admin.from('attachment_uploads').select('*')
    .eq('user_id', context.user.id).lt('cleanup_after', new Date().toISOString()).limit(20)
  if (result.error) return // Best effort; failures are retried on the next upload/list.
  for (const upload of result.data) {
    try {
      // Check metadata, not status: a response may have failed after INSERT committed.
      const attachment = checkResult(await context.admin.from('person_attachments').select('id')
        .eq('user_id', context.user.id).eq('id', upload.id).maybeSingle(), 'No se pudo revisar la subida.')
      await removeFiles(context, attachment ? [upload.staging_path] : [upload.staging_path, upload.final_path])
      checkResult(await context.admin.from('attachment_uploads').delete().eq('user_id', context.user.id)
        .eq('id', upload.id), 'No se pudo limpiar la subida.')
    } catch { /* Keep intent so cleanup can retry. */ }
  }
}

export async function createUpload(context, { personId, title, fileName, mimeType, size } = {}) {
  requirePersonGrant(context, await loadPerson(context, personId))
  const metadata = validateUploadMetadata({ fileName, mimeType, size })
  const name = requireName(title || fileName)
  await cleanupUploads(context)
  const id = randomUUID()
  const stagingPath = `${context.user.id}/${personId}/pending/${id}.${metadata.extension}`
  const finalPath = `${context.user.id}/${personId}/${id}.${metadata.extension}`
  checkResult(await context.admin.from('attachment_uploads').insert({ id, user_id: context.user.id,
    person_id: personId, title: name, file_name: fileName, mime_type: metadata.mimeType, size,
    staging_path: stagingPath, final_path: finalPath,
  }), 'No se pudo preparar la subida.')
  const signed = checkResult(await context.admin.storage.from('attachments')
    .createSignedUploadUrl(stagingPath, { upsert: false }), 'No se pudo autorizar la subida.')
  return { uploadId: id, path: signed.path, token: signed.token }
}

export async function confirmUpload(context, uploadId) {
  if (typeof uploadId !== 'string') throw new Error('La subida no es válida.')
  const upload = checkResult(await context.admin.from('attachment_uploads').select('*')
    .eq('user_id', context.user.id).eq('id', uploadId).maybeSingle(), 'No se pudo consultar la subida.')
  if (!upload?.person_id) throw new Error('No se encontró la subida.')
  requirePersonGrant(context, await loadPerson(context, upload.person_id))
  // Idempotent retries never create a second attachment or inspect an expired staging file.
  const existing = checkResult(await context.admin.from('person_attachments').select('*')
    .eq('user_id', context.user.id).eq('id', uploadId).maybeSingle(), 'No se pudo consultar el adjunto.')
  if (existing) return toAttachment(context, existing)
  if (new Date(upload.expires_at).getTime() <= Date.now()) throw new Error('La autorización de subida venció. Volvé a adjuntar el archivo.')
  const claimed = checkResult(await context.admin.from('attachment_uploads').update({ status: 'confirming' })
    .eq('user_id', context.user.id).eq('id', uploadId).eq('status', 'pending').select('id').maybeSingle(), 'No se pudo confirmar la subida.')
  if (!claimed) throw new Error('La subida ya se está confirmando o fue rechazada.')
  let attachment
  try {
    const { size, mimeType } = await inspectUpload(context, upload)
    checkResult(await context.admin.storage.from('attachments').copy(upload.staging_path, upload.final_path), 'No se pudo guardar el archivo verificado.')
    attachment = checkResult(await context.admin.from('person_attachments').insert({ id: uploadId,
      user_id: context.user.id, person_id: upload.person_id, title: upload.title, file_name: upload.file_name,
      mime_type: mimeType, size, storage_path: upload.final_path,
    }).select('*').single(), 'No se pudo guardar el adjunto.')
  } catch (error) {
    // Resolve ambiguous INSERT failures before deleting anything that may be confirmed.
    const saved = await context.admin.from('person_attachments').select('*')
      .eq('user_id', context.user.id).eq('id', uploadId).maybeSingle()
    if (saved.error) throw new Error('No se pudo confirmar el resultado de la subida. Intentá nuevamente.')
    if (saved.data) attachment = saved.data
    else {
      await context.admin.from('attachment_uploads').update({ status: 'rejected' }).eq('user_id', context.user.id).eq('id', uploadId)
      await removeFiles(context, [upload.staging_path, upload.final_path])
      throw error
    }
  }
  // Keep the intent until the signed upload token expires: it can recreate staging.
  await context.admin.from('attachment_uploads').update({ status: 'confirmed' }).eq('user_id', context.user.id).eq('id', uploadId)
  await removeFiles(context, [upload.staging_path])
  return toAttachment(context, attachment)
}

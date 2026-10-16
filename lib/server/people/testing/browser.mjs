import { state } from './services.mjs'

export function createClient() {
  return { storage: { from: () => ({ uploadToSignedUrl: async (path, token, file) => {
    state.files.set(path, { bytes: Buffer.from(await file.arrayBuffer()), type: file.type || 'application/octet-stream' })
    return { data: {} }
  } }) } }
}

import { randomUUID } from 'node:crypto'

export const state = { user: 'owner', session: 'session-1', tables: {}, cookies: new Map(), files: new Map() }
export async function cookies() {
  return {
    get: (name) => state.cookies.get(name),
    set: (name, value, options) => state.cookies.set(name, { value, options }),
  }
}
export async function createClient() {
  return { auth: {
    getUser: async () => ({ data: { user: state.user ? { id: state.user } : null } }),
    getSession: async () => ({ data: { session: { access_token: `x.${Buffer.from(JSON.stringify({ session_id: state.session })).toString('base64url')}.x` } } }),
  } }
}

class Query {
  constructor(table) { this.table = table; this.filters = []; this.operation = 'select' }
  select(columns = '*') { this.columns = columns; return this }
  eq(key, value) { this.filters.push((row) => row[key] === value); return this }
  lt(key, value) { this.filters.push((row) => row[key] < value); return this }
  order() { return this }
  limit() { return this }
  update(values) { this.operation = 'update'; this.values = values; return this }
  insert(values) { this.operation = 'insert'; this.values = values; return this }
  delete() { this.operation = 'delete'; return this }
  maybeSingle() { this.singleRow = true; return this }
  single() { this.singleRow = true; return this }
  then(resolve) {
    let rows = (state.tables[this.table] ?? []).filter((row) => this.filters.every((filter) => filter(row)))
    if (this.operation === 'update') rows.forEach((row) => Object.assign(row, this.values, { updated_at: 'now' }))
    if (this.operation === 'delete') state.tables[this.table] = state.tables[this.table].filter((row) => !rows.includes(row))
    if (this.operation === 'insert') {
      rows = [{ id: randomUUID(), has_password: false, password_hash: null, content: {}, status: 'pending', expires_at: new Date(Date.now() + 7200000).toISOString(), cleanup_after: new Date(Date.now() + 10800000).toISOString(), ...this.values }]
      state.tables[this.table] ??= []
      state.tables[this.table].push(...rows)
    }
    const projected = rows.map((row) => this.columns && this.columns !== '*'
      ? Object.fromEntries(this.columns.split(',').map((key) => [key.trim(), row[key.trim()]])) : { ...row })
    return Promise.resolve({ data: this.singleRow ? projected[0] ?? null : projected, error: null }).then(resolve)
  }
}

export function createAdminClient() {
  return { from: (table) => new Query(table), storage: { from: () => ({
    createSignedUrl: async (file, ttl) => ({ data: { signedUrl: `https://storage.test/${file}?ttl=${ttl}` } }),
    upload: async () => ({ data: {} }),
    remove: async (paths) => { paths.forEach((file) => state.files.delete(file)); return { data: {} } },
    createSignedUploadUrl: async (file) => ({ data: { path: file, token: 'upload-token' } }),
    info: async (file) => state.files.has(file)
      ? { data: { size: state.files.get(file).bytes.length, contentType: state.files.get(file).type } }
      : { error: { message: 'not found' } },
    copy: async (source, destination) => { state.files.set(destination, state.files.get(source)); return { data: {} } },
  }) } }
}

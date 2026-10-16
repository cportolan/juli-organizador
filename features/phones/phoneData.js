export const PHONE_COLUMNS = 'id, office, agent, phone, created_at, updated_at'

export function toPhone(row) {
  return {
    id: row.id,
    office: row.office,
    agent: row.agent,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toPhoneRow(input) {
  const data = input ?? {}
  return {
    office: normalizeOptionalText(data.office),
    agent: normalizeOptionalText(data.agent),
    phone: normalizeOptionalText(data.phone),
  }
}

function normalizeOptionalText(value) {
  if (value === null || value === undefined) return null
  const normalized = String(value).trim()
  return normalized || null
}

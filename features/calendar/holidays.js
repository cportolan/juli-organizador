// Cache by year, coalesce concurrent requests and retain the last good response.
const years = new Map()
const DAY = 86400000

async function getYear(year) {
  const previous = years.get(year)
  if (previous?.pending) return previous.pending
  if (previous && previous.expires > Date.now()) return previous.data
  const entry = previous ?? { data: [] }
  entry.pending = (async () => {
    try {
      const response = await fetch(`https://api.argentinadatos.com/v1/feriados/${year}`, {
        next: { revalidate: 86400 }, signal: AbortSignal.timeout(3000),
      })
      if (!response.ok) throw new Error('Holiday request failed')
      const data = await response.json()
      if (!Array.isArray(data) || data.some((item) =>
        !item || !/^\d{4}-\d{2}-\d{2}$/.test(item.fecha) ||
        !item.fecha.startsWith(`${year}-`) || typeof item.nombre !== 'string' || typeof item.tipo !== 'string')) {
        throw new Error('Invalid holiday response')
      }
      entry.data = data.map(({ fecha, nombre, tipo }) => ({ date: fecha, name: nombre, type: tipo }))
      entry.expires = Date.now() + DAY
    } catch {
      entry.expires = Date.now() + 60000
    } finally {
      entry.pending = null
    }
    return entry.data
  })()
  years.set(year, entry)
  return entry.pending
}

export async function getHolidaysInRange({ from, to }) {
  const first = Number(from.slice(0, 4))
  const last = Number(to.slice(0, 4))
  const results = await Promise.all(Array.from({ length: last - first + 1 }, (_, index) => getYear(first + index)))
  return results.flat().filter(({ date }) => date >= from && date <= to).sort((a, b) => a.date.localeCompare(b.date))
}

export async function recurrenceHolidays(from, to) {
  // Include adjacent months/years for occurrences shifted across range boundaries.
  const start = new Date(new Date(from).getTime() - 32 * DAY).toISOString().slice(0, 10)
  const end = new Date(new Date(to).getTime() + 32 * DAY).toISOString().slice(0, 10)
  return new Set((await getHolidaysInRange({ from: start, to: end })).map(({ date }) => date))
}

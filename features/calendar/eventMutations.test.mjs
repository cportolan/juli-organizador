import test from 'node:test'
import assert from 'node:assert/strict'
import { updateOneOccurrence, updateFollowing, deleteOneOccurrence, deleteFollowing } from './eventMutations.js'
import { toStoredEvent } from './eventData.js'
import { expandEvent } from './recurrence.js'

function database() {
  const rows = [{ id: 'root', title: 'Pago', type: 'event', start_at: '2026-04-01T13:00:00Z',
    end_at: '2026-04-01T14:00:00Z', all_day: false, exdates: [],
    rrule: 'FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=1;COUNT=4' }]
  return { rows, from() {
    let operation = 'select', payload
    const filters = []
    const query = {
      select() { return this },
      eq(key, value) { filters.push((row) => row[key] === value); return this },
      gte(key, value) { filters.push((row) => row[key] >= value); return this },
      update(value) { operation = 'update'; payload = value; return this },
      insert(value) { operation = 'insert'; payload = value; return this },
      upsert(value) { operation = 'insert'; payload = value; return this },
      delete() { operation = 'delete'; return this },
      single() { return this.execute(true) },
      maybeSingle() { return this.execute(true) },
      then(resolve, reject) { return this.execute(false).then(resolve, reject) },
      async execute(single) {
        let found = rows.filter((row) => filters.every((filter) => filter(row)))
        if (operation === 'insert') { found = [{ id: 'new', ...payload }]; rows.push(...found) }
        if (operation === 'update') found.forEach((row) => Object.assign(row, payload))
        if (operation === 'delete') found.forEach((row) => rows.splice(rows.indexOf(row), 1))
        return { data: single ? found[0] ?? null : found, error: null }
      },
    }
    return query
  } }
}

test('this/following con fecha corrida: edición, excepción y borrado mantienen la serie', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => ({ ok: true, json: async () => url.endsWith('/2026')
    ? [{ fecha: '2026-05-01', nombre: 'Día del trabajador', tipo: 'inamovible' },
      { fecha: '2026-07-31', nombre: 'Feriado de prueba', tipo: 'puente' }] : [] })
  const holidays = new Set(['2026-05-01'])
  const occurrences = (db) => db.rows.flatMap((row) => expandEvent(toStoredEvent(row), '2026-04-01', '2026-08-01', holidays))
  try {
    {
      const db = database(), root = toStoredEvent(db.rows[0])
      const result = await updateOneOccurrence(db, { id: 'owner' }, root, root, '2026-05-04', { title: 'Modificado' })
      assert.equal(result.error, undefined)
      assert.deepEqual(db.rows[0].exdates, ['2026-05-01'])
      assert.equal(result.event.recurrenceId, '2026-05-01')
      assert.equal(result.event.startAt, '2026-05-04T13:00:00.000Z')
      const edited = await updateOneOccurrence(db, { id: 'owner' }, toStoredEvent(db.rows[0]), result.event, '2026-05-04', { title: 'Otra edición' })
      assert.equal(edited.event.title, 'Otra edición')
      assert.equal(db.rows.length, 2)
      await deleteOneOccurrence(db, toStoredEvent(db.rows[0]), edited.event, '2026-05-04')
      assert.equal(occurrences(db).some((event) => event.occurrenceDate === '2026-05-04'), false)
    }
    {
      const db = database(), root = toStoredEvent(db.rows[0])
      const result = await updateFollowing(db, { id: 'owner' }, root, '2026-05-04', { title: 'Desde mayo' })
      assert.equal(result.error, undefined)
      assert.match(db.rows[0].rrule, /COUNT=1/)
      assert.match(db.rows[1].rrule, /COUNT=3/)
      const events = occurrences(db)
      assert.equal(events.length, 4)
      assert.equal(events.find((event) => event.occurrenceDate === '2026-05-04').title, 'Desde mayo')
    }
    {
      const db = database()
      const result = await deleteFollowing(db, toStoredEvent(db.rows[0]), '2026-05-04')
      assert.equal(result.error, undefined)
      assert.deepEqual(occurrences(db).map((event) => event.occurrenceDate), ['2026-04-01'])
    }
    {
      const db = database()
      db.rows[0].rrule = 'FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=1;UNTIL=20260501T130000Z'
      const result = await updateFollowing(db, { id: 'owner' }, toStoredEvent(db.rows[0]), '2026-05-04', { title: 'Con fin' })
      assert.equal(result.error, undefined)
      assert.equal(occurrences(db).length, 2)
    }
    {
      const db = database()
      Object.assign(db.rows[0], { start_at: '2026-04-30T13:00:00Z', end_at: '2026-04-30T14:00:00Z',
        rrule: 'FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1;COUNT=4' })
      const result = await updateFollowing(db, { id: 'owner' }, toStoredEvent(db.rows[0]), '2026-07-30', { title: 'Último hábil' })
      assert.equal(result.error, undefined)
      assert.match(db.rows[0].rrule, /COUNT=3/)
      assert.match(db.rows[1].rrule, /COUNT=1/)
      const shifted = expandEvent(toStoredEvent(db.rows[1]), '2026-07-30T03:00:00Z', '2026-07-31T03:00:00Z', new Set(['2026-07-31']))
      assert.equal(shifted[0].occurrenceDate, '2026-07-30')
      await deleteFollowing(db, toStoredEvent(db.rows[1]), '2026-07-30')
      assert.equal(db.rows.length, 1)
    }
  } finally { globalThis.fetch = originalFetch }
})

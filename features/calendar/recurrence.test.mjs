import assert from 'node:assert/strict'
import test from 'node:test'
import { canonicalizeRrule, expandEvent, findOccurrenceStart, splitRrule } from './recurrence.js'

const baseEvent = {
  id: 'event-id',
  title: 'Evento recurrente',
  startAt: '2026-01-05T13:00:00.000Z',
  endAt: '2026-01-05T14:00:00.000Z',
  exdates: [],
  recurrenceId: null,
}

test('expande intervalo, días semanales y cantidad máxima', () => {
  const rrule = canonicalizeRrule(
    'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=4',
    baseEvent.startAt,
  )
  const occurrences = expandEvent(
    { ...baseEvent, rrule },
    '2026-01-01T00:00:00.000Z',
    '2026-02-01T00:00:00.000Z',
  )

  assert.deepEqual(
    occurrences.map(({ occurrenceDate }) => occurrenceDate),
    ['2026-01-05', '2026-01-07', '2026-01-19', '2026-01-21'],
  )
})

test('respeta el fin hasta una fecha', () => {
  const rrule = canonicalizeRrule(
    'FREQ=DAILY;INTERVAL=3;UNTIL=20260114T130000Z',
    baseEvent.startAt,
  )
  const occurrences = expandEvent(
    { ...baseEvent, rrule },
    '2026-01-01T00:00:00.000Z',
    '2026-02-01T00:00:00.000Z',
  )

  assert.equal(occurrences.length, 4)
  assert.equal(canonicalizeRrule(rrule, baseEvent.startAt), rrule)
})

test('admite repeticiones sin fin con intervalos mensuales y anuales', () => {
  for (const frequency of ['MONTHLY', 'YEARLY']) {
    const rrule = canonicalizeRrule(
      `FREQ=${frequency};INTERVAL=2`,
      baseEvent.startAt,
    )
    assert.match(rrule, new RegExp(`FREQ=${frequency}`))
    assert.match(rrule, /INTERVAL=2/)
    assert.doesNotMatch(rrule, /COUNT|UNTIL/)
  }
})

test('al cortar una serie conserva intervalo, días y repeticiones restantes', () => {
  const event = {
    ...baseEvent,
    rrule: canonicalizeRrule(
      'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=4',
      baseEvent.startAt,
    ),
  }
  const split = splitRrule(
    event,
    new Date('2026-01-19T13:00:00.000Z'),
    new Date('2026-01-19T13:00:00.000Z'),
  )

  assert.match(split.nextRrule, /INTERVAL=2/)
  assert.match(split.nextRrule, /BYDAY=MO,WE/)
  assert.match(split.nextRrule, /COUNT=2/)
})

test('evalúa BYDAY y occurrenceDate en la fecha local de Buenos Aires', () => {
  const mondayAtTen = {
    ...baseEvent,
    startAt: '2026-01-06T01:00:00.000Z',
    endAt: '2026-01-06T02:00:00.000Z',
  }
  const rrule = canonicalizeRrule('FREQ=WEEKLY;BYDAY=MO;COUNT=2', mondayAtTen.startAt)
  const occurrences = expandEvent(
    { ...mondayAtTen, rrule },
    '2026-01-05T00:00:00.000Z',
    '2026-01-20T00:00:00.000Z',
  )

  assert.deepEqual(
    occurrences.map(({ startAt, occurrenceDate }) => [startAt, occurrenceDate]),
    [
      ['2026-01-06T01:00:00.000Z', '2026-01-05'],
      ['2026-01-13T01:00:00.000Z', '2026-01-12'],
    ],
  )
  assert.equal(
    findOccurrenceStart({ ...mondayAtTen, rrule }, '2026-01-12')?.toISOString(),
    '2026-01-13T01:00:00.000Z',
  )
})

test('mantiene la fecha local de los eventos de día completo', () => {
  const allDayEvent = {
    ...baseEvent,
    allDay: true,
    startAt: '2026-01-05T03:00:00.000Z',
    endAt: '2026-01-06T03:00:00.000Z',
  }
  const rrule = canonicalizeRrule('FREQ=DAILY;COUNT=2', allDayEvent.startAt)
  const occurrences = expandEvent(
    { ...allDayEvent, rrule },
    '2026-01-05T00:00:00.000Z',
    '2026-01-08T00:00:00.000Z',
  )

  assert.deepEqual(
    occurrences.map(({ startAt, occurrenceDate }) => [startAt, occurrenceDate]),
    [
      ['2026-01-05T03:00:00.000Z', '2026-01-05'],
      ['2026-01-06T03:00:00.000Z', '2026-01-06'],
    ],
  )
})

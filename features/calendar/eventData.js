export const EVENT_COLUMNS = 'id, title, description, type, start_at, end_at, all_day, color, location, rrule, exdates, series_id, recurrence_id, created_at, updated_at'

export function toStoredEvent(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    startAt: row.start_at,
    endAt: row.end_at,
    allDay: row.all_day,
    color: row.color,
    location: row.location,
    rrule: row.rrule,
    exdates: row.exdates ?? [],
    seriesId: row.series_id,
    recurrenceId: row.recurrence_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toPublicEvent(event) {
  const { recurrenceId: _recurrenceId, ...publicEvent } = event
  return publicEvent
}

export function toEventRow(event) {
  return {
    title: event.title,
    description: event.description,
    type: event.type,
    start_at: event.startAt,
    end_at: event.endAt,
    all_day: event.allDay,
    color: event.color,
    location: event.location,
    rrule: event.rrule,
    exdates: event.exdates,
  }
}

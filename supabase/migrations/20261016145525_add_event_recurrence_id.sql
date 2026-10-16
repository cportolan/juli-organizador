alter table public.events
  add column recurrence_id date,
  add constraint events_exception_identity check ((series_id is null) = (recurrence_id is null));

create unique index events_exception_occurrence_idx
  on public.events (user_id, series_id, recurrence_id);

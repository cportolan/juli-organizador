-- Sensitive tables are reachable exclusively through authenticated server code.
revoke all on public.people, public.person_attachments from public, anon, authenticated;
grant select, insert, update, delete on public.people, public.person_attachments, public.settings to service_role;

-- A table-level SELECT/UPDATE grant overrides column restrictions: revoke it first.
revoke all on public.settings from public, anon, authenticated;
grant select (id, user_id, primary_color, theme_mode, heading_font, body_font,
  people_lock_enabled, created_at, updated_at) on public.settings to authenticated;
grant insert (user_id, primary_color, theme_mode, heading_font, body_font)
  on public.settings to authenticated;
grant update (primary_color, theme_mode, heading_font, body_font)
  on public.settings to authenticated;

-- RLS remains enabled. Storage must not bypass the section/person passwords.
drop policy "attachments_select_own" on storage.objects;
drop policy "attachments_insert_own" on storage.objects;
drop policy "attachments_update_own" on storage.objects;
drop policy "attachments_delete_own" on storage.objects;
create policy attachments_server_only on storage.objects as restrictive
  for all to anon, authenticated
  using (bucket_id <> 'attachments') with check (bucket_id <> 'attachments');

-- Reordering is atomic, validates the full set, and is not a public RPC.
create function public.reorder_people(owner_id uuid, person_ids uuid[])
returns void language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 0));
  if person_ids is null
    or cardinality(person_ids) <> (select count(*) from public.people where user_id = owner_id)
    or cardinality(person_ids) <> (select count(distinct id) from unnest(person_ids) as ids(id))
    or exists (select 1 from unnest(person_ids) as ids(id)
      where not exists (select 1 from public.people p where p.id = ids.id and p.user_id = owner_id)) then
    raise exception 'Invalid person order';
  end if;
  update public.people p set position = ordering.ordinality - 1
    from unnest(person_ids) with ordinality as ordering(id, ordinality)
    where p.id = ordering.id and p.user_id = owner_id;
end;
$$;
revoke all on function public.reorder_people(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.reorder_people(uuid, uuid[]) to service_role;

alter table public.people add constraint people_password_consistent
  check (has_password = (password_hash is not null));

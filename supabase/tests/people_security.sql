-- Run against a disposable database after all migrations: psql -v ON_ERROR_STOP=1 -f ...
begin;
insert into auth.users (id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.settings (user_id, people_password_hash, people_lock_enabled)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'private-hash', true);
insert into public.people (id, user_id, name, position) values
('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'One', 0),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Two', 1),
('33333333-3333-4333-8333-333333333333', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Other', 0);

insert into storage.objects(bucket_id, name, owner_id)
values ('attachments', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/file.pdf', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
-- A future permissive policy must not reopen this bucket.
create policy people_test_permissive on storage.objects for all to authenticated using (true) with check (true);
do $$
begin
  if has_column_privilege('anon', 'public.people', 'content', 'SELECT')
    or has_column_privilege('authenticated', 'public.people', 'password_hash', 'SELECT')
    or has_column_privilege('authenticated', 'public.settings', 'people_password_hash', 'UPDATE') then
    raise exception 'SECURITY FAILURE: sensitive column privileges';
  end if;
end;
$$;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);
do $$
begin
  perform people_lock_enabled from public.settings;
  begin
    perform people_password_hash from public.settings;
    raise exception 'SECURITY FAILURE: readable section hash';
  exception when insufficient_privilege then null; end;
  begin
    perform content, password_hash from public.people;
    raise exception 'SECURITY FAILURE: readable people secrets';
  exception when insufficient_privilege then null; end;
  begin
    update public.settings set people_lock_enabled = false;
    raise exception 'SECURITY FAILURE: client can disable section';
  exception when insufficient_privilege then null; end;
  begin
    perform * from public.person_attachments;
    raise exception 'SECURITY FAILURE: readable attachments';
  exception when insufficient_privilege then null; end;
  begin
    perform public.reorder_people('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '{}'::uuid[]);
    raise exception 'SECURITY FAILURE: public reorder RPC';
  exception when insufficient_privilege then null; end;
  if exists (select 1 from storage.objects where bucket_id = 'attachments') then
    raise exception 'SECURITY FAILURE: readable storage';
  end if;
  begin
    insert into storage.objects(bucket_id, name) values ('attachments', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/file.pdf');
    raise exception 'SECURITY FAILURE: writable storage';
  exception when insufficient_privilege then null; end;
  update public.settings set theme_mode = 'dark';
end;
$$;
reset role;
set local role service_role;
select public.reorder_people('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', array[
  '22222222-2222-4222-8222-222222222222'::uuid, '11111111-1111-4111-8111-111111111111'::uuid]);
do $$
begin
  if (select position from public.people where id = '22222222-2222-4222-8222-222222222222') <> 0 then
    raise exception 'Reorder failed';
  end if;
  begin
    perform public.reorder_people('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', array[
      '11111111-1111-4111-8111-111111111111'::uuid, '33333333-3333-4333-8333-333333333333'::uuid]);
    raise exception 'SECURITY FAILURE: cross-user reorder';
  exception when raise_exception then
    if sqlerrm <> 'Invalid person order' then raise; end if;
  end;
  begin
    perform public.reorder_people('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', array[
      '11111111-1111-4111-8111-111111111111'::uuid, '11111111-1111-4111-8111-111111111111'::uuid]);
    raise exception 'SECURITY FAILURE: duplicate reorder';
  exception when raise_exception then
    if sqlerrm <> 'Invalid person order' then raise; end if;
  end;
end;
$$;
rollback;

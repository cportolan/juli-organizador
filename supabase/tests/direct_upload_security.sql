begin;
do $$
begin
  if has_table_privilege('authenticated', 'public.attachment_uploads', 'SELECT')
    or has_table_privilege('authenticated', 'public.attachment_uploads', 'INSERT')
    or has_table_privilege('anon', 'public.attachment_uploads', 'SELECT') then
    raise exception 'SECURITY FAILURE: upload intents are public';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.attachment_uploads'::regclass) then
    raise exception 'SECURITY FAILURE: upload intents lack RLS';
  end if;
  if (select file_size_limit from storage.buckets where id = 'attachments') <> 10485760 then
    raise exception 'Bucket size limit is incorrect';
  end if;
end;
$$;
insert into auth.users(id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
insert into public.people(id, user_id, name) values ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Test');
set local role service_role;
insert into public.attachment_uploads(id, user_id, person_id, title, file_name, mime_type, size, staging_path, final_path)
values ('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Test', 'test.pdf', 'application/pdf', 10485760, 'test/pending/test.pdf', 'test/test.pdf');
do $$
begin
  begin
    update public.attachment_uploads set size = 10485761;
    raise exception 'SECURITY FAILURE: excessive declared size accepted';
  exception when check_violation then null; end;
end;
$$;
delete from public.people where id = '11111111-1111-4111-8111-111111111111';
do $$
begin
  if not exists (select 1 from public.attachment_uploads where person_id is null and staging_path = 'test/pending/test.pdf') then
    raise exception 'Deleting a person lost the staging cleanup record';
  end if;
end;
$$;
rollback;

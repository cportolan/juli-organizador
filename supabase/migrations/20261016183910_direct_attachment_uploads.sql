-- Upload intents are private; signed tokens only grant INSERT to one staging path.
create table public.attachment_uploads (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  title text not null,
  file_name text not null,
  mime_type text not null,
  size bigint not null check (size between 1 and 10485760),
  staging_path text not null unique,
  final_path text not null unique,
  status text not null default 'pending' check (status in ('pending', 'confirming', 'confirmed', 'rejected')),
  expires_at timestamptz not null default now() + interval '2 hours',
  cleanup_after timestamptz not null default now() + interval '3 hours',
  created_at timestamptz not null default now()
);
create index attachment_uploads_user_cleanup_idx on public.attachment_uploads(user_id, cleanup_after);
alter table public.attachment_uploads enable row level security;
revoke all on public.attachment_uploads from public, anon, authenticated;
grant select, insert, update, delete on public.attachment_uploads to service_role;
-- Enforce the real limit even when a client lies about size before uploading.
update storage.buckets set file_size_limit = 10485760 where id = 'attachments';

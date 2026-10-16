create extension if not exists pgcrypto;

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  primary_color text not null default '#9dc3a5' check (primary_color ~ '^#[0-9a-fA-F]{6}$'),
  theme_mode text not null default 'system' check (theme_mode in ('light', 'dark', 'system')),
  heading_font text not null default 'lora' check (heading_font in ('lora', 'fraunces', 'playfair', 'dm-serif')),
  body_font text not null default 'roboto' check (body_font in ('roboto', 'inter', 'nunito', 'dm-sans')),
  people_lock_enabled boolean not null default false,
  people_password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  type text not null default 'event' check (type in ('event', 'birthday', 'meeting')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean not null default false,
  color text,
  location text,
  rrule text,
  exdates date[] not null default '{}',
  series_id uuid references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (end_at >= start_at)
);

create table public.day_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table public.phones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  office text,
  agent text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.todo_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#c98f9b' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'done')),
  category_id uuid references public.todo_categories(id) on delete set null,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  has_password boolean not null default false,
  password_hash text,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.person_attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  title text not null,
  file_name text not null,
  mime_type text,
  size bigint,
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_user_start_idx on public.events (user_id, start_at);
create index day_notes_user_date_idx on public.day_notes (user_id, date);
create index phones_user_idx on public.phones (user_id);
create index todos_user_status_idx on public.todos (user_id, status);
create index todos_user_created_idx on public.todos (user_id, created_at desc);
create index people_user_position_idx on public.people (user_id, position);
create index attachments_user_person_idx on public.person_attachments (user_id, person_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['settings', 'events', 'day_notes', 'phones', 'todo_categories', 'todos', 'people', 'person_attachments'] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', table_name || '_updated_at', table_name);
  end loop;
end;
$$;

alter table public.settings enable row level security;
alter table public.events enable row level security;
alter table public.day_notes enable row level security;
alter table public.phones enable row level security;
alter table public.todo_categories enable row level security;
alter table public.todos enable row level security;
alter table public.people enable row level security;
alter table public.person_attachments enable row level security;

grant select, insert, update, delete on table
  public.settings,
  public.events,
  public.day_notes,
  public.phones,
  public.todo_categories,
  public.todos,
  public.people,
  public.person_attachments
to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['settings', 'events', 'day_notes', 'phones', 'todo_categories', 'todos', 'people', 'person_attachments'] loop
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)', table_name || '_select_own', table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', table_name || '_insert_own', table_name);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name || '_update_own', table_name);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', table_name || '_delete_own', table_name);
  end loop;
end;
$$;

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do update set public = excluded.public;

create policy "attachments_select_own" on storage.objects
for select to authenticated
using (
  bucket_id = 'attachments'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "attachments_insert_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'attachments'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "attachments_update_own" on storage.objects
for update to authenticated
using (
  bucket_id = 'attachments'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'attachments'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "attachments_delete_own" on storage.objects
for delete to authenticated
using (
  bucket_id = 'attachments'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

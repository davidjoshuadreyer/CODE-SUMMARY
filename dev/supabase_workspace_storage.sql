-- Run once in the existing project's Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xsscvdooviztaxzuwbmr/sql/new
-- Also allow https://tesselate.ca/index.html under Authentication > URL Configuration.
-- Private, append-only restore points. Existing quiz/world tables are unaffected.
begin;
create table if not exists public.tesselate_workspace_snapshots (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace jsonb not null check (jsonb_typeof(workspace) = 'object'),
  files jsonb not null check (jsonb_typeof(files) = 'array'),
  created_at timestamptz not null default now()
);
create index if not exists workspace_snapshots_user_created
  on public.tesselate_workspace_snapshots (user_id, created_at desc);
alter table public.tesselate_workspace_snapshots enable row level security;
revoke all on public.tesselate_workspace_snapshots from anon, authenticated;
grant select, insert on public.tesselate_workspace_snapshots to authenticated;
drop policy if exists workspace_read_own on public.tesselate_workspace_snapshots;
create policy workspace_read_own on public.tesselate_workspace_snapshots
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists workspace_insert_own on public.tesselate_workspace_snapshots;
create policy workspace_insert_own on public.tesselate_workspace_snapshots
  for insert to authenticated with check (user_id = (select auth.uid()));
insert into storage.buckets (id, name, public, file_size_limit)
values ('workspace-references', 'workspace-references', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;
drop policy if exists workspace_files_read_own on storage.objects;
create policy workspace_files_read_own on storage.objects
  for select to authenticated
  using (bucket_id = 'workspace-references' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists workspace_files_insert_own on storage.objects;
create policy workspace_files_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'workspace-references' and (storage.foldername(name))[1] = (select auth.uid())::text);
commit;

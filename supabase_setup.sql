-- Run this in your Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/xsscvdooviztaxzuwbmr/sql/new
--
-- Also add these to Authentication > URL Configuration > Redirect URLs:
--   https://tesselate.ca/Chem_Quiz.html
--   https://tesselate.ca/Matrix_Quiz.html

create table if not exists public.tesselate_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.tesselate_progress enable row level security;

create policy "own_select" on public.tesselate_progress
  for select using (auth.uid() = user_id);

create policy "own_insert" on public.tesselate_progress
  for insert with check (auth.uid() = user_id);

create policy "own_update" on public.tesselate_progress
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own_delete" on public.tesselate_progress
  for delete using (auth.uid() = user_id);

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

drop policy if exists "own_select" on public.tesselate_progress;
drop policy if exists "own_insert" on public.tesselate_progress;
drop policy if exists "own_update" on public.tesselate_progress;
drop policy if exists "own_delete" on public.tesselate_progress;

create policy "own_select" on public.tesselate_progress
  for select using (auth.uid() = user_id);

create policy "own_insert" on public.tesselate_progress
  for insert with check (auth.uid() = user_id);

create policy "own_update" on public.tesselate_progress
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own_delete" on public.tesselate_progress
  for delete using (auth.uid() = user_id);

-- ─── Cafe gamification tables (Phase 0+) ────────────────────────────────────

create table if not exists public.players (
  id uuid primary key,                           -- matches localStorage tesselatePlayerId
  display_name text not null default 'Guest',
  avatar_config jsonb not null default '{}'::jsonb,  -- { color, hat, accessory, owned_items }
  beans integer not null default 0,
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

alter table public.players enable row level security;

drop policy if exists "players_all" on public.players;
create policy "players_all" on public.players
  for all using (true) with check (true);
-- Note: anonymous access is intentional — players are identified by a client-held UUID.
-- Tighten this policy (e.g. with a shared secret header) before adding sensitive data.

create table if not exists public.player_achievements (
  player_id uuid not null references public.players(id) on delete cascade,
  achievement_id text not null,
  earned_at timestamptz not null default now(),
  primary key (player_id, achievement_id)
);

alter table public.player_achievements enable row level security;

drop policy if exists "achievements_all" on public.player_achievements;
create policy "achievements_all" on public.player_achievements
  for all using (true) with check (true);

create table if not exists public.bean_transactions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.bean_transactions enable row level security;

drop policy if exists "beans_all" on public.bean_transactions;
create policy "beans_all" on public.bean_transactions
  for all using (true) with check (true);

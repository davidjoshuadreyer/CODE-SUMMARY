-- Private, independently versioned study records. No service key in the client.
create table if not exists public.tesselate_study_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (length(key) between 1 and 180),
  value jsonb not null check (jsonb_typeof(value) = 'object'),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.tesselate_study_items enable row level security;
revoke all on public.tesselate_study_items from anon;
grant select, insert, update on public.tesselate_study_items to authenticated;
create policy study_read_own on public.tesselate_study_items for select to authenticated using ((select auth.uid()) = user_id);
create policy study_insert_own on public.tesselate_study_items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy study_update_own on public.tesselate_study_items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Seed personal preferences separately in the dashboard, never in public source.

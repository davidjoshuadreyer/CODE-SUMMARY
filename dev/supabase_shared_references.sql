-- Curated course references for every signed-in user. Personal study rows stay private.
create table if not exists public.tesselate_shared_reference_items (
  key text primary key check (key ~ '^(reference/[a-z0-9-]+|refpage/[a-z0-9-]+/[0-9]+)$'),
  value jsonb not null check (jsonb_typeof(value) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.tesselate_shared_reference_items enable row level security;
revoke all on public.tesselate_shared_reference_items from anon, authenticated;
grant select on public.tesselate_shared_reference_items to authenticated;
-- Repeatable without changing the policies on any personal table.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public'
      and tablename='tesselate_shared_reference_items' and policyname='shared_reference_read') then
    create policy shared_reference_read on public.tesselate_shared_reference_items
      for select to authenticated using (true);
  end if;
end $$;
-- Populate only explicitly approved reference keys in a separate admin transaction.
-- Never copy settings, progress, topic notes, or arbitrary personal uploads here.

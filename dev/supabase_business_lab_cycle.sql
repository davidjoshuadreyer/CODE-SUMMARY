-- Business Lab cycle key: lets a scheduled research cycle read and replace
-- ONE record (business-lab/portfolio-v1) for ONE account, without a service
-- key and without signing in as that account.
--
-- Run once in the Supabase SQL editor, after dev/supabase_study_plan.sql.
-- Safe to re-run.
--
-- How it works
-- * The signed-in owner creates a random key in business-lab.html. Only its
--   SHA-256 hash is stored here; the key itself is shown once and never saved.
-- * The cycle calls business_lab_cycle_read / business_lab_cycle_write with the
--   public (anon) API key plus the cycle key. Both functions only ever touch the
--   business-lab/portfolio-v1 row of the account that owns the key.
-- * Writes use the same optimistic revision check as the page, so a stale cycle
--   cannot overwrite a newer save from the page or from another model.
-- * Creating a new key replaces the old one. Deleting the row turns cycle
--   access off.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.tesselate_business_lab_keys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
alter table public.tesselate_business_lab_keys enable row level security;
revoke all on public.tesselate_business_lab_keys from anon, authenticated;
-- The owner may create, replace or delete their own key hash, and see when it
-- was made or last used. Nobody can read another account's row. (A SHA-256
-- hash of a 256-bit random key cannot be turned back into the key.)
grant select, insert (user_id, key_hash, created_at, last_used_at), update (key_hash, created_at, last_used_at), delete
  on public.tesselate_business_lab_keys to authenticated;
drop policy if exists lab_key_read_own on public.tesselate_business_lab_keys;
drop policy if exists lab_key_insert_own on public.tesselate_business_lab_keys;
drop policy if exists lab_key_update_own on public.tesselate_business_lab_keys;
drop policy if exists lab_key_delete_own on public.tesselate_business_lab_keys;
create policy lab_key_read_own on public.tesselate_business_lab_keys for select to authenticated using ((select auth.uid()) = user_id);
create policy lab_key_insert_own on public.tesselate_business_lab_keys for insert to authenticated with check ((select auth.uid()) = user_id);
create policy lab_key_update_own on public.tesselate_business_lab_keys for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy lab_key_delete_own on public.tesselate_business_lab_keys for delete to authenticated using ((select auth.uid()) = user_id);

-- Resolve a cycle key to its owner. Raises the same error for every bad key.
create or replace function public.business_lab_cycle_owner(p_key text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid;
begin
  if p_key is null or length(p_key) < 32 or length(p_key) > 200 then
    raise exception 'Invalid cycle key' using errcode = '28000';
  end if;
  update public.tesselate_business_lab_keys
     set last_used_at = now()
   where key_hash = encode(extensions.digest(convert_to(p_key, 'UTF8'), 'sha256'), 'hex')
  returning user_id into v_owner;
  if v_owner is null then
    raise exception 'Invalid cycle key' using errcode = '28000';
  end if;
  return v_owner;
end;
$$;
revoke all on function public.business_lab_cycle_owner(text) from public, anon, authenticated;

-- Read the saved lab: {"revision": n, "value": {...}} or {"revision": 0, "value": null}.
create or replace function public.business_lab_cycle_read(p_key text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid := public.business_lab_cycle_owner(p_key);
  v_row public.tesselate_study_items;
begin
  select * into v_row from public.tesselate_study_items
   where user_id = v_owner and key = 'business-lab/portfolio-v1';
  if not found then
    return jsonb_build_object('revision', 0, 'value', null);
  end if;
  return jsonb_build_object('revision', v_row.revision, 'value', v_row.value, 'updated_at', v_row.updated_at);
end;
$$;

-- Replace the saved lab. p_revision is the revision the cycle read (0 = none
-- saved yet). Returns the new revision, or raises 'Lab changed' on a conflict.
create or replace function public.business_lab_cycle_write(p_key text, p_value jsonb, p_revision integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid := public.business_lab_cycle_owner(p_key);
  v_next integer;
begin
  if p_value is null or jsonb_typeof(p_value) <> 'object' or (p_value->>'schema') not in ('1', '2') then
    raise exception 'The lab must be a schema 1 or 2 object' using errcode = '22023';
  end if;
  if octet_length(p_value::text) > 2500000 then
    raise exception 'The lab is over 2.5 MB' using errcode = '22023';
  end if;
  if p_revision is null or p_revision < 0 then
    raise exception 'Invalid revision' using errcode = '22023';
  end if;
  if p_revision = 0 then
    insert into public.tesselate_study_items (user_id, key, value, revision, updated_at)
    values (v_owner, 'business-lab/portfolio-v1', p_value, 1, now())
    on conflict (user_id, key) do nothing
    returning revision into v_next;
  else
    update public.tesselate_study_items
       set value = p_value, revision = revision + 1, updated_at = now()
     where user_id = v_owner and key = 'business-lab/portfolio-v1' and revision = p_revision
    returning revision into v_next;
  end if;
  if v_next is null then
    raise exception 'Lab changed since it was read' using errcode = '40001';
  end if;
  return v_next;
end;
$$;

revoke all on function public.business_lab_cycle_read(text) from public;
revoke all on function public.business_lab_cycle_write(text, jsonb, integer) from public;
grant execute on function public.business_lab_cycle_read(text) to anon, authenticated;
grant execute on function public.business_lab_cycle_write(text, jsonb, integer) to anon, authenticated;

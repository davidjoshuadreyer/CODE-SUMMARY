-- Checks dev/supabase_business_lab_cycle.sql against a plain Postgres 16 with a
-- tiny Supabase shim (anon/authenticated roles, auth.users, auth.uid()).
-- See the header of dev/business-lab-cycle-test.cjs for how to run it.
\set ON_ERROR_STOP 1
\set A '''00000000-0000-0000-0000-00000000000a'''
\set B '''00000000-0000-0000-0000-00000000000b'''
\set KA '''key-for-account-a-0123456789abcdefghij'''
\set KB '''key-for-account-b-0123456789abcdefghij'''

-- Owner A, signed in, stores the hash of a new key and has a study row.
set role authenticated; select set_config('request.jwt.claim.sub', :A, false) as _jwt \gset
insert into public.tesselate_business_lab_keys(user_id,key_hash) values (:A, encode(extensions.digest(convert_to(:KA,'UTF8'),'sha256'),'hex'));
insert into public.tesselate_study_items(user_id,key,value) values (:A,'topic/private','{"secret":true}');
-- A cannot plant a key for B.
do $$ begin insert into public.tesselate_business_lab_keys(user_id,key_hash) values ('00000000-0000-0000-0000-00000000000b',repeat('a',64)); raise exception 'wrote B row'; exception when insufficient_privilege then null; end $$;
select set_config('request.jwt.claim.sub', :B, false) as _jwt \gset
insert into public.tesselate_business_lab_keys(user_id,key_hash) values (:B, encode(extensions.digest(convert_to(:KB,'UTF8'),'sha256'),'hex'));
select count(*) = 1 as b_sees_only_own from public.tesselate_business_lab_keys \gset
\if :b_sees_only_own \else \echo 'FAIL: B saw other rows' \quit \endif
reset role;

-- The cycle uses the anon role.
set role anon; select set_config('request.jwt.claim.sub', '', false) as _jwt \gset
do $$ begin perform 1 from public.tesselate_study_items; raise exception 'anon read study items'; exception when insufficient_privilege then null; end $$;
do $$ begin perform 1 from public.tesselate_business_lab_keys; raise exception 'anon read keys'; exception when insufficient_privilege then null; end $$;
do $$ begin perform public.business_lab_cycle_owner('key-for-account-a-0123456789abcdefghij'); raise exception 'anon called owner()'; exception when insufficient_privilege then null; end $$;
do $$ begin perform public.business_lab_cycle_read('wrong-key-0123456789abcdefghijklmnop'); raise exception 'bad key accepted'; exception when sqlstate '28000' then null; end $$;
do $$ begin perform public.business_lab_cycle_read('short'); raise exception 'short key accepted'; exception when sqlstate '28000' then null; end $$;

select (public.business_lab_cycle_read(:KA)) = '{"revision":0,"value":null}'::jsonb as empty_ok \gset
\if :empty_ok \else \echo 'FAIL: empty read' \quit \endif
do $$ begin perform public.business_lab_cycle_write('key-for-account-a-0123456789abcdefghij','{"schema":0}',0); raise exception 'bad schema accepted'; exception when sqlstate '22023' then null; end $$;
do $$ begin perform public.business_lab_cycle_write('key-for-account-a-0123456789abcdefghij','[1]',0); raise exception 'array accepted'; exception when sqlstate '22023' then null; end $$;
do $$ begin perform public.business_lab_cycle_write('key-for-account-a-0123456789abcdefghij','{"schema":"2"}',0); raise exception 'string schema accepted'; exception when sqlstate '22023' then null; end $$;
do $$ begin perform public.business_lab_cycle_write('key-for-account-a-0123456789abcdefghij','{"n":1}',0); raise exception 'missing schema accepted'; exception when sqlstate '22023' then null; end $$;
select public.business_lab_cycle_write(:KA,'{"schema":2,"n":1}',0) = 1 as first_ok \gset
\if :first_ok \else \echo 'FAIL: first write' \quit \endif
do $$ begin perform public.business_lab_cycle_write('key-for-account-a-0123456789abcdefghij','{"schema":2,"n":9}',0); raise exception 'second insert accepted'; exception when sqlstate '40001' then null; end $$;
select public.business_lab_cycle_write(:KA,'{"schema":3,"n":2}',1) = 2 as second_ok \gset
\if :second_ok \else \echo 'FAIL: second write' \quit \endif
do $$ begin perform public.business_lab_cycle_write('key-for-account-a-0123456789abcdefghij','{"schema":2,"n":9}',1); raise exception 'stale write accepted'; exception when sqlstate '40001' then null; end $$;
select (public.business_lab_cycle_read(:KA))->'value'->>'n' = '2' and (public.business_lab_cycle_read(:KB))->>'revision' = '0' as isolated \gset
\if :isolated \else \echo 'FAIL: accounts not isolated' \quit \endif
reset role;

-- Only the lab row of account A changed; its other study data is untouched.
select (select count(*) from public.tesselate_study_items) = 2
   and (select value->>'n' from public.tesselate_study_items where user_id=:A and key='business-lab/portfolio-v1') = '2'
   and (select value from public.tesselate_study_items where key='topic/private') = '{"secret":true}'::jsonb
   and (select last_used_at is not null from public.tesselate_business_lab_keys where user_id=:A) as scoped \gset
\if :scoped \else \echo 'FAIL: write touched other rows' \quit \endif

-- Owner A can rotate or remove the key; the old key then stops working.
set role authenticated; select set_config('request.jwt.claim.sub', :A, false) as _jwt \gset
-- Rotation, as the page does it (PostgREST upsert on user_id).
insert into public.tesselate_business_lab_keys(user_id,key_hash,created_at,last_used_at) values (:A, encode(extensions.digest(convert_to('rotated-key-for-a-0123456789abcdefghij','UTF8'),'sha256'),'hex'), now(), null)
  on conflict (user_id) do update set user_id = excluded.user_id, key_hash = excluded.key_hash, created_at = excluded.created_at, last_used_at = excluded.last_used_at;
-- An upsert cannot move the row to another account.
do $$ begin update public.tesselate_business_lab_keys set user_id = '00000000-0000-0000-0000-00000000000b'; raise exception 'moved key to B'; exception when insufficient_privilege or unique_violation then null; end $$;
reset role; set role anon;
do $$ begin perform public.business_lab_cycle_read('key-for-account-a-0123456789abcdefghij'); raise exception 'old key still works after rotation'; exception when sqlstate '28000' then null; end $$;
select (public.business_lab_cycle_read('rotated-key-for-a-0123456789abcdefghij'))->>'revision' = '2' as rotated \gset
\if :rotated \else \echo 'FAIL: rotated key' \quit \endif
reset role; set role authenticated; select set_config('request.jwt.claim.sub', :A, false) as _jwt \gset
delete from public.tesselate_business_lab_keys where user_id = :A;
reset role; set role anon;
do $$ begin perform public.business_lab_cycle_read('rotated-key-for-a-0123456789abcdefghij'); raise exception 'removed key still works'; exception when sqlstate '28000' then null; end $$;
reset role;
\echo 'PASS: cycle key SQL (hash only, owner-only key rows, rotation by upsert, anon cannot read tables, bad, rotated and removed keys refused, one row per account, revision conflicts, other data untouched)'

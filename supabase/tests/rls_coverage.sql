-- pgtap: verify every user-data table has RLS enabled and at least one policy.
-- Run: `supabase test db`

begin;
select plan(2);

-- All public tables except explicitly-exempted ones must have RLS enabled.
select results_eq(
  $$ select c.relname::text
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relkind = 'r'
       and c.relrowsecurity = false
       and c.relname not in ('spatial_ref_sys') $$,
  $$ values (null::text) limit 0 $$,
  'every public table has RLS enabled'
);

-- Every table with RLS must have at least one policy, except service-role-only tables.
select results_eq(
  $$ select c.relname::text
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relkind = 'r'
       and c.relrowsecurity = true
       and c.relname not in ('audit_log','stripe_events')
       and not exists (select 1 from pg_policies p where p.schemaname='public' and p.tablename=c.relname) $$,
  $$ values (null::text) limit 0 $$,
  'every RLS-enabled table (except service-role-only) has at least one policy'
);

select * from finish();
rollback;

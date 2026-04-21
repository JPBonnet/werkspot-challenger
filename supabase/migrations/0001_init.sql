-- Werkspot Challenger — initial schema (v1)
-- Run locally: `supabase db reset`
-- Migration 0001_init: core tables + enums + indexes + RLS policies.

create extension if not exists "pgcrypto";
create extension if not exists "postgis";
create extension if not exists "pg_trgm";

-- ─────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────

create type profile_role_enum as enum ('customer', 'professional', 'admin');
create type subscription_tier_enum as enum ('none', 'starter', 'growth', 'scale');
create type job_status_enum as enum ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected');
create type job_urgency_enum as enum ('low', 'normal', 'high', 'emergency');
create type job_source_enum as enum ('web', 'mobile', 'voice', 'b2b');
create type quote_status_enum as enum ('pending', 'accepted', 'rejected', 'expired');
create type payment_status_enum as enum ('pending', 'held', 'released', 'refunded', 'disputed');
create type subsidy_scheme_enum as enum ('ISDE', 'SEEH', 'BTW_REDUCED', 'OTHER');
create type notification_channel_enum as enum ('push', 'email', 'sms');

-- ─────────────────────────────────────────────────────────────
-- profiles (1:1 with auth.users)
-- ─────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role profile_role_enum not null default 'customer',
  full_name text,
  phone text,
  locale text default 'nl-NL',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index profiles_phone_idx on public.profiles (phone) where deleted_at is null;
alter table public.profiles enable row level security;

-- ─────────────────────────────────────────────────────────────
-- professionals
-- ─────────────────────────────────────────────────────────────

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique not null references public.profiles(id) on delete cascade,
  business_name text not null,
  kvk_number text unique,
  btw_number text,
  kvk_verified_at timestamptz,
  services_offered text[] not null default '{}',
  service_radius_km int not null default 25 check (service_radius_km between 1 and 200),
  hourly_rate_cents int,
  rating numeric(3,2) not null default 0 check (rating between 0 and 5),
  completed_jobs int not null default 0,
  stripe_account_id text,
  subscription_tier subscription_tier_enum not null default 'none',
  base_geo geography(point, 4326),
  is_active bool not null default true,
  created_at timestamptz not null default now()
);
create index professionals_base_geo_gix on public.professionals using gist (base_geo);
create index professionals_services_gin on public.professionals using gin (services_offered);
alter table public.professionals enable row level security;

-- ─────────────────────────────────────────────────────────────
-- customers
-- ─────────────────────────────────────────────────────────────

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique not null references public.profiles(id) on delete cascade,
  default_postal_code text,
  household_type text
);
alter table public.customers enable row level security;

-- ─────────────────────────────────────────────────────────────
-- service_categories
-- ─────────────────────────────────────────────────────────────

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.service_categories(id),
  slug text unique not null,
  name_nl text not null,
  icon text,
  is_energy_transition bool not null default false
);
alter table public.service_categories enable row level security;

-- ─────────────────────────────────────────────────────────────
-- jobs
-- ─────────────────────────────────────────────────────────────

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  professional_id uuid references public.professionals(id),
  category_id uuid not null references public.service_categories(id),
  title text not null,
  description text,
  address_line text,
  city text,
  postal_code text,
  geo geography(point, 4326),
  status job_status_enum not null default 'pending',
  urgency job_urgency_enum not null default 'normal',
  source job_source_enum not null default 'mobile',
  estimated_price_cents int,
  final_price_cents int,
  ai_quote_range_min_cents int,
  ai_quote_range_max_cents int,
  ai_quote_confidence numeric(3,2),
  photos text[] default '{}',
  created_at timestamptz not null default now(),
  scheduled_at timestamptz,
  completed_at timestamptz
);
create index jobs_status_created_idx on public.jobs (status, created_at desc);
create index jobs_geo_gix on public.jobs using gist (geo);
create index jobs_customer_idx on public.jobs (customer_id);
create index jobs_professional_idx on public.jobs (professional_id);
alter table public.jobs enable row level security;

-- ─────────────────────────────────────────────────────────────
-- job_events (event-sourced audit)
-- ─────────────────────────────────────────────────────────────

create table public.job_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index job_events_job_idx on public.job_events (job_id, created_at desc);
alter table public.job_events enable row level security;

-- ─────────────────────────────────────────────────────────────
-- quotes
-- ─────────────────────────────────────────────────────────────

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  professional_id uuid not null references public.professionals(id),
  amount_cents int not null check (amount_cents > 0),
  breakdown jsonb not null default '[]'::jsonb,
  valid_until timestamptz,
  status quote_status_enum not null default 'pending',
  ai_generated bool not null default false,
  created_at timestamptz not null default now()
);
create index quotes_job_idx on public.quotes (job_id);
alter table public.quotes enable row level security;

-- ─────────────────────────────────────────────────────────────
-- messages
-- ─────────────────────────────────────────────────────────────

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  body_lang text,
  body_translated jsonb not null default '{}'::jsonb,
  attachments text[] default '{}',
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index messages_job_created_idx on public.messages (job_id, created_at);
alter table public.messages enable row level security;

-- ─────────────────────────────────────────────────────────────
-- payments
-- ─────────────────────────────────────────────────────────────

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id),
  stripe_payment_intent text unique,
  stripe_charge text,
  amount_cents int not null,
  commission_cents int not null,
  platform_fee_cents int not null default 0,
  status payment_status_enum not null default 'pending',
  milestone_index int not null default 0,
  released_at timestamptz,
  created_at timestamptz not null default now()
);
create index payments_job_idx on public.payments (job_id);
alter table public.payments enable row level security;

-- ─────────────────────────────────────────────────────────────
-- reviews
-- ─────────────────────────────────────────────────────────────

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid unique not null references public.jobs(id),
  rating int not null check (rating between 1 and 5),
  body text,
  photos text[] default '{}',
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;

-- ─────────────────────────────────────────────────────────────
-- subsidies
-- ─────────────────────────────────────────────────────────────

create table public.subsidies (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id),
  scheme subsidy_scheme_enum not null,
  estimated_amount_cents int,
  status text not null default 'estimated',
  rvo_reference text,
  created_at timestamptz not null default now()
);
alter table public.subsidies enable row level security;

-- ─────────────────────────────────────────────────────────────
-- notifications
-- ─────────────────────────────────────────────────────────────

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  channel notification_channel_enum not null,
  payload jsonb not null,
  sent_at timestamptz,
  read_at timestamptz
);
create index notifications_profile_idx on public.notifications (profile_id, sent_at desc);
alter table public.notifications enable row level security;

-- ─────────────────────────────────────────────────────────────
-- audit_log
-- ─────────────────────────────────────────────────────────────

create table public.audit_log (
  id bigserial primary key,
  actor_id uuid,
  action text not null,
  target_table text not null,
  target_id text,
  before jsonb,
  after jsonb,
  ip inet,
  created_at timestamptz not null default now()
);
create index audit_target_idx on public.audit_log (target_table, target_id, created_at desc);
alter table public.audit_log enable row level security;

-- ─────────────────────────────────────────────────────────────
-- feature_flags
-- ─────────────────────────────────────────────────────────────

create table public.feature_flags (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.feature_flags enable row level security;

-- ─────────────────────────────────────────────────────────────
-- stripe_events (idempotency)
-- ─────────────────────────────────────────────────────────────

create table public.stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;

-- ─────────────────────────────────────────────────────────────
-- postal_code_stats (materialized view)
-- ─────────────────────────────────────────────────────────────

create materialized view public.postal_code_stats as
select
  j.postal_code,
  j.category_id,
  count(*) as job_count,
  avg(j.final_price_cents)::int as avg_price_cents,
  percentile_disc(0.25) within group (order by j.final_price_cents)::int as p25_cents,
  percentile_disc(0.75) within group (order by j.final_price_cents)::int as p75_cents,
  null::text as ai_blurb,
  now() as last_updated
from public.jobs j
where j.status = 'completed' and j.final_price_cents is not null
group by j.postal_code, j.category_id;
create unique index postal_code_stats_pk on public.postal_code_stats (postal_code, category_id);

-- ─────────────────────────────────────────────────────────────
-- RLS policies
-- ─────────────────────────────────────────────────────────────

-- profile_self: read/write own profile
create policy profile_self_select on public.profiles for select using (id = auth.uid());
create policy profile_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- public_pro_card: anon-readable pro card fields via view
create or replace view public.pro_card as
  select id, business_name, rating, completed_jobs, services_offered, is_active
  from public.professionals
  where is_active = true and kvk_verified_at is not null;
grant select on public.pro_card to anon, authenticated;

-- pros: owner read/write own row
create policy pro_owner_select on public.professionals for select using (profile_id = auth.uid());
create policy pro_owner_update on public.professionals for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- customers: owner read/write
create policy customer_owner_select on public.customers for select using (profile_id = auth.uid());
create policy customer_owner_update on public.customers for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- service_categories: public read
create policy categories_public_read on public.service_categories for select using (true);

-- jobs: customer-own + assigned-pro + pro-reads-pending-in-area
create policy customer_own_jobs on public.jobs for select using (
  customer_id in (select id from public.customers where profile_id = auth.uid())
);
create policy customer_insert_jobs on public.jobs for insert with check (
  customer_id in (select id from public.customers where profile_id = auth.uid())
);
create policy customer_update_own_jobs on public.jobs for update using (
  customer_id in (select id from public.customers where profile_id = auth.uid())
);
create policy assigned_pro_read_jobs on public.jobs for select using (
  professional_id in (select id from public.professionals where profile_id = auth.uid())
);
create policy pro_read_pending_in_area on public.jobs for select using (
  status = 'pending' and exists (
    select 1 from public.professionals p
    where p.profile_id = auth.uid()
      and (jobs.category_id::text = any(p.services_offered) or jobs.category_id is null)
      and (jobs.geo is null or p.base_geo is null or
           ST_DWithin(jobs.geo, p.base_geo, p.service_radius_km * 1000))
  )
);

-- job_events: participants only
create policy job_events_participants on public.job_events for select using (
  job_id in (
    select id from public.jobs
    where customer_id in (select id from public.customers where profile_id = auth.uid())
       or professional_id in (select id from public.professionals where profile_id = auth.uid())
  )
);

-- quotes: participants only
create policy quotes_participants_select on public.quotes for select using (
  job_id in (
    select id from public.jobs
    where customer_id in (select id from public.customers where profile_id = auth.uid())
       or professional_id in (select id from public.professionals where profile_id = auth.uid())
  ) or professional_id in (select id from public.professionals where profile_id = auth.uid())
);
create policy quotes_pro_insert on public.quotes for insert with check (
  professional_id in (select id from public.professionals where profile_id = auth.uid())
);

-- messages: participants only
create policy messages_participants_select on public.messages for select using (
  job_id in (
    select id from public.jobs
    where customer_id in (select id from public.customers where profile_id = auth.uid())
       or professional_id in (select id from public.professionals where profile_id = auth.uid())
  )
);
create policy messages_participants_insert on public.messages for insert with check (
  sender_id = auth.uid() and job_id in (
    select id from public.jobs
    where customer_id in (select id from public.customers where profile_id = auth.uid())
       or professional_id in (select id from public.professionals where profile_id = auth.uid())
  )
);

-- payments: participants read only; writes are service-role (webhook)
create policy payments_participants_select on public.payments for select using (
  job_id in (
    select id from public.jobs
    where customer_id in (select id from public.customers where profile_id = auth.uid())
       or professional_id in (select id from public.professionals where profile_id = auth.uid())
  )
);

-- reviews: customer insert after completion; public read on pro profile
create policy reviews_public_select on public.reviews for select using (true);
create policy reviews_customer_insert on public.reviews for insert with check (
  exists (
    select 1 from public.jobs j
    where j.id = job_id
      and j.status = 'completed'
      and j.customer_id in (select id from public.customers where profile_id = auth.uid())
  )
);

-- subsidies: participants only
create policy subsidies_participants_select on public.subsidies for select using (
  job_id in (
    select id from public.jobs
    where customer_id in (select id from public.customers where profile_id = auth.uid())
       or professional_id in (select id from public.professionals where profile_id = auth.uid())
  )
);

-- notifications: owner only
create policy notifications_owner_select on public.notifications for select using (profile_id = auth.uid());
create policy notifications_owner_update on public.notifications for update using (profile_id = auth.uid());

-- audit_log: service-role only (no client policy = effectively denied)
-- feature_flags: public read (payload may hide internals)
create policy feature_flags_public_read on public.feature_flags for select using (true);

-- stripe_events: service-role only

-- ─────────────────────────────────────────────────────────────
-- Profile autoprovision trigger
-- ─────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, coalesce((new.raw_user_meta_data->>'role')::profile_role_enum, 'customer'), new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

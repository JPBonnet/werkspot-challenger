# Data Model — Werkspot Challenger

## Summary

Postgres 16 (Supabase). Conventions: `snake_case`, money in integer cents, `uuid` primary keys (`gen_random_uuid()`), `timestamptz` everywhere, soft-delete via `deleted_at` on user-owned tables. Enums via Postgres native. All user-facing tables have RLS enabled. CI gate fails if any new table lacks a policy (`supabase/tests/rls_coverage.sql` via pgtap).

Cross-reference: [ARCHITECTURE.md](./ARCHITECTURE.md) · [API-SPEC.md](./API-SPEC.md) · [SECURITY-COMPLIANCE.md](./SECURITY-COMPLIANCE.md)

## FK diagram

```
  auth.users
      │
      ▼
  profiles ──► professionals ──► quotes ──┐
      │            │                      ▼
      ├──► customers ──────────────────► jobs ──► job_events
      │            │                      │  ├──► messages ──► (translation)
      │            │                      │  ├──► payments  ──► Stripe
      │            │                      │  ├──► reviews
      │            │                      │  └──► subsidies ──► RVO
      │            ▼                      │
      │         service_categories ◄──────┘
      ▼
  notifications, audit_log, feature_flags, postal_code_stats (matview)
```

## Tables

### `profiles` (1:1 with `auth.users`)
```
id              uuid PK (= auth.users.id)
role            profile_role_enum   -- 'customer' | 'professional' | 'admin'
full_name       text
phone           text
locale          text DEFAULT 'nl-NL'
avatar_url      text
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
deleted_at      timestamptz NULL
```
Indexes: `profiles_phone_idx` (partial `WHERE deleted_at IS NULL`).

### `professionals`
```
id                    uuid PK DEFAULT gen_random_uuid()
profile_id            uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE
business_name         text NOT NULL
kvk_number            text UNIQUE
btw_number            text
kvk_verified_at       timestamptz NULL
services_offered      text[] DEFAULT '{}'
service_radius_km     int DEFAULT 25 CHECK (service_radius_km BETWEEN 1 AND 200)
hourly_rate_cents     int
rating                numeric(3,2) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5)
completed_jobs        int DEFAULT 0
stripe_account_id     text
subscription_tier     subscription_tier_enum DEFAULT 'none'  -- none|starter|growth|scale
base_geo              geography(point,4326)
is_active             bool DEFAULT true
created_at            timestamptz DEFAULT now()
```
Indexes: `professionals_base_geo_gix` GIST; `professionals_services_gin` GIN on `services_offered`.

### `customers`
```
id                    uuid PK
profile_id            uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE
default_postal_code   text
household_type        text  -- owner_occupier | tenant | vve_admin
```

### `service_categories`
```
id                     uuid PK
parent_id              uuid REFERENCES service_categories(id)
slug                   text UNIQUE
name_nl                text NOT NULL
icon                   text
is_energy_transition   bool DEFAULT false
```

### `jobs`
```
id                       uuid PK
customer_id              uuid REFERENCES customers(id)
professional_id          uuid REFERENCES professionals(id) NULL
category_id              uuid REFERENCES service_categories(id)
title                    text
description              text
address_line             text
city                     text
postal_code              text
geo                      geography(point,4326)
status                   job_status_enum  -- pending|accepted|in_progress|completed|cancelled|rejected
urgency                  job_urgency_enum -- low|normal|high|emergency
source                   job_source_enum  -- web|mobile|voice|b2b
estimated_price_cents    int
final_price_cents        int
ai_quote_range_min_cents int
ai_quote_range_max_cents int
ai_quote_confidence      numeric(3,2)
photos                   text[]
created_at               timestamptz DEFAULT now()
scheduled_at             timestamptz
completed_at             timestamptz
```
Indexes: `jobs_status_created_idx` on `(status, created_at DESC)`; `jobs_geo_gix` GIST; `jobs_customer_idx`; `jobs_professional_idx`.

### `job_events` (event-sourced audit)
```
id          uuid PK
job_id      uuid REFERENCES jobs(id) ON DELETE CASCADE
actor_id    uuid REFERENCES profiles(id)
event_type  text  -- created|assigned|quote_submitted|quote_accepted|started|milestone_reached|completed|cancelled|disputed|ai_output
payload     jsonb
created_at  timestamptz DEFAULT now()
```

### `quotes`
```
id              uuid PK
job_id          uuid REFERENCES jobs(id) ON DELETE CASCADE
professional_id uuid REFERENCES professionals(id)
amount_cents    int
breakdown       jsonb  -- [{label, qty, unit_price_cents}]
valid_until     timestamptz
status          quote_status_enum  -- pending|accepted|rejected|expired
ai_generated    bool DEFAULT false
created_at      timestamptz DEFAULT now()
```

### `messages`
```
id               uuid PK
job_id           uuid REFERENCES jobs(id) ON DELETE CASCADE
sender_id        uuid REFERENCES profiles(id)
body             text
body_lang        text  -- source language code
body_translated  jsonb  -- {nl, en, pl, tr, ar, uk}
attachments      text[]
created_at       timestamptz DEFAULT now()
read_at          timestamptz
```
Indexes: `messages_job_created_idx` on `(job_id, created_at)`.

### `payments`
```
id                         uuid PK
job_id                     uuid REFERENCES jobs(id)
stripe_payment_intent      text UNIQUE
stripe_charge              text
amount_cents               int
commission_cents           int
platform_fee_cents         int  -- instant-payout + smart-quote fees
status                     payment_status_enum  -- pending|held|released|refunded|disputed
milestone_index            int DEFAULT 0
released_at                timestamptz
created_at                 timestamptz DEFAULT now()
```
Indexes: `payments_job_idx`; `payments_stripe_pi_idx` UNIQUE.

### `reviews`
```
id          uuid PK
job_id      uuid UNIQUE REFERENCES jobs(id)
rating      int CHECK (rating BETWEEN 1 AND 5)
body        text
photos      text[]
created_at  timestamptz DEFAULT now()
```

### `subsidies`
```
id                       uuid PK
job_id                   uuid REFERENCES jobs(id)
scheme                   subsidy_scheme_enum  -- ISDE|SEEH|BTW_REDUCED|OTHER
estimated_amount_cents   int
status                   text  -- estimated|submitted|approved|rejected
rvo_reference            text
created_at               timestamptz DEFAULT now()
```

### `notifications`
```
id          uuid PK
profile_id  uuid REFERENCES profiles(id)
channel     notification_channel_enum  -- push|email|sms
payload     jsonb
sent_at     timestamptz
read_at     timestamptz
```

### `audit_log`
```
id            bigserial PK
actor_id      uuid
action        text
target_table  text
target_id     text
before        jsonb
after         jsonb
ip            inet
created_at    timestamptz DEFAULT now()
```
Indexes: `audit_target_idx` on `(target_table, target_id, created_at DESC)`.

### `postal_code_stats` (materialized view)
```
postal_code       text
category_id       uuid
job_count         int
avg_price_cents   int
p25_cents         int
p75_cents         int
ai_blurb          text   -- "3 neighbors in 1056AB hired..."
last_updated      timestamptz
PRIMARY KEY (postal_code, category_id)
```
Refreshed hourly via `pg_cron` → `refresh materialized view concurrently`.

### `feature_flags`
```
key         text PK
payload     jsonb  -- {enabled, percentage, regions}
updated_at  timestamptz DEFAULT now()
```

## RLS policy groups

Pseudo-SQL predicates. Full policies in `supabase/migrations/0001_init.sql`.

- **`profile_self`** — `USING (id = auth.uid()) WITH CHECK (id = auth.uid())`. Read/write own profile.
- **`pro_read_active_jobs`** — `USING (status = 'pending' AND EXISTS (SELECT 1 FROM professionals p WHERE p.profile_id = auth.uid() AND category_id = ANY(p.services_offered_categories) AND ST_DWithin(jobs.geo, p.base_geo, p.service_radius_km * 1000)))`. Read pending jobs in service area.
- **`customer_own_jobs`** — `USING (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()))`. Customers see only their own jobs.
- **`assigned_pro_job`** — `USING (professional_id IN (SELECT id FROM professionals WHERE profile_id = auth.uid()))`. Pros read jobs assigned to them.
- **`messages_participants`** — `USING (job_id IN (SELECT id FROM jobs WHERE customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR professional_id IN (SELECT id FROM professionals WHERE profile_id = auth.uid())))`.
- **`review_after_completion`** — `WITH CHECK (EXISTS (SELECT 1 FROM jobs j WHERE j.id = job_id AND j.status = 'completed' AND j.customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())))`.
- **`public_pro_card`** — anon-readable view exposing `(business_name, rating, completed_jobs, services_offered, city)` only.
- **`admin_bypass`** — service-role only; no client policy.

## Migration conventions

- File names: `NNNN_name.sql` (`0001_init.sql`, `0002_add_subscriptions.sql`, …).
- Every migration ships with up + down (via `supabase migration new` conventions).
- Every new table **must** include RLS policies in the same migration. CI runs `supabase/tests/rls_coverage.sql` (pgtap) and fails on any table with `relrowsecurity = false` or zero policies.
- Type generation: `pnpm db:types` runs `supabase gen types typescript` → `packages/shared-types/supabase.ts` + Dart generator → `apps/mobile/lib/types/supabase.g.dart`.

## Seed data

`supabase/seed/*.sql` provides:
- 10 pros across 6 categories in Amsterdam (with `base_geo` set).
- 30 customers across 8 postal codes.
- 50 jobs across all 6 statuses.
- 3 VvEs (Phase 5 flag).
- 200 `postal_code_stats` rows with realistic price bands.
- Feature flags: `ai_voice_post`, `ai_photo_quote`, `subsidy_copilot`, `instant_payout`, `neighbor_blurb`.

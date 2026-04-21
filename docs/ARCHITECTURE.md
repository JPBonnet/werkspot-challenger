# System Architecture — Werkspot Challenger

## Summary

Flutter (iOS + Android) + Next.js 15 (customer web + admin + API routes) + Supabase (Postgres + Auth + Storage + Realtime + Edge Functions) + Stripe Connect Custom (escrow + payouts) + Claude (AI) + Whisper (voice) + MessageBird (SMS) + FCM (push) + Mapbox + KvK API + Sentry + PostHog + Better Stack. Monorepo via pnpm workspaces + Turborepo.

Cross-reference: [DATA-MODEL.md](./DATA-MODEL.md) · [API-SPEC.md](./API-SPEC.md) · [SECURITY-COMPLIANCE.md](./SECURITY-COMPLIANCE.md) · [RUNBOOKS.md](./RUNBOOKS.md) · [AI-PRODUCT-FEATURES.md](./AI-PRODUCT-FEATURES.md)

## System diagram

```
 ┌───────────────────┐   ┌───────────────────┐   ┌──────────────────┐
 │  Flutter (iOS/    │   │  Next.js 15       │   │  Admin (Next.js) │
 │  Android)         │   │  Customer Web     │   │                  │
 └─────────┬─────────┘   └─────────┬─────────┘   └─────────┬────────┘
           │                       │                       │
           ▼                       ▼                       ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │                Supabase-JS / REST / Realtime / Storage           │
 └─────────┬──────────────────────┬──────────────────────┬──────────┘
           ▼                      ▼                      ▼
 ┌───────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
 │  Next.js API      │  │  Supabase Edge    │  │  Supabase Postgres   │
 │  + Server Actions │  │  Functions (Deno) │  │  + Auth + Storage    │
 │  (streaming AI,   │  │  (webhooks, cron, │  │  + Realtime          │
 │   admin, auth)    │  │   AI translation) │  │                      │
 └──────┬────────────┘  └──────┬────────────┘  └──────────┬───────────┘
        │                      │                          │
        ▼                      ▼                          ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │  External:  Stripe Connect · Claude · Whisper · MessageBird      │
 │             · FCM · Mapbox · KvK · Resend · Sentry · PostHog     │
 └──────────────────────────────────────────────────────────────────┘
```

## Concern split

**Next.js API routes + Server Actions (Vercel):**
- Auth flows wrapping `supabase-js` (cookie-based SSR session).
- Homeowner web portal (job posting, quote review, payment UI).
- Admin backoffice (moderation, payout override, KYC review).
- Streaming AI orchestration with Anthropic SDK (prompt caching headers).
- Stripe Connect onboarding redirect.

**Supabase Edge Functions (Deno):**
- Stripe webhooks (`/functions/stripe-webhook` — idempotency-keyed on `event.id`).
- KvK verification callbacks.
- `pg_cron`-driven matching + `postal_code_stats` hourly refresh.
- FCM fan-out on `notifications` insert.
- Whisper transcription proxy (streamed multipart).
- Claude Haiku translation on `messages` insert via DB trigger → function invocation.
- Nightly neighbor-blurb generation (AI).

**Rule:** data-adjacent + cron + webhooks → Edge Functions. User-facing + streaming AI + admin UI → Next.js.

## Request-flow walkthroughs

### 1. Homeowner posts voice job
1. Flutter records audio (`record` package) → uploads to `chat-attachments`-like staging bucket (signed URL).
2. POST `/api/ai/voice-intake` with audio URL. Next.js streams multipart to Whisper-v3 via OpenAI SDK.
3. Transcript → Claude Sonnet with function-call schema `{category, description, urgency, needs_photos, postal_code}`. System prompt cached per region.
4. Structured payload → Server Action inserts `jobs` row + `job_events` (`event_type='created_voice'`) within a transaction.
5. `NOTIFY` trigger → Edge Function selects pros with `ST_DWithin` + `services_offered` overlap → FCM fan-out.
6. Flutter pro clients receive push → feed updates via Realtime channel `job:{id}`.

### 2. Quote → payment → payout
1. Pro submits quote → `quotes` row insert. Customer notified via Realtime `job:{id}`.
2. Customer accepts → Server Action creates Stripe PaymentIntent (manual capture) with `application_fee_amount = amount * 0.10` and `transfer_data.destination = pro.stripe_account_id`.
3. Customer pays (iDEAL / card / Apple Pay) → webhook `payment_intent.succeeded` → Edge Function sets `payments.status='held'`, updates `jobs.status='accepted'`.
4. Pro starts + completes job → state-machine transitions in `job_events`.
5. Customer releases milestone (or 72h auto-release without dispute) → Stripe `capture` → `charge.captured` webhook → `payments.status='released'`, `payments.released_at=now()`. Commission retained; pro balance available.
6. Pro hits Instant Payout (1% fee) → Stripe Payout API → balance lands within 30 minutes.

### 3. Chat translation
1. Pro sends message in Polish → Flutter inserts `messages` row with `body_lang='pl'`.
2. After-insert DB trigger enqueues Edge Function `translate-message`.
3. Function calls Claude Haiku with cached glossary system prompt → returns `{nl, en}`.
4. Updates `messages.body_translated = {'nl': '...', 'en': '...'}`. Realtime broadcast on `chat:job:{id}` delivers both bodies.
5. Customer's Flutter reads `body_translated[locale]` first, falls back to `body`.

## Realtime channels

| Channel | Publisher | Subscribers | Purpose |
|---|---|---|---|
| `chat:job:{id}` | Edge + clients | Job participants | Messages + typing + translation |
| `job:{id}` | DB triggers | Participants | Status, quotes, payment state |
| `notifications:user:{id}` | Edge | Owner | Unread count, toast payloads |
| `presence:pro:{id}` | Flutter | Admin + customer | Online/available for instant-match |

## Storage buckets

| Bucket | Access | Contents |
|---|---|---|
| `avatars` | Public read, owner write | Profile photos |
| `job-photos` | Signed read for participants, owner write | Job photos + AI-input |
| `kvk-docs` | Service-role only | KvK extracts, ID docs |
| `invoices` | Signed read for participants | PDF invoices |
| `chat-attachments` | Signed read for participants | Chat files |

## Environments

- **Local:** Supabase CLI (`supabase start`), Next.js `pnpm dev`, Flutter `flutter run`, Stripe CLI proxy for webhooks. Seeded fixtures via `supabase/seed/*.sql`.
- **Staging:** Supabase preview project per PR (via Supabase Branching), Vercel preview per PR, Stripe test mode, separate Sentry + PostHog projects.
- **Production:** Supabase EU (Frankfurt), Vercel EU edge, Stripe live, Codemagic for Flutter signed builds → TestFlight + Play Internal Testing.

## Observability

- **Sentry:** Flutter + Next.js + Edge Functions. Release tag per deploy. Breadcrumb for every agent tool call.
- **PostHog:** product analytics + feature flags + session replay (PII-masked). Flags mirrored to `feature_flags` table for server reads.
- **Better Stack:** 6 uptime probes (`/api/health`, `/api/auth/session`, `/api/jobs/feed`, Stripe webhook endpoint, Supabase REST health, Flutter critical deeplink).
- **PagerDuty:** on-call rotation, sev-1 = 15 min, sev-2 = 1h response.

## Performance budgets

| Surface | Target |
|---|---|
| p95 REST API latency | <400ms |
| p95 AI streaming first-token | <1.5s |
| Cold-boot Edge Function | <800ms |
| Flutter app cold start | <2.5s on mid-tier Android |
| Realtime message delivery | <1s p95 |

## Failure modes + fallbacks

| Vendor | Failure | Fallback |
|---|---|---|
| Stripe | Webhook down | Idempotent retries via `stripe_events` dedupe table; nightly reconcile |
| Supabase | DB down | Read-only mode via PgBouncer pause; Sentry alert; customer-facing maintenance banner |
| Claude | Rate-limit | Exponential backoff + queue; Haiku fallback for Sonnet translation; feature-flag kill switch for AI features |
| Whisper | Unavailable | Voice flow gracefully degrades to text form with banner |
| KvK API | Down | Queue verification; user sees "In review" state; auto-retry |
| FCM | Delivery fail | SMS fallback via MessageBird for urgent notifications |
| Mapbox | Down | Static postal-code coarse geo (no map) |

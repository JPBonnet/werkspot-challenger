# API Spec — Werkspot Challenger

## Surfaces

- **Supabase REST/RPC** (auto-generated from Postgres schema + RLS): primary CRUD for clients. Auth via Supabase JWT cookie (web) or bearer (mobile).
- **Supabase Edge Functions** (Deno, path `/functions/v1/<name>`): webhooks + cron + AI pipelines.
- **Next.js API routes** (path `/api/*`): streaming AI, admin actions, Stripe Connect onboarding redirect.
- **Supabase Realtime**: WebSocket channels (see [ARCHITECTURE.md](./ARCHITECTURE.md)).

Base URLs:
- Prod: `https://api.werkspot-challenger.nl` (Next.js) + `https://<project>.supabase.co` (Supabase).
- Staging: preview URLs per PR.

## Auth

- `POST /auth/v1/otp` (Supabase) — magic link.
- `POST /auth/v1/token?grant_type=oauth` — Apple / Google.
- Session cookie `sb-<project>-auth-token` (web), `Authorization: Bearer <jwt>` (mobile).
- MFA required for pros (Supabase MFA with TOTP).

## Next.js API routes

### `POST /api/ai/voice-intake`
Streaming SSE. Accepts `{ audio_url: string, postal_code?: string }`.
Returns `event: transcript`, `event: structured`, `event: done` with `{ job_draft }` schema.

### `POST /api/ai/photo-quote`
Streaming SSE. Accepts `{ job_id, photos: string[] }`.
Returns `event: range` `{ min_cents, max_cents, confidence, verify_onsite[] }`.

### `POST /api/ai/quote-draft`
ChallengerPRO-gated. Accepts `{ job_id }`.
Returns streamed line-item draft.

### `POST /api/ai/subsidy`
Accepts `{ job_id, device_meta }`. Returns scheme + estimate + required docs.

### `POST /api/stripe/onboard`
Returns Stripe Connect onboarding URL for the current pro.

### `POST /api/stripe/payout/instant`
Triggers Stripe Instant Payout on the pro's Stripe balance. Charges 1% platform fee.

### Admin
- `POST /api/admin/suspend-pro` `{ pro_id, reason }`
- `POST /api/admin/release-payment` `{ payment_id }`
- `POST /api/admin/moderate` `{ target_type, target_id, action }`

## Supabase Edge Functions

| Function | Trigger | Purpose |
|---|---|---|
| `stripe-webhook` | Stripe HTTPS | Payment intent + charge + payout lifecycle |
| `kvk-verify` | Cron + manual | KvK Handelsregister lookup, updates `professionals.kvk_verified_at` |
| `translate-message` | DB trigger on `messages` insert | Haiku translation → `messages.body_translated` |
| `neighbor-blurb` | pg_cron nightly | Writes `postal_code_stats.ai_blurb` |
| `match-pros` | pg_cron 5-min | Notifies pros of new jobs via FCM + Realtime |
| `refresh-postal-stats` | pg_cron hourly | `refresh materialized view concurrently` |
| `dsar-export` | Manual | GDPR Article 15 export |
| `dsar-delete` | Manual + cron 30d | GDPR Article 17 delete |

## Supabase Realtime channels

| Channel | Event payloads |
|---|---|
| `chat:job:{id}` | `{ kind: 'message' \| 'typing' \| 'read', ... }` |
| `job:{id}` | `{ kind: 'status' \| 'quote' \| 'payment', ... }` |
| `notifications:user:{id}` | `{ kind, payload }` |
| `presence:pro:{id}` | presence state track |

## Webhook contracts

### Stripe
Verified via `STRIPE_WEBHOOK_SECRET`. Idempotency keyed on `event.id` in `stripe_events` table.
Handled events:
- `payment_intent.succeeded` → `payments.status='held'`
- `charge.captured` → `payments.status='released'`, emit `job_events`
- `charge.refunded` → `payments.status='refunded'`
- `charge.dispute.created` → `payments.status='disputed'`, freeze payout
- `payout.paid` / `payout.failed`

### KvK
Callback after async verification job completes. Updates `professionals.kvk_verified_at`.

## Error taxonomy

All API errors return JSON `{ code: string, message: string, field?: string, trace_id: string }` with HTTP status.

| Code | HTTP | Meaning |
|---|---|---|
| `auth/unauthorized` | 401 | Missing/invalid JWT |
| `auth/forbidden` | 403 | RLS or role block |
| `validation/invalid_field` | 400 | Schema violation |
| `job/invalid_state` | 409 | State-machine violation (e.g. accept on completed job) |
| `payment/insufficient_funds` | 402 | Stripe decline |
| `payment/already_released` | 409 | Milestone already released |
| `ai/rate_limited` | 429 | Back off, retry with jitter |
| `ai/low_confidence` | 200 | Output returned with `confidence < threshold` flag |
| `kvk/not_found` | 404 | KvK number invalid |
| `stripe/connect_required` | 428 | Pro must complete Stripe onboarding |
| `internal` | 500 | Unexpected; Sentry captured |

## Rate limits

- Unauthenticated: 20 req/min/IP.
- Authenticated: 300 req/min/user (600 for admin role).
- AI endpoints: 30 req/min/user + token-bucket cost budget.

## Versioning

- Supabase REST is schema-coupled; migrations bump types via `pnpm db:types`.
- Next.js API routes are stable by path; breaking changes ship under `/api/v2/*` with deprecation headers on v1 for 90 days.
- Edge Function names are pinned; new behavior is a new function.

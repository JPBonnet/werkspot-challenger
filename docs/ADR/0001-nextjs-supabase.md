# ADR-0001: Next.js + Supabase as the backend stack

- **Status:** Accepted (2026-04-21)
- **Deciders:** Orchestrator + human maintainer

## Context

No backend exists. Both historical client stubs call a fictional API. We need a production backend that supports: auth, Postgres, row-level security, storage (photos/docs), realtime (chat + job status), edge compute (webhooks + AI + cron), plus a web surface for homeowners + admin.

## Decision

Adopt **Next.js 15 (App Router)** on Vercel for the web + admin + streaming AI API surface, and **Supabase** for Postgres + Auth + Storage + Realtime + Edge Functions (Deno).

## Alternatives considered

- **NestJS + self-hosted Postgres + custom websocket + S3:** more control, more ops burden, no RLS out of the box, slower MVP.
- **Node/Express + Postgres:** lower ceiling, manual auth, manual realtime; not worth it when Supabase gives it for free.
- **Go + Postgres:** faster at scale, smaller team talent pool, slower agent iteration.
- **Pure BaaS (Firebase):** worse relational model, vendor lock-in, no RLS, poor Postgres ecosystem.

## Consequences

- (+) Zero-ops database with RLS, auth, storage, realtime baked in.
- (+) Edge Functions are co-located with DB → low-latency webhooks + triggers.
- (+) TypeScript end-to-end; shared types via `supabase gen types`.
- (−) Vendor coupling to Supabase — mitigated by Postgres portability (Supabase is upstream Postgres + auth/realtime adapters).
- (−) Deno Edge Functions have cold-start variability — budgeted at p95 <800ms; keep warm via cron ping.

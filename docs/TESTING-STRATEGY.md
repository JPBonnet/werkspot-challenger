# TESTING STRATEGY

## Summary

Werkspot Challenger ships a Flutter mobile client, a Next.js web app, a Supabase backend (Postgres + Storage + Edge Functions + Auth), and several LLM-powered flows (photo quotes, smart drafts, subsidy co-pilot). Testing spans six layers — unit, widget/component, integration, contract, end-to-end, and non-functional (load, chaos, security, evals). This document is the source of truth for what each layer covers, what blocks merges, and which gates fire per release.

The test pyramid, top-to-bottom:

```
             E2E (Maestro + Playwright)
           Integration (Supabase local stack)
         Contract (types + schema + API)
       Widget / Component (Flutter + Playwright)
     Unit (Dart flutter_test + Jest)
```

Wide base, narrow top. We also run parallel specialty lanes — AI evals, load, chaos, security — on schedules separate from PR CI.

## 1. Unit

- **Dart (Flutter)**: `flutter_test` for view-models, services, repositories, value objects. **Coverage floor 70% on business logic** (enforced via `lcov` in CI; UI shells excluded). Test doubles via `mocktail`.
- **Next.js**: `Jest` for server actions, API routes, Edge Functions, shared utils. **Coverage floor 70%** on the `packages/core` and `apps/web/server` directories.

Fast (<30s combined) and run on every PR. Failures block merge.

## 2. Widget / Component

- **Flutter**: `flutter_test` with `WidgetTester` for screens — renders, taps, form submission, state transitions. Golden tests on key screens (dashboard, quote detail, chat) to catch layout regressions across iOS + Android + text-scale 1.3×.
- **Web**: Playwright Component tests for isolated React components; Storybook with `@storybook/test-runner` for visual regression via Chromatic.

Run on PR; goldens update only when explicitly regenerated and reviewed.

## 3. Integration

Full local Supabase stack via `supabase start`:

- Postgres + Auth + Storage + Edge Functions spun up per test run.
- Seed data under `supabase/seed/*.sql`: 10 pros across 5 trades, 30 customers, 50 jobs in varied statuses, 3 VvE (owners' association) accounts, 200 rows of `postal_code_stats` covering Amsterdam / Utrecht / Rotterdam / rural Friesland.
- Flutter runs on a headless emulator (Android) via `flutter test integration_test` pointed at local Supabase (`SUPABASE_URL=http://localhost:54321`).
- Next.js runs against the same local stack.
- `pgtap` suite under `/supabase/tests/rls/` asserts RLS policies: per role × per table × per operation. An `rls-coverage` script diff-checks `pg_policies` vs the test suite and fails CI if any policy lacks a test.

Integration suite runs on PR (sharded across 4 workers) and on `main`.

## 4. Contract Tests

Prevent drift between backend schema and clients:

- `supabase gen types typescript` → `packages/db-types/index.ts`. CI runs the generator; any uncommitted diff fails the build.
- Dart generator (`supabase_dart_types` — internal tool) produces `lib/generated/db_types.dart`. Same drift check.
- OpenAPI spec for the public API (Scale tier): generated from Zod schemas; consumer contract tested via `pact`.
- Event payloads (Stripe webhooks, FCM push payloads) validated with Zod + Dart `json_serializable` and locked via snapshot tests.

Drift = merge block.

## 5. End-to-End

- **Flutter**: Maestro flows — signup → post job → accept quote → pay → review. Runs on BrowserStack iOS + Android matrix on merge to `main` and on release candidates.
- **Web customer**: Playwright — customer signup, post job, quote accept, pay with 3DS test card, review submit.
- **Web admin**: Playwright — DSAR fulfillment, pro suspension, moderation queue, manual payout, audit log read.

Critical E2E flows are tagged `@smoke` and must pass on every staging deploy; the full suite runs nightly.

## 6. Load

`k6` scripts under `/load/`, targeting **p95 < 400 ms at 3× forecast Y1 peak** on the six revenue-critical endpoints:

- `POST /jobs` (job creation, 800 RPS target)
- `GET /jobs/{id}/quote-stream` (SSE quote streaming, 2,000 concurrent)
- `POST /chat/messages` + realtime fan-out (4,000 concurrent subscribers)
- `POST /ai/photo-quote` (400 RPS, LLM-backed — tests cache + rate-limit behavior)
- `POST /payments/intents` (200 RPS)
- `GET /search/pros` (1,500 RPS, geo-filtered)

Runs weekly against staging from a k6 Cloud EU region; regressions >15% vs baseline open a Linear issue automatically.

## 7. Chaos

`toxiproxy` in staging + CI's extended lane injects failure into every outbound dependency:

- **Stripe**: 500s, timeouts, idempotency-key collisions, webhook delivery delays.
- **OpenAI / Claude**: 429 rate limits, 500s, partial stream cutoffs, token-limit overruns.
- **KvK**: 503 outages during onboarding (verify graceful queue-for-review fallback).
- **FCM**: delivery failures (verify SMS/email fallback on P0 notifications).
- **Supabase Realtime**: disconnect storms (verify Flutter auto-reconnect + message replay).

Chaos scenarios are scripted, reviewed quarterly, and rerun after any dependency upgrade.

## 8. Feature Flags + Canary

- PostHog flags are the source of truth; values mirrored into `feature_flags` table via a hook so server-side code has a low-latency read path.
- Canary rollout per region: **1% → 10% → 50% → 100%** over 48h for any user-visible change; auto-rollback trigger on error-rate spike (>2× baseline) or SLO burn >20%.
- Every flag has an owner, an expected lifetime, and a cleanup ticket. A weekly script lists flags older than 90 days and pings owners.

## 9. AI Evals

LLM quality is a moving target; we treat it like any other gate.

- **Eval datasets** live in `/packages/ai-evals/datasets/`, versioned per prompt (quote_v7, subsidy_v3, chat_suggest_v2).
- Each dataset has a **grading rubric** — quote datasets score accuracy (±15% of ground truth), completeness (labor + materials + time), safety (no invented subsidies), and tone (Dutch, polite informal).
- **CI**: sampled 50-example subset runs on every PR that touches `/packages/prompts` or `/packages/ai/`; full suite (~1,500 examples per prompt) runs nightly.
- **Regression threshold**: score drop >3% vs last green = merge block. Improvements >1% auto-open a "consider promotion" PR comment.
- Red-team set for prompt injection (60 patterns) included in the nightly suite; any success = P1 incident.
- Cost tracked per run; any prompt whose mean cost-per-call exceeds budget by >20% fails CI regardless of quality.

## 10. Security Tests

- **RLS coverage** CI gate (see §3).
- **Secret scanning**: `gitleaks` pre-commit + CI; `detect-secrets` baseline for legacy tolerance.
- **Dependency scanning**: `npm audit`, `dart pub outdated`, `trivy` on container images and Edge Function bundles; high/critical fails build.
- **DAST**: OWASP ZAP against staging weekly; Monday triage.
- **SAST**: `semgrep` with OWASP + custom rulesets on PR.
- **Supply chain**: `sigstore` signature verification on our own build artifacts by Y2.

## 11. Observability Tests

- **Synthetic probes** via Better Stack on the 6 critical endpoints (see §6) from EU datacenters every 60s; P0 page at 2 consecutive failures.
- **Log-shape tests**: we assert every revenue-critical path emits `correlation_id`, `user_id`, `action`, `outcome`; a CI linter checks this against a schema.
- **Metric presence**: Prometheus scrape tests assert the existence and cardinality of the top 20 metrics so dashboards don't silently go blank.

## 12. Release-Gate Matrix per Phase

| Phase | Must pass before release |
|---|---|
| 0 Foundations | Unit + RLS CI gate + secret scan + types drift |
| 1 Auth + onboarding | +KvK flow E2E + DSAR drill |
| 2 Jobs + quotes | +Quote eval suite green, load p95<600ms |
| 3 Payments | +Stripe chaos suite, PCI SAQ-A filed, fraud scoring live |
| 4 AI features | +Full eval suite green, injection red-team zero-hit, cost <4% |
| 5 Ancillary (subs, insurance, BNPL) | +subscription billing E2E, insurance underwriter UAT |
| 6 Scale tier + public API | +OpenAPI contract tests, pact with 2 beta pro-tech partners, ISO gap analysis started |

## 13. CI Layout

GitHub Actions, matrix:

- `flutter` lane: analyze, unit, widget, golden, integration-against-local-supabase.
- `web` lane: typecheck, lint, unit, component, Playwright smoke.
- `db` lane: `supabase start` → pgtap + RLS coverage + types-drift.
- `ai-evals` lane: sampled on PR, full nightly, budget gate.
- `security` lane: gitleaks + semgrep + trivy + npm/dart audit.
- **Turbo remote cache** (Vercel) accelerates web; Codemagic caches Flutter builds.
- **Flaky-test quarantine**: tests that fail >3× in 14 days with no code change auto-tag `@flaky`, run out-of-gate, and open an issue for the owner; 2-week SLA before deletion.
- PR checks block merge; `main` protected; release branches require the phase-appropriate gate above plus a signed-off `LAUNCH-CHECKLIST.md`.

## Cross-Links

- `SECURITY-COMPLIANCE.md` — RLS policy + secret-scanning detail
- `RUNBOOKS.md` — incident playbooks referenced by chaos scenarios
- `LAUNCH-CHECKLIST.md` — the ship gate that binds these tests to a release
- `MONETIZATION.md` — pricing experiments that ride on feature flags

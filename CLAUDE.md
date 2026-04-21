# CLAUDE.md

Guidance for Claude Code (and subagents) working in this repository.

## Repository shape

This is a **production rebuild** of Werkspot Challenger — a Dutch handymen marketplace designed to beat Werkspot on economics (10% commission, no lead fees), trust (escrow + KvK verification), UX (AI voice / photo / multilingual chat), and the energy-transition vertical.

Monorepo via **pnpm workspaces + Turborepo**. Flutter sits outside the pnpm graph but is orchestrated via `turbo.json` exec tasks.

```
apps/
  mobile/   Flutter (iOS + Android). Riverpod 2.x + go_router + supabase_flutter.
  web/      Next.js 15 App Router. Customer web + admin + streaming AI API.
supabase/   Migrations, Edge Functions (Deno), seed, pgtap tests, config.toml.
packages/
  shared-types/   Generated TS + Dart types from Supabase schema.
  ai-prompts/     Versioned prompt library with cache-key helpers.
  ai-evals/       Eval datasets + runner.
  ui-tokens/      Design tokens shared web <-> mobile.
docs/       PRD, ARCHITECTURE, DATA-MODEL, API-SPEC, AI-*, MONETIZATION, GTM, SECURITY-COMPLIANCE, TESTING-STRATEGY, LAUNCH-CHECKLIST, RUNBOOKS, DESIGN-SYSTEM, ADR/.
.claude/    Subagent definitions + hooks in settings.json.
.github/workflows/   CI: web, mobile, supabase (pgtap RLS coverage), security scans.
```

## Key decisions (see `docs/ADR/`)

- **ADR-0001:** Next.js + Supabase (Postgres + Auth + Storage + Realtime + Edge Functions).
- **ADR-0002:** Flutter + Riverpod 2.x (drop `provider`, `flutter_bloc`).
- **ADR-0003:** Stripe Connect Custom + escrow milestones + Instant Payouts.
- **ADR-0004:** pnpm workspaces + Turborepo.

## Commands

### Root (monorepo)
- `pnpm install` — install JS deps.
- `pnpm dev` — Turbo runs web + packages.
- `pnpm build` / `pnpm test` / `pnpm lint` / `pnpm typecheck`.
- `pnpm db:start` / `pnpm db:stop` — Supabase local stack.
- `pnpm db:reset` — drop, re-apply migrations, re-seed.
- `pnpm db:migrate` — `supabase db push` to linked remote.
- `pnpm db:types` — regenerate TS + Dart types.
- `pnpm db:test` — pgtap suite (including `supabase/tests/rls_coverage.sql`).
- `pnpm ai:evals` — run AI eval suite.

### Web — `apps/web`
- `pnpm --filter @werkspot/web dev` — Next.js on http://localhost:3000.
- `pnpm --filter @werkspot/web build` / `start`.

### Mobile — `apps/mobile`
- `pnpm mobile:dev` — `flutter run` on connected device.
- `pnpm mobile:test` — `flutter test`.
- `pnpm mobile:analyze` — `flutter analyze`.
- Env via `--dart-define`: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `STRIPE_PUBLISHABLE_KEY`, `SENTRY_DSN`, `API_BASE_URL`.

## Architecture rules of thumb

- **Data-adjacent + webhooks + cron** → Supabase Edge Functions.
- **User-facing + streaming AI + admin UI** → Next.js API routes / Server Actions.
- **Money** is always integer cents.
- **PII** never leaves EU region; Supabase EU project, EU Vercel edge.
- **RLS** is mandatory. Every new table must include a policy in the same migration. `supabase/tests/rls_coverage.sql` fails CI otherwise.
- **Prompt caching** (`anthropic-beta: prompt-caching-2024-07-31`) on every repeated system prompt. Target >70% hit rate.
- **Feature flags** in `feature_flags` table (mirrored from PostHog) have kill switches on every AI and paid flow.
- **Commission** is **10%** of GMV, charged at payment release via `application_fee_amount` on Stripe Connect Custom. **No lead fees, ever.**

## Subagent orchestration

See `docs/AI-AGENT-ORCHESTRATION.md`. Subagents live in `.claude/agents/`:
`backend-architect`, `mobile-engineer`, `ai-features`, `qa-engineer`, `security-reviewer`, `dutch-copywriter`, `data-migrations`, `release-manager`, `devops`.

Hooks in `.claude/settings.json` auto-regenerate types on SQL edits. Security-review runs before any `git push`.

## Dutch conventions

- User-facing default tone: **informal "je"** except on legal/payment/identity screens → **formal "u"**.
- Money formatting: `€ 1.234,56` (nl-NL).
- Dates: `20-09-2026`.
- Trade vocabulary in Dutch (Loodgieter, Elektricien, Warmtepomp, CV-ketel, BTW, Offerte, Kwitantie).
- Glossary authoritative in `docs/DESIGN-SYSTEM.md`.

## Before shipping

Read `docs/LAUNCH-CHECKLIST.md`. The bar is: only remaining step is tapping **Submit for Review** in App Store Connect + Play Console.

## Branch convention

Claude-authored work lives on the feature branch named in the task prompt. Never push to `main`.

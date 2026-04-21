# Werkspot Challenger

Vakmensen voor jouw klus. Eerlijk en snel betaald.

A Dutch handymen marketplace built to beat Werkspot on economics, trust, and UX. **No lead fees. 10% commission on successful jobs. Escrow-backed milestone payments. AI-native job posting, photo-to-quote, multilingual chat, and subsidy co-pilot for the energy transition.**

## Why this exists

- Werkspot charges pros €5–80 per lead at 15–25% conversion. Pros spend 60%+ of revenue on platform fees; Trustpilot sits at 2.5–3.0.
- We flip the model: 10% commission on completed jobs + optional ChallengerPRO subscription + ancillary (instant payout 1%, subsidy success fee, materials affiliate, BNPL, insurance). See `docs/MONETIZATION.md`.
- Target market: NL-wide. Wedge: **energy transition** (heat pump, solar, insulation) where loyalty is unformed and subsidies are a natural hook.

## Stack

- **Mobile** — Flutter + Riverpod 2.x + go_router + supabase_flutter + flutter_stripe + firebase_messaging (`apps/mobile/`).
- **Web + API + Admin** — Next.js 15 App Router on Vercel (`apps/web/`).
- **Backend** — Supabase (Postgres + Auth + Storage + Realtime + Edge Functions) in the EU region.
- **Payments** — Stripe Connect Custom (escrow + marketplace split + Instant Payouts + iDEAL + Apple/Google Pay + Klarna).
- **AI** — Anthropic Claude Sonnet 4.5 (reasoning, vision) + Haiku 4.5 (translation) + OpenAI Whisper-v3 (voice). Prompt caching on all repeated system prompts.
- **Observability** — Sentry + PostHog + Better Stack + PagerDuty.

## Layout

```
apps/mobile/       Flutter — customer + pro apps
apps/web/          Next.js — customer web + admin + streaming AI API
supabase/          migrations, functions (Deno), seed, pgtap tests
packages/
  shared-types/    generated TS + Dart types
  ai-prompts/      versioned prompts + cache helpers
  ai-evals/        eval datasets + runner
  ui-tokens/       design tokens (JSON → Dart + TS)
docs/              strategy + PRD + architecture + ADRs
.claude/           subagents + hooks
```

## Quickstart

```bash
# 1. Deps
corepack enable
pnpm install
# Flutter (install flutter 3.24+ via fvm or asdf)
cd apps/mobile && flutter pub get && cd -

# 2. Local Supabase
pnpm db:start     # starts Postgres + Auth + Storage + Studio at http://localhost:54323
pnpm db:reset     # apply migrations + seed

# 3. Env
cp apps/web/.env.example apps/web/.env.local  # fill in keys

# 4. Run
pnpm dev          # Next.js on :3000
pnpm mobile:dev   # Flutter on connected device/emulator
```

## Docs

- `docs/PRD.md` — personas, features, acceptance criteria, KPIs.
- `docs/ARCHITECTURE.md` — system design + request flows.
- `docs/DATA-MODEL.md` — schema + RLS policies.
- `docs/API-SPEC.md` — endpoint surface + error taxonomy.
- `docs/AI-PRODUCT-FEATURES.md` — 7 AI features, prompts, evals, cost.
- `docs/AI-AGENT-ORCHESTRATION.md` — how Claude Code subagents build this.
- `docs/MONETIZATION.md` — pricing + 3-year revenue path.
- `docs/GTM.md` — Pros-first launch playbook.
- `docs/SECURITY-COMPLIANCE.md` — AVG/GDPR, PCI-DSS SAQ-A, KvK, prompt-injection defense.
- `docs/TESTING-STRATEGY.md` — unit → e2e → load → chaos → AI evals.
- `docs/LAUNCH-CHECKLIST.md` — the ship-to-stores gate.
- `docs/RUNBOOKS.md` — incident playbooks.
- `docs/DESIGN-SYSTEM.md` — tokens + Dutch copy rules.
- `docs/ADR/` — architecture decisions.

## License

All rights reserved © Werkspot Challenger B.V.

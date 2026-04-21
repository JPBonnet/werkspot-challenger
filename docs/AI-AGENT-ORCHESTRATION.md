# AI Agent Orchestration — Engineering Build Plan

## Summary

This document describes how **Claude Code subagents** build and maintain the Werkspot Challenger codebase. The human maintainer is the orchestrator and final approver; the subagents own domain-specific execution with clear handoffs, guardrails, and observability.

Cross-reference: [AI-PRODUCT-FEATURES.md](./AI-PRODUCT-FEATURES.md) · [TESTING-STRATEGY.md](./TESTING-STRATEGY.md) · [SECURITY-COMPLIANCE.md](./SECURITY-COMPLIANCE.md) · `.claude/settings.json`

## Subagent roster

Each agent lives in `.claude/agents/<name>.md` with a dedicated system prompt, tool allowlist, and explicit handoff rules.

### `backend-architect`
- **Owns:** `apps/web/app/api/**`, `supabase/migrations/**`, `supabase/functions/**`.
- **Responsibilities:** schema design, RLS policies, API routes, Server Actions, Edge Functions, Stripe Connect integration.
- **Inputs:** PRD feature requests, API-SPEC updates, failing integration tests.
- **Outputs:** migrations + policies + route handlers + pgtap tests.
- **Escalation:** if a migration requires backfill of >10k rows, pings human for approval.

### `mobile-engineer`
- **Owns:** `apps/mobile/lib/**`, `apps/mobile/test/**`.
- **Responsibilities:** Flutter UI, Riverpod providers, navigation, accessibility (WCAG 2.2 AA), FCM push integration, Stripe mobile SDK.
- **Inputs:** design tokens from `packages/ui-tokens`, shared types from `packages/shared-types`.
- **Outputs:** widgets, providers, widget tests, Maestro flows.
- **Escalation:** platform-channel / native code changes require human approval.

### `ai-features`
- **Owns:** `packages/ai-prompts/**`, `packages/ai-evals/**`, `apps/web/app/api/ai/**`, `supabase/functions/translate-message/**`, `supabase/functions/neighbor-blurb/**`.
- **Responsibilities:** prompt design, caching strategy, cost monitoring, guardrails, eval sets.
- **Inputs:** AI-PRODUCT-FEATURES spec, production eval failures.
- **Outputs:** versioned prompts, eval datasets, streaming endpoints, cost dashboards.
- **Escalation:** anything that could push AI cost >4% of commission → human approval.

### `qa-engineer`
- **Owns:** `**/*.test.ts`, `**/*_test.dart`, `maestro/**`, `e2e/**`, `.github/workflows/**`.
- **Responsibilities:** unit + widget + integration + contract + e2e + load + chaos tests. Owns the PostHog event-schema contract.
- **Inputs:** new feature PRs, bug reports, eval failures.
- **Outputs:** tests, flaky-test quarantine reports, CI workflow updates.
- **Escalation:** repeated flakes (>3 in 7 days) escalate to owning agent.

### `security-reviewer`
- **Owns:** RLS audits, dependency CVE triage, secret scans, prompt-injection review.
- **Responsibilities:** reviews every PR that touches migrations, auth, payments, or AI prompts. Runs the `security-review` skill.
- **Escalation:** critical CVE or confirmed vulnerability → immediate human notify + hotfix branch.

### `dutch-copywriter`
- **Owns:** all user-facing strings, `docs/DESIGN-SYSTEM.md` copy section, App Store / Play Store listings, legal translations (with legal review).
- **Responsibilities:** enforce Dutch tone (informal *je* default, formal *u* on legal/payment surfaces), glossary consistency, accessibility copy.
- **Inputs:** new screens, new emails, new push payloads.
- **Outputs:** copy PRs, glossary updates.

### `data-migrations`
- **Owns:** migration file quality, type-gen, seed data.
- **Responsibilities:** on every migration, regenerate `packages/shared-types/supabase.ts` + Dart types, update seed fixtures, verify pgtap RLS coverage.
- **Escalation:** any destructive migration (DROP, ALTER TYPE, data loss) → human approval.

### `release-manager`
- **Owns:** version bumps, changelogs, Codemagic + Vercel promote, store submissions.
- **Responsibilities:** cut RCs, coordinate QA, tag releases, upload store assets.
- **Escalation:** production rollbacks, store rejections.

### `devops`
- **Owns:** `.github/workflows/**`, Vercel + Supabase env config, secrets rotation, Sentry release markers, PagerDuty integration.

## Handoff workflows

### 1. New Supabase migration
```
backend-architect  ─► writes migration + policies
        │
        ▼
data-migrations    ─► regenerates types, updates seed, runs pgtap
        │
        ▼
security-reviewer  ─► RLS coverage check, SQL injection scan
        │
        ▼
mobile-engineer    ─► regenerates Dart types, updates consuming providers
        │
        ▼
qa-engineer        ─► integration + contract tests green
```

### 2. New AI prompt
```
ai-features        ─► prompt v{n+1} + eval additions
        │
        ▼
qa-engineer        ─► eval subset green in CI
        │
        ▼
security-reviewer  ─► prompt-injection review (user text escape paths)
        │
        ▼
dutch-copywriter   ─► NL tone + glossary check (if user-facing)
```

### 3. Failing CI
```
GitHub webhook → qa-engineer tagged on PR
qa-engineer diagnoses → routes to owning agent
Owner fixes → qa-engineer re-runs → merges when green
```

### 4. Release cut
```
release-manager    ─► version bump + changelog
        │
        ▼
Codemagic + Vercel ─► build + staging deploy
        │
        ▼
qa-engineer        ─► Maestro e2e + Playwright + k6 smoke
        │
        ▼
dutch-copywriter   ─► store copy + release notes proofed
        │
        ▼
release-manager    ─► TestFlight + Play Internal → promote
```

### 5. Security incident
```
security-reviewer  ─► runbook start, severity tag
        │
        ▼
devops             ─► rotate affected secrets, revoke tokens
        │
        ▼
release-manager    ─► hotfix branch + expedited release
        │
        ▼
security-reviewer  ─► postmortem within 5 business days
```

## Auto-triggers — `.claude/settings.json` hooks

```jsonc
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash(git push*)", "hooks": [{ "type": "command", "command": "pnpm security:review" }] }
    ],
    "PostToolUse": [
      { "matcher": "Edit(**/*.sql)",           "hooks": [{ "type": "command", "command": "pnpm db:types && pnpm supabase test db" }] },
      { "matcher": "Edit(**/migrations/**)",   "hooks": [{ "type": "command", "command": "pnpm db:types && pnpm supabase test db" }] },
      { "matcher": "Edit(apps/mobile/lib/**)", "hooks": [{ "type": "command", "command": "cd apps/mobile && flutter analyze" }] },
      { "matcher": "Edit(**/*.dart)",          "hooks": [{ "type": "command", "command": "cd apps/mobile && flutter test --plain-name $(basename ${file} _test.dart)" }] }
    ],
    "UserPromptSubmit": [
      { "matcher": "^/release", "hooks": [{ "type": "agent", "agent": "release-manager" }] }
    ]
  }
}
```

CI failure webhook (GitHub Action → Sentry → Claude Code) is configured in `.github/workflows/ci.yml` and tags `qa-engineer`.

## Skills wired up

- **`review`** (built-in) — structured code review on every PR before human review.
- **`security-review`** (built-in) — RLS coverage, secret scanning, dependency CVEs, prompt-injection vectors. Required on any PR touching migrations / auth / payments / AI prompts.
- **`fewer-permission-prompts`** — pre-approves safe read-only tools to reduce friction.
- **`supabase-migrations`** (custom, at `.claude/skills/supabase-migrations/`) — validates every new table has RLS, generates pgtap coverage tests, regenerates types.
- **`dutch-copy`** (custom, at `.claude/skills/dutch-copy/`) — loads the Dutch glossary + tone guide; flags English strings, inconsistent *je/u* usage, untranslated labels.

## Guardrails

- **No direct push to `main`.** All agents open PRs on feature branches. Human merges.
- **No destructive ops without human approval:** `rm -rf`, `git push --force`, `DROP TABLE`, `TRUNCATE`, `git reset --hard`.
- **Secrets never echoed:** `security-reviewer` scans every PR + every tool-call output for secret patterns.
- **AI cost budget agent:** a lightweight watcher queries PostHog `ai.*.completed` events hourly. If rolling 7-day AI spend >5% of commission revenue, it opens a PR that flips the non-critical kill switches and pings the human.
- **PR etiquette:** agents run the `review` skill on their own PR before requesting human review. Agents never merge their own PRs.

## Observability for agents

- Every agent tool-call is logged as a Sentry breadcrumb + PostHog event (`agent.<name>.tool_call`).
- Weekly review dashboard: PR acceptance rate per agent, revert rate, CI-green-first-try rate, average time-to-merge, human override rate.
- Monthly: agent system-prompt tune-up based on failure modes surfaced in the dashboard.

## Rollout

- **Week 1:** `backend-architect`, `mobile-engineer`, `qa-engineer`, `devops` go live.
- **Week 2:** `security-reviewer`, `data-migrations` added.
- **Week 4:** `ai-features` online once first prompts ship.
- **Week 8:** `dutch-copywriter` enforced on all user-facing PRs.
- **Week 12:** `release-manager` cuts first production release.

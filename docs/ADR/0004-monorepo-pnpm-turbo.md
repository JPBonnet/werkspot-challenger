# ADR-0004: Monorepo — pnpm workspaces + Turborepo

- **Status:** Accepted (2026-04-21)

## Context

Repo has Flutter + (soon) Next.js + Supabase + shared types + AI prompts + evals. Parallel trees cause drift (see cross-tree auth-shape mismatch documented in the pre-restructure `CLAUDE.md`). We need a structure where Claude Code subagents can reason about shared boundaries and type drift is caught in CI.

## Decision

- **pnpm workspaces** for JS/TS packages (web, edge functions, shared-types, ai-prompts, ai-evals, ui-tokens).
- **Turborepo** for task orchestration, remote cache, pipeline deps.
- **Flutter sits outside pnpm** but is invoked by Turbo via `turbo.json` exec tasks (`cd apps/mobile && flutter <cmd>`).
- **Supabase CLI** drives `/supabase` (migrations, functions, seed).

## Layout

```
/
  apps/
    mobile/          Flutter
    web/             Next.js 15 App Router (customer + admin + API)
  supabase/          migrations/, functions/, seed/, tests/, config.toml
  packages/
    shared-types/    generated TS types + Dart mirror
    ai-prompts/      versioned prompts + cache-key helpers
    ai-evals/        eval datasets + runners
    ui-tokens/       design tokens → Dart + TS + CSS
  docs/
  .claude/           agents/, skills/, settings.json
  .github/workflows/
  turbo.json
  pnpm-workspace.yaml
  package.json
```

## Alternatives considered

- **Nx:** richer but heavier; overkill for our package count.
- **Lerna:** legacy; subsumed by pnpm + Turbo.
- **Polyrepo:** defeats type-drift detection; more CI complexity for agents.

## Consequences

- (+) Shared types generated once from Supabase; Dart + TS stay in lock-step.
- (+) Turbo remote cache accelerates CI.
- (+) Clear ownership per app/package for agent routing.
- (−) Flutter lives outside pnpm graph; contract enforced via Turbo exec tasks and CI.

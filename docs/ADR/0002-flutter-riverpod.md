# ADR-0002: Flutter + Riverpod for mobile

- **Status:** Accepted (2026-04-21)
- **Deciders:** Orchestrator + human maintainer

## Context

The repo had parallel Flutter and React Native prototypes. Both were stubs. We picked Flutter per `docs/MOBILE-APP-IMPLEMENTATION-PLAN.md` guidance (performance + single codebase for iOS/Android + better UI control). Existing `pubspec.yaml` declared both `provider` and `flutter_bloc` but screens held their own state.

## Decision

Use **Riverpod 2.x** as the single state-management and DI solution. Remove `provider` and `flutter_bloc` from `pubspec.yaml`. Use `riverpod_generator` + `freezed` for codegen-first development (easier for agents to produce consistent code).

## Alternatives considered

- **`flutter_bloc`:** mature but more boilerplate, event/state split is overkill for most screens.
- **`provider`:** predecessor to Riverpod; being superseded.
- **Raw `InheritedWidget` + `setState`:** tried in stubs; doesn't scale.
- **Redux (`flutter_redux`):** niche, high ceremony.

## Consequences

- (+) Async-first providers (`FutureProvider`, `StreamProvider`) map cleanly to Supabase realtime + REST.
- (+) Codegen reduces agent drift.
- (+) Excellent testability — override providers in tests.
- (−) Migration cost for the existing screens (minor — screens are small).

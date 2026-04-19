# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Shape

This repo is an early-stage prototype for "Werkspot Challenger" — a Dutch handymen marketplace — and contains **three independent trees that share nothing at the code level**:

1. **React Native (Expo) app** at the repo root (`App.tsx`, `navigation/`, `screens/`, `services/`, `package.json`, `app.json`, `tsconfig.json`). Entry point: `App.tsx`.
2. **Flutter app** under `lib/` with `pubspec.yaml` at the root. Entry point: `lib/main.dart`.
3. **Product research** under `docs/` — market analysis, competitor research, and the 12-week implementation plan (`MOBILE-APP-IMPLEMENTATION-PLAN.md`).

The two client trees are parallel prototypes of the same product, not a shared-code setup. They diverge in backend URL, auth storage, state management, and screen layouts — when making a change, pick the tree based on which file you are touching and do not cross-port unless asked. `docs/MOBILE-APP-IMPLEMENTATION-PLAN.md` states Flutter was chosen as the target, but the React Native tree is still present and functional.

## Commands

### React Native (Expo) — run from repo root

- `npm start` — Expo dev server (Metro)
- `npm run ios` / `npm run android` / `npm run web` — platform-specific starts
- `npm test` — Jest (preset `react-native`); `testMatch` is `**/__tests__/**/*.test.ts(x)` — there is no `__tests__/` directory yet, so `npm test` currently finds nothing
- `npm test -- <pattern>` — run a single test by filename/regex
- `npm run build:android` / `npm run build:ios` — EAS Build (requires EAS setup and `expo` owner `jpbonnet` per `app.json`)
- Copy `.env.example` to `.env`; all RN-visible env vars must be prefixed `EXPO_PUBLIC_` (used at runtime via `process.env.EXPO_PUBLIC_*`)

### Flutter — run from repo root

- `flutter pub get` — install deps from `pubspec.yaml`
- `flutter run` — run on the connected device/emulator (entrypoint `lib/main.dart`, which boots straight into `ProfessionalDashboard(professionalId: 'demo-pro-1')`)
- `flutter test` — run Dart tests (no `test/` directory exists yet)
- `flutter test test/path/to/foo_test.dart` — single test
- `flutter analyze` — static analysis (pairs with `flutter_lints` dev dep)
- `dart run build_runner build --delete-conflicting-outputs` — regenerate `json_serializable` code if/when `.g.dart` files are introduced (none exist today; current models hand-write `fromJson`/`toJson`)

## Architecture Notes That Span Multiple Files

### React Native tree

- **Auth-gated navigation**: `navigation/RootNavigator.tsx` picks `ProfessionalNavigator` (bottom tabs: Dashboard / Earnings / Profile) vs `AuthNavigator` (Onboarding / Login / Register) purely from `useAuthStore()`'s `token` + `user`. There is no "customer" stack yet even though the auth model supports it.
- **Auth state**: `services/authStore.ts` is a Zustand store. `App.tsx` reads the JWT from `expo-secure-store` on mount and calls `initialize(token)`, which verifies it against `/api/auth/me`. On 401 anywhere, `services/apiClient.ts` deletes the stored token but does not itself reset the Zustand store — callers/screens see the axios rejection and must handle logout UX.
- **Two axios clients exist**: `services/apiClient.ts` (configured instance with `baseURL = EXPO_PUBLIC_API_URL`, auth interceptor, 401 handling) and direct `axios.*` calls in `services/authStore.ts` (no baseURL, no interceptor). New code should go through `apiClient`; the raw calls in `authStore` are a known inconsistency.
- **API base URL**: `https://api.werkspot-challenger.com` (note `.com`, different from the Flutter tree).

### Flutter tree

- **`ApiService` is a singleton** (`lib/services/api_service.dart`) wrapping `package:http` with `FlutterSecureStorage` for the `access_token`. All feature services (`AuthService`, `JobService`, `PaymentService`) construct `ApiService()` and share the singleton — do not instantiate a second one or tokens will drift.
- **Error model**: non-2xx responses throw `ApiException(statusCode, message)`; callers are expected to catch this rather than relying on nullable returns.
- **API base URL**: `https://api.werkspot-challenger.nl/v1` (note `.nl` + `/v1`, different from the RN tree).
- **No state-management library wired up** yet despite `provider` / `flutter_bloc` being in `pubspec.yaml`; screens currently hold their own state and call services directly.
- **Domain vocabulary is Dutch**: `Job.statusLabel` and `ServiceCategory.defaultCategories()` return Dutch strings (Nieuw, Loodgieter, etc.). Keep user-facing strings in Dutch in this tree.

### Cross-tree backend contract

The two clients talk to *different* hostnames but assume the same JSON shape: `{ access_token, user }` for auth; job fields use `snake_case` (`customer_id`, `professional_id`, `scheduled_at`, `final_price`). Payments are stored/sent in euro cents (`amount * 100`) from the Flutter `PaymentService`. When changing one client's API contract, check whether the other client needs the same change — nothing enforces parity.

### Research docs

`docs/` is reference-only product/market material (Werkspot analysis, competitor research, opportunity analysis, 12-week plan). Treat it as context for product decisions, not as a spec that code must match — the code is ahead of or behind the plan in places.

## Conventions

- TypeScript is `strict` with path alias `@/*` → repo root (`tsconfig.json`). `include` lists `app`, `screens`, `services`, `models`, `navigation`, `utils`, `hooks` — a few of those directories (`app`, `models`, `utils`, `hooks`) do not exist yet; creating them is fine.
- Secrets live in `expo-secure-store` (RN) and `flutter_secure_storage` (Flutter) under the key `authToken` / `access_token` respectively — do not switch to `AsyncStorage` / `SharedPreferences` for tokens.
- Branch convention for Claude-authored work: develop on the feature branch specified in the task prompt; do not push to `main`.

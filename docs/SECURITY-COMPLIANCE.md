# SECURITY & COMPLIANCE

## Summary

Werkspot Challenger handles Dutch consumer and SMB data, takes payments through Stripe Connect Custom, performs KvK (Kamer van Koophandel) verification on every professional, and uses LLMs on user-supplied photos and text. The security posture must satisfy AVG (Dutch GDPR), PCI-DSS SAQ-A via Stripe, Wet DBA / KOR-relevant tax record retention, and meet the bar of a trustworthy marketplace for consumer in-home services. This document is the source of truth for how we meet those obligations and how we operate day-to-day.

Scope: Flutter mobile client, Next.js customer + admin web, Supabase backend (Postgres + Storage + Edge Functions + Auth), Stripe Connect Custom, Claude API, Whisper/OpenAI, FCM, KvK Handelsregister API, Cookiebot, PostHog, Sentry, Better Stack, PagerDuty.

## GDPR / AVG

### Lawful basis per data category

| Data category | Lawful basis | Retention |
|---|---|---|
| Customer account (name, email, phone, address) | Contract (Art. 6(1)(b)) | Life of account + 30 days after deletion request |
| Professional account + KvK + BTW | Legal obligation + contract | 7 years after last transaction (Dutch tax law) |
| Payment records (Stripe metadata, invoices) | Legal obligation | 7 years (Dutch tax law) |
| Job descriptions + photos | Contract + legitimate interest (service delivery) | Job life + 24 months |
| Chat messages | Contract + legitimate interest (dispute resolution) | 24 months |
| AI prompts and completions | Legitimate interest (quality, safety) | 90 days, pseudonymized after 30 |
| Reviews | Legitimate interest (marketplace integrity) | Indefinite, visible until account deletion + 30 days |
| Analytics (PostHog) | Consent (non-essential cookies) | 13 months |
| Device + session logs (auth, IP) | Legitimate interest (security) | 12 months |
| Marketing preferences | Consent | Until withdrawn |

Consent is captured via Cookiebot on web and an in-app consent screen on mobile; every toggle writes to a `consent_events` table with timestamp, IP, user agent, and policy version.

### DSAR (Data Subject Access Request)

- Export, correction, restriction, objection, and deletion requests land in `/admin/dsar` queue.
- Automated pipeline: request → identity verification (magic link re-auth + email confirm) → background job exports JSON + PDF via `dsar.export_user(uid)` Edge Function → secure download link valid 7 days.
- SLA: acknowledge within 72h, fulfill within 30 days per Art. 12(3).
- Deletion preserves records required by tax law (transaction history) but pseudonymizes the subject (name → `Verwijderde gebruiker #<hash>`, email/phone cleared, photos hard-deleted from Storage).
- DSAR drill runs every quarter; metric tracked in the ops review.

## PCI-DSS SAQ-A

No card data ever touches our servers. All card capture uses Stripe Elements (web) and Stripe SDK (Flutter) which tokenize client-side. We store only Stripe `payment_method_id` and `payment_intent_id`. Annual SAQ-A self-assessment filed with our acquirer (Stripe). Network segmentation is enforced at the Vercel + Supabase layer; our CSP disallows any non-Stripe card script.

## KvK Verification Pipeline

Every professional signup invokes the Handelsregister API with the submitted KvK-nummer. Flow:

1. Client submits KvK number + BTW-nummer.
2. Edge Function `kvk.verify` calls Handelsregister, pulls legal name, trade names, address, SBI activity codes.
3. Activity codes are matched against an allowlist of handyman-trade SBI codes (43.21, 43.22, 43.31, etc.).
4. On match + active registration → `kvk_verified_at` timestamp set, pro can accept jobs.
5. On mismatch, expired registration, or edge case → pushed to manual review queue in admin panel; reviewer has 48h SLA; pro sees "Verificatie in behandeling" status.
6. `kvk_verified_at` gates access to promoted listings, featured placement, and the Scale subscription tier.
7. Annual re-verification via cron; silent failure pushes to review queue.

## Stripe Connect KYC

Stripe Connect Custom with full KYC passed through: tax ID, government ID upload, proof of address, selfie liveness (Stripe Identity). `stripe_account_id` stored per pro; charges rejected if Stripe returns `requirements.currently_due` non-empty. We never ask for KYC docs outside of Stripe's hosted flow.

## Sub-Processors and DPAs

Sub-processor list (kept current in `/legal/subprocessors.md`, surfaced to users on the public site):

| Sub-processor | Purpose | Region |
|---|---|---|
| Supabase | Postgres, Storage, Auth, Edge Functions | EU (Frankfurt) |
| Vercel | Next.js hosting, edge network | EU regions pinned |
| Stripe Payments Europe | Payments, Connect, Identity | EU + adequacy decision |
| Anthropic (Claude) | LLM inference | EU (Frankfurt) when available, US fallback under DPA |
| OpenAI (Whisper) | Speech-to-text for voice quotes | EU routing, zero-retention API tier |
| KvK | Handelsregister lookup | NL |
| Firebase Cloud Messaging | Push | EU routing |
| Sentry | Error tracking | EU (Frankfurt) |
| PostHog | Product analytics | EU (Frankfurt) |
| Better Stack | Uptime/log aggregation | EU |
| Cookiebot | Consent management | EU |
| PagerDuty | Incident paging | US with SCCs + EU data-residency add-on |

Each sub-processor has a signed DPA referenced in our privacy policy. A standard DPA template is offered to pros who themselves become data controllers for customer personal data (e.g., when a pro stores customer contact details in their own CRM outside Challenger).

## Data Residency & Encryption

- Supabase project pinned to `eu-central-1` (Frankfurt). No cross-region replication outside EU.
- Sub-processors outside EU require adequacy decision or SCCs with TIA.
- TLS 1.3 on every public endpoint; HSTS preload; no plaintext HTTP.
- At-rest AES-256 via Supabase-managed encryption.
- Secrets in Vercel environment variables + Supabase vault; no `.env` files in git (pre-commit secret scanning via `gitleaks`).
- Database backups encrypted, stored in EU, 30-day retention, tested monthly (see `RUNBOOKS.md`).

## Authentication

- Supabase Auth with magic link (primary), Google OIDC, Apple Sign-In.
- MFA mandatory for all professional accounts (TOTP; WebAuthn in Y2).
- Sessions rotate on privilege elevation (e.g., Stripe payout change, email change).
- Device trust signals: device fingerprint, IP ASN, geo-velocity; anomalous login triggers step-up.
- JWT short-lived (1h) + refresh token rotation; refresh token reuse detection revokes family.

## Row-Level Security

RLS policies on every tenant-scoped table. Dedicated CI gate:

- `pgtap` suite under `/supabase/tests/rls/*.sql` asserts every `SELECT/INSERT/UPDATE/DELETE` path for each role.
- `rls-coverage` script parses `pg_policies` and fails CI if any table has RLS disabled or any policy lacks a matching test.
- Per-PR: policy diffs surface in review; reviewer must initial the "RLS delta reviewed" checkbox for any `policies/` change.

See `TESTING-STRATEGY.md` for the full CI gate setup.

## Audit Logging

- `audit_log` table captures every admin action (user lookup, DSAR execution, moderation decision, subscription change, pro suspension) and every data-exposing query run through admin tooling.
- Fields: `actor_id, action, target_type, target_id, payload_hash, ip, user_agent, correlation_id, created_at`.
- Retained 2 years. Append-only via RLS; no UPDATE/DELETE grants.
- Sensitive actions (password reset by admin, manual payout, bulk export) trigger Slack alert to #sec-audit and require a second approver.

## Prompt-Injection Defense

LLM-touching paths (quote generation, photo analysis, chat suggestions):

- **System prompts pinned** and versioned in `/packages/prompts`; hash compared at inference time to detect drift.
- **User-supplied text escaped** via defensive delimiters; `<user_input>` blocks clearly labeled; no concatenation of untrusted text into instruction segments.
- **Tool calls schema-validated** with Zod on the way out of the LLM; malformed calls rejected and logged.
- **Output confidence gate**: AI outputs below a calibrated confidence threshold are flagged "AI-concept" and require human sign-off before customer-facing display.
- **PII exfiltration refusal**: system prompts explicitly instruct refusal on "tell me the other user's…" style prompts; red-team eval set covers 60+ injection patterns and runs nightly.
- **Egress filter** on LLM outputs: regex sweep for IBAN, BSN, phone, email patterns that don't belong to the current context; any hit blocks the response and pages T&S.

## Trust & Safety

- **AI pre-screen** on every uploaded photo (NSFW, weapons, minors-visible, license plates, faces) using a vision model; hits route to human moderation queue.
- **Review moderation**: AI classifier flags defamation, off-platform contact, personal data; human moderator resolves within 24h.
- **Pro suspension workflow**: three-strike system logged in `pro_strikes`; automatic freeze on fraud score > threshold; manual override with audit log entry and reason.
- **Payment fraud scoring**: Stripe Radar + our own signals (device reuse across accounts, velocity, geo-mismatch between job postal code and IP, BNPL-to-dispute ratio). Block at score > 85, review 60-85.

## Vulnerability Management

- `Dependabot` enabled on all repos, grouped updates weekly.
- `npm audit` and `dart pub outdated` run in CI; high/critical fails the build.
- `trivy` scans container images and Edge Function bundles; critical CVE SLA 48h, high 7 days, medium 30 days.
- Weekly DAST scan via OWASP ZAP against staging; findings triaged Monday.
- `gitleaks` and `detect-secrets` pre-commit and in CI.

## Bug Bounty

Public bug bounty launched at end of Phase 5 via Intigriti (EU-native, Dutch customer base). Scope: production web + mobile + public API. Out of scope: DoS, social engineering, self-XSS. Payouts per severity CVSS band with a 72h triage SLA.

## Incident Response

- On-call rotation via PagerDuty, weekly handoff, 15-min response SLA for P0/P1.
- Severity matrix:
  - **P0**: data breach confirmed, payments processing down, auth bypass. Page CEO + DPO.
  - **P1**: degraded revenue-critical flow, >5% user impact.
  - **P2**: single-feature degradation.
  - **P3**: cosmetic.
- Breach notification: within 72h to Autoriteit Persoonsgegevens per AVG Art. 33; affected users notified without undue delay per Art. 34 when risk is high.
- Postmortem template in `/docs/templates/postmortem.md`; blameless; action items tracked in Linear with due dates; quarterly review of recurring themes.

See `RUNBOOKS.md` for scenario playbooks.

## Employee Access

- Least-privilege RBAC; SSO via Google Workspace (MFA enforced).
- Production database access via short-lived Supabase service-role tokens issued through a break-glass tool (`ops/grant-prod-access`) with audit trail and 1-hour TTL.
- Quarterly access review; offboarding revokes within 1 business hour.
- Break-glass: two-person approval, Slack-audited, auto-expires, full query log attached to postmortem.

## Compliance Roadmap

- **Y1**: SOC2 Type I readiness (policies, controls, evidence collection); ISO 27001 gap analysis.
- **Y2**: SOC2 Type II audit; ISO 27001 certification.
- **Ongoing**: annual pen test by EU-based firm; annual DPIA; AVG audit by external DPO consultant.

## Cross-Links

- `RUNBOOKS.md` — incident playbooks referenced from this doc
- `TESTING-STRATEGY.md` — RLS CI gate, security tests, DAST cadence
- `LAUNCH-CHECKLIST.md` — the pre-launch security gate
- `MONETIZATION.md` — Stripe Connect boundary for PCI scope

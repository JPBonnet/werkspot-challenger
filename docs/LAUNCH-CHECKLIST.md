# LAUNCH CHECKLIST

The ship-to-stores gate. Every box must be checked and dated with initials before submitting the Flutter app to the App Store and Play Store and cutting the Next.js production tag. Owners in brackets.

## Builds

- [ ] Codemagic iOS workflow green on `release/*` for 3 consecutive runs [Mobile Lead]
- [ ] Codemagic Android workflow green on `release/*` for 3 consecutive runs [Mobile Lead]
- [ ] iOS build signed with production distribution cert, provisioning profile valid >90 days [Mobile Lead]
- [ ] Android build signed with upload key + Play App Signing enrolled [Mobile Lead]
- [ ] iOS release track = App Store; TestFlight external build validated by 10 pilot pros [Mobile Lead]
- [ ] Android release track = Production; Internal testing → Closed → Open → Production progression documented [Mobile Lead]
- [ ] dSYMs uploaded to Sentry for iOS build; symbolication verified on a test crash [Mobile Lead]
- [ ] Android ProGuard mapping uploaded to Sentry; deobfuscation verified on a test crash [Mobile Lead]
- [ ] Next.js production build deployed to Vercel `production` env; source maps uploaded to Sentry [Web Lead]
- [ ] Bundle size budget: Flutter IPA <60 MB, APK <40 MB, web initial JS <200 KB gzipped [Mobile Lead / Web Lead]

## Store Assets

- [ ] App icon 1024×1024 (iOS) + 512×512 (Android) [Design]
- [ ] iPhone 6.7" screenshots ×6 [Design]
- [ ] iPhone 5.5" screenshots ×6 [Design]
- [ ] iPad 12.9" screenshots ×6 [Design]
- [ ] Android phone screenshots ×6, 7" tablet ×4, 10" tablet ×4 [Design]
- [ ] App preview video iOS 30s (NL voiceover) [Design]
- [ ] Android feature graphic 1024×500 [Design]
- [ ] App Store copy NL + EN: title, subtitle, description, keywords, promo text [Marketing]
- [ ] Play Store copy NL + EN: title, short description, full description [Marketing]
- [ ] Age rating: 4+ (iOS) / PEGI 3 (Android) — no user-generated photos visible without moderation [Legal]
- [ ] Play Data Safety form completed and signed off [Legal]
- [ ] iOS App Privacy nutrition label completed [Legal]
- [ ] Category: Business (primary), Lifestyle (secondary) [Marketing]
- [ ] Support URL + marketing URL + privacy URL live and returning 200 [Web Lead]

## Legal

- [ ] Privacy policy published NL + EN, version-stamped, linked from app + web [Legal]
- [ ] Terms of service NL + EN published and in-app accept flow logs version to `consent_events` [Legal]
- [ ] Pro Terms (separate from consumer ToS) covering commission, payout, IP on photos [Legal]
- [ ] DPA template downloadable for pros acting as data controllers [Legal]
- [ ] Sub-processor list public and dated [Legal]
- [ ] Cookiebot deployed on web, scan clean, no pre-consent non-essential cookies [Web Lead]
- [ ] AVG record of processing activities (Art. 30) maintained in Notion and exported to `/legal/` [DPO]
- [ ] Retention schedule documented and matches `SECURITY-COMPLIANCE.md` [DPO]
- [ ] DPIA completed for AI-backed features (photo analysis, quote generation) [DPO]
- [ ] Cookie banner: reject-all equally prominent as accept-all (AP guidance) [Web Lead]

## Compliance

- [ ] PCI-DSS SAQ-A self-assessment signed and filed with Stripe [DPO]
- [ ] KvK Handelsregister API in live credentials, rate limits confirmed, fallback queue tested [Backend]
- [ ] Stripe Connect Custom production account activated, KYC flow verified with 2 test pros [Payments]
- [ ] Pro age gate: 18+ verified via Stripe Identity [Backend]
- [ ] Moderation queue staffed, SLA documented (24h for reviews, 2h for photo flags) [T&S]
- [ ] BTW (VAT) invoice templates reviewed by Dutch accountant [Finance]
- [ ] Intrekkingsrecht (right to withdraw) not applicable for dienstverlening started with consent — copy reviewed [Legal]

## Security

- [ ] All secrets in Vercel + Supabase vault; no `.env` in git (gitleaks clean on full history) [SecOps]
- [ ] Dependabot enabled, all critical + high advisories resolved or risk-accepted with date [SecOps]
- [ ] `npm audit` + `dart pub outdated` clean at high/critical [SecOps]
- [ ] `trivy` scan clean on all container images and Edge Function bundles [SecOps]
- [ ] Secret-scan pre-commit hook installed on every dev machine; baseline committed [SecOps]
- [ ] RLS coverage CI gate passing; every table has policies, every policy has pgtap test [Backend]
- [ ] MFA enforced for every admin + pro account [Backend]
- [ ] Break-glass procedure rehearsed; audit log captures drill [SecOps]
- [ ] External pen test report received, critical + high findings closed [SecOps]
- [ ] Bug bounty private beta announced to Intigriti, scope locked [SecOps]

## Observability

- [ ] Sentry releases tagged per build (mobile + web + Edge Functions) [SRE]
- [ ] Sentry alerts routed to PagerDuty by severity [SRE]
- [ ] PostHog session replay enabled, PII masking verified on email/phone/IBAN inputs [Web Lead]
- [ ] Better Stack synthetic probes live on 6 critical endpoints, alerts wired to PagerDuty [SRE]
- [ ] PagerDuty on-call rotation populated for 8 weeks, escalation policies tested [SRE]
- [ ] SLOs documented and dashboarded: availability 99.9%, p95 <400ms, payment success >99.5% [SRE]
- [ ] Structured logging verified: every revenue-critical request emits correlation_id, user_id, outcome [SRE]
- [ ] Log retention: 90 days hot, 1 year cold [SRE]

## Resilience

- [ ] k6 load at 3× forecast Y1 peak passes on all 6 revenue-critical endpoints [SRE]
- [ ] Toxiproxy chaos suite green (Stripe, OpenAI, Claude, KvK, FCM, Supabase Realtime) [SRE]
- [ ] Monthly restore drill scheduled; last drill completed within 30 days, RPO 15min + RTO 1h met [SRE]
- [ ] Backup encryption verified; cross-region EU backup replication enabled [SRE]
- [ ] Stripe webhook idempotency keys verified across 10k-event replay test [Payments]
- [ ] Rate limits tuned: public endpoints 60 rpm/IP, auth endpoints 10 rpm/IP, AI endpoints per-user quota [Backend]

## Ops

- [ ] Runbooks in `RUNBOOKS.md` rehearsed via tabletop by on-call team [SRE]
- [ ] Postmortem template pinned in Linear; one rehearsal postmortem filed [SRE]
- [ ] Kill switches implemented and tested on: AI photo-quote, AI chat suggest, AI subsidy, promoted listings, instant payout, BNPL, smart-quote fee [Backend]
- [ ] Kill-switch UI in admin panel behind break-glass MFA [Backend]
- [ ] Status page live at `status.werkspot-challenger.nl` with automated component updates [SRE]
- [ ] Customer support rota + Zendesk macros NL + EN [Support Lead]
- [ ] Billing reconciliation job scheduled weekly, Finance notified on drift >€100 [Finance]

## Trust & Safety

- [ ] AI pre-screen live on every photo upload (NSFW + weapons + minors + license plates + faces) [T&S]
- [ ] Human moderation queue live, SLA 24h on reviews, 2h on photo flags [T&S]
- [ ] Pro suspension workflow tested end-to-end in staging [T&S]
- [ ] Stripe Radar + custom fraud scoring live; block >85, review 60-85 [Payments]
- [ ] DSAR automation: end-to-end drill under 30 days, average 7 days [DPO]
- [ ] Chat PII-stripping pre-match verified across 50-pattern test set [Backend]
- [ ] Review moderation AI + human flow tested on 100-review fixture [T&S]
- [ ] Off-platform leakage detection signals wired to reputation engine [Backend]

## Exit Criteria

- [ ] All boxes above green and initialed with date [CTO]
- [ ] 30 consecutive days of 99.9%+ uptime recorded in Better Stack on production [SRE]
- [ ] AI cost running at <4% of commission revenue over the prior 7 days [Finance + AI Lead]
- [ ] No P0 or P1 incidents unresolved [SRE]
- [ ] Board sign-off + DPO sign-off recorded in `/legal/launch-approval.pdf` [CTO + DPO]

## Cross-Links

- `SECURITY-COMPLIANCE.md` — the security + privacy controls this list references
- `TESTING-STRATEGY.md` — the test gates that feed into this checklist
- `RUNBOOKS.md` — the incident response maturity this checklist assumes
- `MONETIZATION.md` — the AI cost ceiling referenced in exit criteria

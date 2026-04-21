# Product Requirements — Werkspot Challenger

## Summary

Werkspot Challenger is a Dutch handymen marketplace that replaces the lead-fee model with a fair 10% commission + escrowed milestone payments, layers AI (voice job-posting, photo-to-quote, multilingual chat, subsidy co-pilot) across the full lifecycle, and opens a defensible wedge in the €4–7B energy-transition segment. Launch market: Netherlands, Amsterdam metro first, Pros-first acquisition.

Cross-reference: [ARCHITECTURE.md](./ARCHITECTURE.md) · [AI-PRODUCT-FEATURES.md](./AI-PRODUCT-FEATURES.md) · [MONETIZATION.md](./MONETIZATION.md) · [GTM.md](./GTM.md)

## Personas

### Pro (primary launch persona)
- Self-employed (ZZP) or small-firm tradesperson (plumber, electrician, painter, tiler, HVAC/heat-pump installer, solar installer, insulation specialist).
- Goal: steady pipeline of pre-qualified jobs without burning €60–200/mo on speculative Werkspot leads.
- Pain: pays per lead even when ghosted; races-to-bottom against 4 other quotes; no invoicing/BTW tools; limited Dutch-only chat excludes capable migrant pros.
- Context of use: mobile first — van, site, before/after work. Push-driven. Offline-tolerant.

### Homeowner
- Owner-occupier (57% of NL households), aging housing stock (40% pre-1975), often VvE-bound for shared-building work.
- Goal: get a trustworthy pro for a fair price, fast; for energy-transition projects, understand subsidies and total-net cost.
- Pain: opaque pricing (quotes vary 100–300%), quality gambling, coordination burden across trades, post-match ghosting.
- Context of use: web for research/large projects, mobile for urgent + chat + payment.

### VvE admin (Phase 5)
- Volunteer or professional manager for a housing association (2–200 units).
- Goal: structured multi-trade project sourcing + audit trail + collective invoicing.
- Pain: informal WhatsApp threads, zero procurement rigor, dispute nightmares.

## Jobs to be done

- Pro: *"When a qualified job in my area comes in, I want to accept it in two taps and get paid instantly when I finish, so I can stop paying for leads that ghost me."*
- Homeowner: *"When something breaks or I'm planning a renovation, I want to describe it once (voice or photos), see a realistic price range, and get a vetted pro booked with escrow, so I'm not gambling on quality or price."*
- VvE admin: *"When our building needs a multi-trade job, I want to run a structured tender with audit trail, so I satisfy my members without being a full-time project manager."*

## Feature set (launch scope = Phases 1–4; Phase 5–6 flagged)

### Pro-facing
- **Signup + KvK verification** — magic link → KvK Handelsregister lookup (auto-verify or human queue) → Stripe Connect KYC → profile. *Accept:* 90% of legitimate pros reach "active" in <10 minutes; suspicious KvK routed to queue within 30s.
- **Job feed + radius filter** — geo + category + urgency filter, sorted by match score. *Accept:* p95 feed load <800ms; matches honor RLS `pro_read_active_jobs`.
- **Accept / reject / start / complete state machine** — with push confirmation at each step. *Accept:* state transitions audited in `job_events`; no skip-states possible.
- **Chat** — realtime, photo attachments, translation bridge (see AI features). *Accept:* message delivered <1s; translation latency <2s p95.
- **Calendar + scheduling** — conflict detection, Google/Apple Calendar sync. *Accept:* double-booking impossible from the UI.
- **Quotes** — manual or AI-drafted; line items; valid-until; single-tap accept from customer.
- **Earnings + payout** — breakdown per job, commission shown, Instant Payout button (1% fee, opt-in).
- **ChallengerPRO subscription** — Starter/Growth/Scale tiers in-app purchase via Stripe. (Phase 5)

### Homeowner-facing
- **Signup** — magic link or Apple/Google, zero-friction.
- **Post a job** — three entry points: form, photo-first, voice-first (AI features). *Accept:* voice flow completes <30s end-to-end for 80% of attempts.
- **AI price estimate** — confidence-banded range with onsite-verify checklist.
- **Review quotes + book** — one-tap accept + Stripe escrow hold.
- **Milestone release** — approve each milestone to release funds; dispute button.
- **Review** — rating + body + optional photos, within 7 days of completion.
- **Neighbor-trust feed** — postal-code graph of completed jobs in your buurt. (Phase 4)
- **Subsidy co-pilot** — for ISDE/SEEH/BTW-eligible projects; pre-filled RVO form. (Phase 4)

### Admin (Next.js backoffice)
- User + pro management, suspension workflow.
- Moderation queue: photos, reviews, chat flags (AI pre-screened).
- Payment + payout oversight + manual release for disputes.
- Feature-flag dashboard (mirror of PostHog).
- KYC/KvK review queue.
- Financial reports: GMV, commission, subscription MRR, ancillary revenue.

### AI-powered (detailed in [AI-PRODUCT-FEATURES.md](./AI-PRODUCT-FEATURES.md))
- Voice job-posting (Whisper + Claude Sonnet).
- Photo-to-quote-range (Claude Sonnet Vision + `postal_code_stats`).
- Multilingual chat bridge (Claude Haiku on `messages` insert).
- ISDE/SEEH/BTW subsidy co-pilot.
- AI quote-drafter for ChallengerPRO subs.
- Neighbor-trust blurbs (nightly cron).
- AI dispute mediator. (Phase 5, human-in-loop >€500)

### Payments
- Stripe Connect Custom escrow; iDEAL + card + Apple/Google Pay + Klarna (BNPL on >€2k jobs, Phase 5).
- Milestone-based release; automatic 72h release if customer doesn't respond + no dispute.
- Instant Payout 1% opt-in.
- Commission 10% deducted at release; all amounts in cents, nl-NL `€` formatting.

### Messaging
- Realtime (Supabase channel `chat:job:{id}`); typing indicators; read receipts.
- Photo + file attachments via signed-URL `chat-attachments` bucket.
- Translation bridge stores `body_translated` jsonb keyed by locale.
- Off-platform contact-share detection (phone/email regex) → soft warning + reputation flag.

### Reviews
- Rating 1–5 + body + optional photos, within 7 days of completion.
- Pro reply once; no edit after 30 days.
- Moderation queue AI pre-screen + human.

### Verification
- KvK Handelsregister lookup on pro registration; `kvk_verified_at` timestamp gates premium placement.
- Stripe Connect KYC automated (tax ID + ID doc + address).
- Insurance verification upload (Phase 5).

### B2B (Phase 5)
- VvE admin portal: structured tenders, multi-pro coordination, collective invoicing, audit trail export.

## Non-goals

- **No lead-fee model, ever.** This is the wedge — never revisit.
- No US / BE / DE launch in Y1; NL only.
- No DIY-tutorial content — we match pros, not replace them.
- We do not underwrite insurance ourselves; we partner.
- No in-app banking product.
- No social feed beyond neighbor-trust.

## Success metrics — Year 1 targets

| Metric | Target |
|---|---|
| Active pros (90-day actives) | 4,000 |
| Paid jobs completed | 40,000 |
| GMV | €18M |
| Platform revenue | €3.4M |
| Pro activation (signup → first accepted job ≤14 days) | ≥55% |
| Homeowner job-post → booked pro ≤48h | ≥70% |
| Voice/photo-quote job-creation share | ≥35% |
| AI cost / commission revenue | <4% |
| Pro NPS | ≥40 |
| Homeowner CSAT post-job | ≥4.5/5 |
| Payment dispute rate | <0.8% |
| Chargeback rate | <0.15% |
| Off-platform leakage rate | <8% |

## Dependencies + assumptions

- Stripe Connect Custom approval for NL (KYC automation viable).
- KvK Handelsregister API access (commercial tier).
- Supabase EU region available + AVG-compliant DPA.
- Claude prompt caching reduces AI cost to budget.
- Codemagic build pipeline for Flutter sign + ship.
- App Store Connect + Play Console accounts provisioned under Werkspot Challenger B.V.
- Stripe Radar + our fraud signals sufficient for launch; no custom ML model required in Y1.


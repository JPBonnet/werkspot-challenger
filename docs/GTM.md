# Go-to-Market — Werkspot Challenger

## Summary

Pros-first. Win the dissatisfied supply side, demand follows. Launch in Amsterdam metro, pivot inward on the energy-transition vertical (heat pump / solar / insulation) where loyalty is unformed and subsidies are a natural acquisition hook. Kill Werkspot on economics (10% commission vs ~25% implicit), trust (escrow + KvK), UX (AI voice/photo/chat), and professional empowerment (ChallengerPRO CRM + BTW export).

Cross-reference: [PRD.md](./PRD.md) · [MONETIZATION.md](./MONETIZATION.md) · [COMPETITIVE-LANDSCAPE.md](./COMPETITIVE-LANDSCAPE.md) · [OPPORTUNITY-ANALYSIS.md](./OPPORTUNITY-ANALYSIS.md)

## Phase 0 — Pre-launch (Weeks 1–4)
- Landing page `werkspot-challenger.nl` (pro-focused copy + homeowner preview).
- Pro waitlist: target 500 signups pre-launch, Amsterdam metro.
- 50 structured pro interviews (30 general trades, 20 energy-transition) → validate pricing + tooling gaps.
- 20 homeowner interviews → validate voice/photo-quote UX.
- Manifesto post: "We built this because Werkspot charges your business whether you win or lose." Distribute via trade Facebook groups, ZZP WhatsApp circles, /r/Netherlands.

**KPIs:** 500 pro waitlist signups; 50 interview reports committed to `docs/research/`.

## Phase 1 — Pros-first wedge (Months 2–4)
- Onboard 200 founding pros in Amsterdam metro.
- Founder offer: **0% commission for first 90 days + ChallengerPRO Starter free for 6 months.** Zero lock-in.
- Concentrate on energy-transition specialists: heat pump (Daikin/Atlas Copco/Mitsubishi-trained), solar installers, insulation crews. These have the highest job values (€5k–25k) and the subsidy co-pilot is a hard-to-match magnet.
- Pro-acquisition channels:
  - Direct outreach: scraped Werkspot public profiles → cold email + WhatsApp (AVG-compliant B2B legitimate-interest basis).
  - Trade-association partnerships: Techniek Nederland, Bouwend Nederland, NVI (insulation).
  - Branchevereniging Warmtepomp sponsorship.
  - Referral: **pro-refers-pro = €100 platform credit** when referee completes 3 jobs.
- CAC target pro: <€120.

**KPIs:** 200 active pros, 500 jobs completed, 90% pro NPS-survey response rate, <5% churn.

## Phase 2 — Homeowner flywheel (Months 4–6)
- Subsidy-calculator microsite as acquisition hook ("Hoeveel krijg je terug op je warmtepomp?") — gated on email + postal code; downstream pro-booking funnel.
- Local SEO/SEA: 50 landing pages per buurt × energy-transition keywords.
- Content: weekly subsidy guides, renovation cost breakdowns, neighbor case studies. SEO moat against Werkspot's ad spend.
- Instagram + TikTok creator partners: 10 Dutch home-reno creators × revenue share on booked jobs.
- Referral: **homeowner-refers-homeowner = €25 off next job**, referee gets €25 credit.
- CAC target homeowner: <€18 blended.

**KPIs:** 10,000 homeowner signups, 3,000 first jobs, 35% of jobs created via voice or photo-quote.

## Phase 3 — Geographic expansion (Months 6–12)
- Rollout sequence: Utrecht → Rotterdam → Den Haag → Eindhoven → Randstad tail.
- Per-city playbook: local trade-association warm intro + 20 founding pros + hyperlocal subsidy content.
- Feature flag `region:{city}` gates launch; PostHog canary 10% → 50% → 100%.

**KPIs:** 4,000 active pros nationwide; 40,000 paid jobs; GMV €18M; revenue €3.4M (Y1 target).

## Phase 4 — B2B channel (Year 2)
- VvE admin portal + woningcorporatie pilots (Ymere, Stadgenoot, de Alliantie).
- Offer: multi-trade structured tenders, audit-trail export, collective invoicing, 7% platform fee (vs 10%) in exchange for volume commitment.
- Partnerships: VvE-beheer software (Twinq, Atrium) for integrated pro sourcing.

**KPIs Y2:** 3 signed corporatie contracts, 500 VvEs, €15M GMV via B2B.

## Acquisition channels — CAC estimates

| Channel | Audience | CAC Y1 | Notes |
|---|---|---|---|
| Direct outreach | Pros | €40–80 | High-touch, manifesto-driven |
| Paid search (Google Ads) | Pros + homeowners | €120 / €25 | High intent; expensive on "loodgieter" |
| Paid social (Meta/TikTok) | Homeowners | €12–20 | Subsidy-calculator hook |
| SEO + content | Homeowners | €6–10 amortized | Moat, slow ramp |
| Referral (pro→pro) | Pros | €100 credit | Best quality |
| Referral (hom→hom) | Homeowners | €25 credit × 2 | |
| Trade-association sponsorship | Pros | €200–400 | High trust lift |
| Creator partnerships | Homeowners | Rev-share 5% | Scales with video |

## Retention

- **Pro stickiness:** ChallengerPRO CRM holds past jobs, notes, photos, invoices → switching cost. BTW export at tax deadline is a lock-in moment. Subsidy co-pilot is the killer feature for energy-transition pros.
- **Homeowner stickiness:** completed-job history + neighbor-trust graph + recurring-maintenance reminders (annual boiler/heat-pump service, gutter cleaning).
- **Data moat:** every completed job enriches `postal_code_stats`; every translated chat improves our glossary.

## Content strategy

- Pillar content: ISDE guide, SEEH guide, BTW-verlaagd rules, heat-pump buyer's guide, solar ROI calculator, floor-insulation payback.
- Weekly: "Buurt spotlight" — real completed jobs in a neighborhood (anonymized, opt-in pro).
- Tool-first: `werkspot-challenger.nl/subsidie` calculator ranks for "warmtepomp subsidie 2026" within 6 months.
- Distribution: SEO, Nextdoor, Funda (negotiate widget deal), VvE newsletters.

## Partnerships

| Partner | Purpose | Status |
|---|---|---|
| Bouwmaat / Hornbach / Gamma | Materials affiliate 3–8% | Target Phase 5 |
| in3 / Klarna | BNPL for >€2k jobs | Target Phase 5 |
| Techniek Nederland | Trade credibility + pro acquisition | Phase 1 |
| Milieu Centraal | Energy-transition content co-brand | Phase 2 |
| Funda | Widget on listing pages ("book a pro") | Phase 3 |
| RVO | Subsidy data access | Phase 4 |
| VvE-beheer SaaS (Twinq, Atrium) | B2B channel | Phase 4 |
| Centraal Beheer / Interpolis | Insurance-backed guarantee | Phase 6 |

## Defensibility

- **vs Werkspot:** our economics make their professional churn our supply; they can't drop lead fees without breaking their P&L.
- **vs Zoofy:** they own instant-booking small-task niche; we own end-to-end + complex projects + energy transition. Different lane.
- **vs Homedeal / Offerteadviseur:** they're lead aggregators with no trust infrastructure; escrow + KvK alone beats them.
- **vs Google Local Services (if NL entry):** our data moat (neighbor-trust, postal_code_stats) + Dutch subsidy specialization + energy-transition partnerships + BTW tooling are locally defensible. If Google enters, our pros are locked into our CRM by then.
- **vs AI disruption:** we *are* the AI disruption. Our competitors are form-based; we are voice/photo-native.

## KPIs summary

| Phase | Pro count | Jobs/mo | GMV/mo | Revenue/mo |
|---|---|---|---|---|
| 1 (M2–4) | 200 | 400 | €180k | €36k |
| 2 (M4–6) | 800 | 1,500 | €700k | €135k |
| 3 (M6–12) | 4,000 | 3,500 | €1.5M | €290k |
| 4 (Y2) | 12,000 | 15,000 | €7.5M | €1.4M |

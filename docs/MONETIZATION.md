# MONETIZATION

## Summary

Werkspot Challenger monetizes by aligning platform revenue with professional earnings. The incumbent (Werkspot) charges professionals €5-80 per lead at a 15-25% conversion rate, meaning pros pay for leads that mostly don't close. We kill lead fees entirely. Our revenue is a 10% commission on completed, paid work — plus a subscription (ChallengerPRO) for pros who want growth tooling — plus a set of opt-in ancillary products that each solve a real pain point (instant payout, smart-quote AI, subsidy paperwork, materials procurement, BNPL for customers, per-job insurance, promoted visibility).

### Philosophy

**The platform wins when pros win.** We never charge for a lead. A pro pays us when money moves, not when hope moves. Every ancillary fee is opt-in and ships with a clear ROI statement in the UI ("This €49 subsidy fee unlocks €2,400 avg ISDE rebate for your customer — which unblocks this €8,000 heat-pump job you'd otherwise lose"). This is the anti-Werkspot narrative and it drives the entire pricing posture.

## Revenue Streams

### 1. Commission — 10% of GMV

Charged on every completed, paid job settled through Stripe Connect Custom. Deducted at payout.

**Unit economics (base case, avg job €450 GMV):**

| Line item | Amount | Notes |
|---|---|---|
| GMV | €450.00 | Customer pays via Stripe |
| Commission (10%) | €45.00 | Platform take |
| Stripe fees (2.9% + €0.30) | -€13.35 | Card processing on full GMV, absorbed by platform |
| AI cost (target <4% of commission) | -€1.80 | Claude + Whisper amortized per job |
| Payment ops + chargeback reserve | -€2.25 | ~5% of commission |
| Support allocation | -€4.50 | ~10% of commission, declines at scale |
| **Gross contribution per job** | **€23.10** | **~51% gross margin on commission** |

At 200,000 paid jobs in Y3, that's ~€4.6M gross contribution from commission alone. The 4% AI cost ceiling is a hard constraint monitored daily (see RUNBOOKS.md, AI cost spike playbook).

### 2. ChallengerPRO Subscription

Three tiers, billed monthly via Stripe.

| Tier | Price | Target audience | Included |
|---|---|---|---|
| **Starter** | €49/mo | Solo pro, 0-15 jobs/mo | Verified profile, 20 AI quote-drafts/mo, calendar + job inbox, basic reviews |
| **Growth** | €99/mo | Solo + 1-2 employees, 15-40 jobs/mo | Everything in Starter + unlimited AI drafts, lightweight CRM, BTW (VAT) export for accountant, 2 featured postal codes, auto-invoicing |
| **Scale** | €199/mo | Crew of 3-5, 40+ jobs/mo | Everything in Growth + multi-seat up to 5 users, public API, priority placement in search, intelligent lead routing across crew, dedicated account contact |

**Target mix at steady state: 55% Starter / 35% Growth / 10% Scale.** Blended ARPU ≈ €80.60/mo.

Subscriptions are the second-largest revenue line by Y3 and the highest-margin: ~92% gross margin after payment processing and the marginal AI credits bundled in.

### 3. Ancillary Products (all opt-in)

| Product | Price | Who pays | Our take | Rationale |
|---|---|---|---|---|
| Instant payout | 1% of payout amount | Pro (opt-in per payout) | ~70% margin after Stripe instant fees | Default T+2; instant for impatient crews |
| Smart-quote AI fee | 1.5% of quoted GMV | Customer (disclosed in breakdown) | ~85% margin | Triggered when AI photo-quote used and accepted |
| Subsidy co-pilot | €49 success fee | Customer, only on ISDE/BENG rebate approval | ~95% margin | Only charged if rebate lands in customer's account |
| Materials affiliate | 3-8% rev-share | Hubo/Gamma/Praxis (not pro, not customer) | Pass-through | Curated BOM at quote time |
| BNPL kickback | ~1.5% of financed amount | BNPL provider (Billink/in3) | Pass-through | We surface financing in checkout |
| Per-job insurance | €9.95/job | Customer | 60% gross margin after underwriter | Accidental damage + no-show cover |
| Promoted listing | €29/mo per postal code | Pro | ~88% margin | Boosted ranking, capped slots per region |

### Ancillary take assumptions (Y3)

- Instant payout: 25% of jobs opt in
- Smart-quote: 60% of jobs run AI quote, 40% accept with fee disclosed
- Subsidy: 8% of jobs qualify, 55% of those succeed
- Materials: 35% of jobs route BOM
- Insurance attach rate: 18%
- Promoted: 15% of active pros purchase at least one postal code

## Pricing Benchmarks

| Platform | Pro cost model | Customer cost | Our position |
|---|---|---|---|
| **Werkspot** | €5-80 per lead, 15-25% conv → effective €20-320/job won | Free | We charge €0 on unconverted leads; 10% only on wins |
| **Zoofy** | ~€3-15/lead + credit packs | Free | Same logic — no speculative spend |
| **Homedeal** | Lead credits + upsells | Free | We cut the speculative tier |
| **Instapro** | Subscription + leads | Free | We have subs too but no leads |
| **Challenger** | 10% commission on won jobs + opt-in subs | 1.5% smart-quote fee optional | Fair trade, transparent |

Customer-side: most competitors are "free to customer." We stay free by default but surface the smart-quote fee as a line item. UX research (covered in `PRD.md`) shows Dutch customers prefer transparency to hidden loading.

## Bottoms-Up Revenue Model

Assumptions:
- Avg GMV/job: €450 (weighted mix — plumbing €250, electrical €400, painting €900, heat-pump €6,500)
- Paid job yield per active pro per month: 4.5
- Paying-sub conversion of active pros: 40%
- Blended ARPU: €80.60

| Metric | Y1 | Y2 | Y3 |
|---|---|---|---|
| Active pros (EOP) | 2,500 | 9,000 | 22,000 |
| Paid jobs (full year) | 52,000 | 280,000 | 780,000 |
| GMV | €23.4M | €126M | €351M |
| Commission (10%) | €2.34M | €12.6M | €35.1M |
| Paying subs (avg through year) | ~800 | ~3,200 | ~8,500 |
| Subscription revenue | €0.77M | €3.1M | €8.2M |
| Instant payout | €0.05M | €0.28M | €0.78M |
| Smart-quote | €0.14M | €0.76M | €2.1M |
| Subsidy co-pilot | €0.05M | €0.27M | €0.75M |
| Materials affiliate | €0.04M | €0.22M | €0.62M |
| Insurance | €0.09M | €0.50M | €1.4M |
| Promoted listings | €0.04M | €0.15M | €0.40M |
| BNPL | €0.02M | €0.11M | €0.31M |
| **Total revenue** | **€3.4M** | **€17.0M** | **€48.0M** |

## Sensitivity

| Scenario | Y3 revenue | Key lever |
|---|---|---|
| Conservative | €31M | Active pros 15k, sub conv 30%, attach rates -25% |
| Base | €48M | Model above |
| Aggressive | €68M | Active pros 28k, sub conv 50%, attach rates +20%, €500 avg GMV |

## Pricing Experiments

1. **Commission floor A/B**: 8% vs 10% vs 12% on a random 10% of new pros for 90 days; measure pro retention + GMV lift; stop rule at 10% retention delta.
2. **Subscription tier boundaries**: shift Growth featured postal codes from 2 → 3 and measure Starter→Growth upgrade rate.
3. **Promoted-listing CPM**: test €29, €39, €49 across postal-code tiers (high-density vs rural); measure fill rate × revenue.
4. **Smart-quote fee framing**: "1.5% AI assistance" vs "€6.75 AI quote fee" as flat line — which converts better in the quote-accept step.
5. **Instant payout price ladder**: 0.5% / 1% / 1.5% to find the inflection.

All experiments run via PostHog flags mirrored to the `feature_flags` table; results land in the weekly growth review.

## Anti-Abuse / Off-Platform Leakage

Our commission model collapses if pros and customers transact off-platform after meeting on Challenger. Defenses:

- **Escrow-by-default**: customer funds held in Stripe Connect until job completion is confirmed; no payout channel exists off-platform.
- **Chat lock**: in-app chat strips phone numbers, WhatsApp links, IBANs, and external payment links pre-match; post-match it opens up but all messages are retained for T&S review.
- **Reputation penalty**: pros flagged for repeat off-platform leakage (customer surveys + pattern detection on "no-show after quote") lose featured placement and incur a 2-week search ranking penalty; repeat offenders deactivated.
- **Customer incentive to stay on-platform**: insurance, BNPL, dispute resolution, and the review that feeds neighbor-trust badges only exist when the transaction settled on Challenger.
- **Pro incentive to stay on-platform**: subsidy co-pilot, materials affiliate kickbacks, BTW export, and instant payout only work for on-platform jobs.

See `PRD.md` section 7 (Trust & Safety) for detection rules and `GTM.md` section 4 (Pro onboarding) for how we frame the commission story during activation.

## Cross-Links

- `GTM.md` — pricing communication, acquisition funnel, activation metrics
- `PRD.md` — feature surface for each revenue stream
- `TESTING-STRATEGY.md` — pricing-experiment evaluation gates
- `SECURITY-COMPLIANCE.md` — Stripe Connect KYC, PCI-DSS SAQ-A boundary

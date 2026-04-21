# ADR-0003: Stripe Connect Custom + escrow milestones

- **Status:** Accepted (2026-04-21)

## Context

Core differentiator is trust. Werkspot post-match leaves payment and disputes off-platform. Our offer is escrow-backed milestone payments with 10% commission deducted on release, plus optional Instant Payout (1%).

## Decision

Use **Stripe Connect Custom accounts** with PaymentIntent manual-capture semantics for escrow. `application_fee_amount` + `transfer_data.destination` take the commission and route net funds to the pro's Stripe balance. Stripe Instant Payouts serve the opt-in 1% speed fee.

## Alternatives considered

- **Stripe Express:** lighter KYC but weaker branding control and less flexibility on payout timing.
- **Adyen:** strong in EU but higher engineering cost, no Connect analog.
- **Mollie (NL-native):** excellent for iDEAL but weak on marketplace split payments and Instant Payouts.
- **Custom escrow via a licensed NL e-money institution:** regulatory cost prohibitive at pre-seed scale.

## Consequences

- (+) PCI-DSS SAQ-A; no card data touches our servers.
- (+) iDEAL + Apple Pay + Google Pay + SEPA + Klarna via Stripe.
- (+) Marketplace compliance + KYC automation handled by Stripe.
- (−) Stripe pricing (2.9% + €0.30); partial offset by commission margin.
- (−) Payout reversal windows require careful `payments.status` state machine.

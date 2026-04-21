import Stripe from "stripe";

export const COMMISSION_BPS = 1000; // 10% in basis points
export const INSTANT_PAYOUT_FEE_BPS = 100; // 1%
export const SMART_QUOTE_FEE_BPS = 150; // 1.5%

export function commissionCents(amountCents: number): number {
  return Math.round((amountCents * COMMISSION_BPS) / 10000);
}

// Lazy so test imports don't require STRIPE_SECRET_KEY.
let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

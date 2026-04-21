import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
  typescript: true,
});

export const COMMISSION_BPS = 1000; // 10% in basis points
export const INSTANT_PAYOUT_FEE_BPS = 100; // 1%
export const SMART_QUOTE_FEE_BPS = 150; // 1.5%

export function commissionCents(amountCents: number): number {
  return Math.round((amountCents * COMMISSION_BPS) / 10000);
}

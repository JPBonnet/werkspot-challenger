// Re-export generated Supabase types. Run `pnpm db:types` to regenerate.
export type { Database } from "./supabase";

// Hand-curated domain aliases.
export type JobStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled" | "rejected";
export type PaymentStatus = "pending" | "held" | "released" | "refunded" | "disputed";
export type SubscriptionTier = "none" | "starter" | "growth" | "scale";
export type SubsidyScheme = "ISDE" | "SEEH" | "BTW_REDUCED" | "OTHER";

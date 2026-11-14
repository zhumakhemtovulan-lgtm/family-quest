import "server-only";
import Stripe from "stripe";

export type BillingPeriod = "monthly" | "yearly";

export const PLAN_PRICES: Record<BillingPeriod, { cents: number; interval: "month" | "year" }> = {
  monthly: { cents: 799, interval: "month" },
  yearly: { cents: 5900, interval: "year" },
};

export const TRIAL_DAYS = 7;

/** Returns a Stripe client, or null when no key is configured (the app then falls back to a demo trial). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!key.startsWith("sk_test_")) {
    // This prototype must never charge real cards.
    console.error("STRIPE_SECRET_KEY must be a test-mode key (sk_test_...)");
    return null;
  }
  return new Stripe(key);
}

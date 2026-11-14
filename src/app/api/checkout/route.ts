import { NextResponse } from "next/server";
import { z } from "zod";
import { PLAN_PRICES, TRIAL_DAYS, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const bodySchema = z.object({ period: z.enum(["monthly", "yearly"]) });

/** Creates a Stripe Checkout session (test mode) for the Family Plan with a 7-day free trial. */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    // No test key configured: the client falls back to a clearly labeled demo trial.
    return NextResponse.json({ demo: true });
  }

  const { period } = parsed.data;
  const price = PLAN_PRICES[period];
  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: price.cents,
            recurring: { interval: price.interval },
            product_data: {
              name: `Family Quest — Family Plan (${period})`,
              description: "A new chapter of your family's story every week.",
            },
          },
        },
      ],
      subscription_data: { trial_period_days: TRIAL_DAYS },
      // The product is for US families: always show English and US dollars,
      // even when the checkout is opened from another country.
      locale: "en",
      adaptive_pricing: { enabled: false },
      success_url: `${origin}/pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout session failed", err);
    return NextResponse.json({ error: "Checkout is unavailable right now." }, { status: 502 });
  }
}

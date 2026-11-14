import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/** Confirms with Stripe that the checkout really completed before unlocking the plan. */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.json({ active: false }, { status: 400 });
  }
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ active: false });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({ active: session.status === "complete" });
  } catch (err) {
    console.error("checkout verify failed", err);
    return NextResponse.json({ active: false }, { status: 502 });
  }
}

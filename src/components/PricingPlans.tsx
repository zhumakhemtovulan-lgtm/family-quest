"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, btnPrimary, btnSecondary } from "@/components/ui";
import { store } from "@/lib/storage";

const FEATURES = [
  "A new chapter of your family's story every week",
  "Bonus quests for rainy days and sleepovers",
  "Quests built from what's in your home tonight",
  "Your family book with every photo card",
  "Up to 4 kids, ages 5–10",
];

type Status = "idle" | "redirecting" | "verifying" | "error";

export default function PricingPlans() {
  const [yearly, setYearly] = useState(true);
  const [plan, setPlan] = useState<"free" | "trial">("free");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPlan(store.getPlan());
    // Coming back from Stripe Checkout: confirm the session on the server before unlocking.
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (params.get("canceled")) setMessage("Checkout canceled. You can try again any time.");
    if (!sessionId) return;
    setStatus("verifying");
    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json() as Promise<{ active?: boolean }>)
      .then((data) => {
        if (data.active) {
          store.setPlan("trial");
          setPlan("trial");
          setStatus("idle");
        } else {
          setStatus("error");
          setMessage("We couldn't confirm the checkout. Please try again.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("We couldn't confirm the checkout. Please try again.");
      })
      .finally(() => window.history.replaceState(null, "", "/pricing"));
  }, []);

  async function startTrial() {
    setStatus("redirecting");
    setMessage(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: yearly ? "yearly" : "monthly" }),
      });
      const data = (await res.json()) as { url?: string; demo?: boolean; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.demo) {
        // Checkout not configured on this deployment: unlock a clearly labeled demo trial.
        store.setPlan("trial");
        setPlan("trial");
        setStatus("idle");
        return;
      }
      throw new Error(data.error || "Checkout is unavailable right now.");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Checkout is unavailable right now.");
    }
  }

  return (
    <div className="mt-2">
      <h1 className="font-display text-center text-4xl font-bold">One adventure a week, for the whole family</h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-ink/70">
        Less than a single activity box, with nothing to ship, store or clean up.
      </p>

      <div className="mx-auto mt-6 flex w-fit rounded-full border-2 border-ink bg-white p-1 text-sm font-extrabold">
        <button
          type="button"
          onClick={() => setYearly(false)}
          aria-pressed={!yearly}
          className={`rounded-full px-4 py-2 ${!yearly ? "bg-ink text-cream" : ""}`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setYearly(true)}
          aria-pressed={yearly}
          className={`rounded-full px-4 py-2 ${yearly ? "bg-ink text-cream" : ""}`}
        >
          Yearly · save 38%
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-lg font-extrabold">Free</h2>
          <p className="font-display mt-2 text-4xl font-bold">$0</p>
          <p className="mt-3 text-ink/70">Your first adventure, start to finish, with the family photo card.</p>
          <Link href="/setup" className={`${btnSecondary} mt-6 w-full`}>
            Try it free
          </Link>
        </Card>

        <Card className="relative bg-sun/40">
          <span className="absolute -top-3 right-5 rounded-full bg-coral px-3 py-1 text-xs font-extrabold text-white">
            Most families
          </span>
          <h2 className="text-lg font-extrabold">Family Plan</h2>
          <p className="font-display mt-2 text-4xl font-bold">
            {yearly ? "$59" : "$7.99"}
            <span className="font-sans text-base font-bold text-ink/60">{yearly ? " / year" : " / month"}</span>
          </p>
          {yearly && <p className="text-sm font-bold text-ink/60">That&apos;s $4.92 a month.</p>}
          <ul className="mt-4 space-y-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex gap-2">
                <span aria-hidden>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {plan === "trial" ? (
            <div className="mt-6 rounded-2xl bg-white p-4 text-center">
              <p className="font-extrabold">Your 7-day free trial is on 🎉</p>
              <Link href="/setup" className={`${btnPrimary} mt-3 w-full`}>
                Play the next chapter →
              </Link>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={startTrial}
                disabled={status === "redirecting" || status === "verifying"}
                className={`${btnPrimary} mt-6 w-full`}
              >
                {status === "redirecting"
                  ? "Opening checkout…"
                  : status === "verifying"
                    ? "Confirming your trial…"
                    : "Start 7-day free trial"}
              </button>
              <div className="mt-3 rounded-2xl border-2 border-dashed border-ink/30 bg-white/70 px-4 py-3 text-xs text-ink/70">
                <p className="font-extrabold text-ink">Demo checkout (Stripe test mode)</p>
                <p className="mt-1">
                  No real money is charged. Use card <span className="font-mono font-bold">4242 4242 4242 4242</span>,
                  any future date, any CVC and any ZIP.
                </p>
              </div>
            </>
          )}
          {message && (
            <p role="status" className="mt-3 text-center text-sm font-bold text-coral-dark">
              {message}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

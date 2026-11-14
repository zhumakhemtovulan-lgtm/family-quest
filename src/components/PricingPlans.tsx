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

export default function PricingPlans() {
  const [yearly, setYearly] = useState(true);
  const [plan, setPlan] = useState<"free" | "trial">("free");

  useEffect(() => setPlan(store.getPlan()), []);

  function startTrial() {
    store.setPlan("trial");
    setPlan("trial");
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
            <button type="button" onClick={startTrial} className={`${btnPrimary} mt-6 w-full`}>
              Start 7-day free trial
            </button>
          )}
          <p className="mt-3 text-center text-xs text-ink/60">
            Prototype: no card or payment is taken. In production this opens a secure checkout.
          </p>
        </Card>
      </div>
    </div>
  );
}

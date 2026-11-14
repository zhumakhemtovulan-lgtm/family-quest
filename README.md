# Family Quest 🗝️

**Tonight, your living room becomes an adventure.**

🔗 **Live:** https://family-quest-phi.vercel.app

Family Quest turns "what do we do with the kids tonight?" into a ready-to-play, screen-free adventure in under a minute. A parent enters the kids' ages and taps a few things lying around the house. AI builds a 20-minute quest from exactly those items. The parent's phone becomes the game master; the kids run, search, build and laugh. At the end the family takes a photo, gets a shareable card, and next Friday the story continues.

Built solo in 24 hours for **Business Cup 2.0** (Zimran × AIESEC × Nazarbayev University), **Entertainment** track.

## For judges: 3-minute walkthrough

1. Open the live link → **Try a sample family** → **Create our quest**. A live Gemini call builds the quest (10–20 s).
2. Play the 4 challenges, reveal the secret word, take the family photo (self-timer; best in Safari or Chrome, not inside Telegram).
3. Open **Our book** → **Play the next chapter** → paywall → **Start 7-day free trial**. Stripe **test mode**: card `4242 4242 4242 4242`, any future date, any CVC, any ZIP.
4. After checkout, Chapter 2 continues the same story. **Pricing → Reset demo on this device** starts over.

No sign-up or login anywhere.

## The problem

- **User:** working parents in the US, 25–44, with kids aged 5–10. About 35M people live in married-with-children households in this age band (Census ACS 2024, own calculation).
- **Pain:** they want time together, but screens win by default. Parents spend **~10 hours a week** looking for screen-free activities, and **42%** feel disconnected from their kids because of technology (Talker Research for Lowe's, Jan 2026, n=2,000).
- **Money is already there:** families with children spend **$6,994/year** on entertainment, and **$9,457** when the oldest child is 6–17 (BLS Consumer Expenditure Survey 2025).
- **Insight:** parents don't need more ideas, they need **less preparation**. Idea apps (Otter, Yonder) still leave the planning to the parent; activity boxes (KiwiCo, Raddish, $23–29/month) need shipping and supplies.

## What's in the product

| Feature | Why it matters |
|---|---|
| 30-second setup: ages, items at home, 20/40 min, theme | Zero preparation for a tired parent |
| AI quest (search, riddle, move, create) built only from the listed items | Real, personalized core value, nothing to buy |
| Play mode: one big read-aloud step, private parent tip, hints, secret-word letters | The phone is a remote control; the play happens in the room |
| Self-timer family photo → 1080×1920 Stories card → native share sheet | The memory that stays; organic acquisition loop |
| Family book + next chapter that continues the story | Weekly return reason; switching cost |
| "Remind us next Friday" calendar event | Return mechanic visible in the product |
| Paywall + Stripe Checkout (test mode), 7-day trial, server-side verification | A real payment flow, not a pricing slide |

## Business model

- First adventure free → **Family Plan $7.99/month or $59/year** with a 7-day free trial.
- Weekly rhythm (Friday quest night) with a story that continues: a product opened once a week but kept for months.
- Shared photo cards bring new families at zero ad cost.
- Variable cost: one short text generation per family per week.

## How the AI part works

`POST /api/quest` → `src/lib/gemini.ts`

1. The request is validated with Zod (ages 5–10, 4–30 items, up to 4 kids).
2. A game-master prompt (`src/lib/prompt.ts`) sets safety rules (no climbing, heat, sharp objects, outdoors), the item rule and story continuity from earlier chapter summaries.
3. Gemini returns structured JSON (`responseJsonSchema`); the server validates it again with Zod.
4. The server checks that no unlisted items are used and that the secret word fits the number of steps; if not, it retries once with a targeted fix.
5. Current Flash models are tried in order (`gemini-3.8-flash` → `3.6-flash` → `2.5-flash`), with a per-call timeout so the request stays inside the hosting limit. Output length and reasoning are capped to keep cost per family predictable.
6. A simple per-IP rate limit protects the paid endpoint.

## Privacy by design

No accounts and no database. The family profile, chapters and photo cards live only on the device (localStorage + IndexedDB). Kids' photos never leave the phone unless the parent shares the card.

## Tech

Next.js 15 (App Router, TypeScript), Tailwind CSS 4, Google Gemini (`@google/genai`), Zod, Stripe Checkout (test mode), Canvas API, Web Share API, IndexedDB. Deployed on Vercel.

```
src/
  app/
    page.tsx               landing + judge walkthrough
    setup/  play/  book/  pricing/
    api/quest/             AI quest generation
    api/checkout/          Stripe Checkout session (subscription + 7-day trial)
    api/checkout/verify/   confirms the session with Stripe before unlocking
  components/              SetupForm, QuestPlayer, PhotoCapture, FamilyBook, PricingPlans
  lib/
    prompt.ts              game-master prompt
    gemini.ts              model calls, validation, item check, fallbacks
    quest-schema.ts        Zod + JSON schemas
    card.ts                Stories card renderer (canvas)
    calendar.ts            weekly quest-night .ics reminder
    storage.ts             on-device storage
    stripe.ts              Stripe client (refuses live keys)
    rate-limit.ts          per-IP limiter
```

## Run locally

```bash
npm install
cp .env.example .env.local
# GEMINI_API_KEY   — free at aistudio.google.com
# STRIPE_SECRET_KEY — optional, sk_test_... (without it the paywall unlocks a labeled demo trial)
npm run dev
```

Open http://localhost:3000 and press **Try a sample family**.

## What's a prototype shortcut

- Subscription state is stored on the device after Stripe confirms the checkout; production would use accounts and Stripe webhooks.
- The rate limiter is in-memory per server instance; production would use a shared store.

## Next steps

Weekday 5-minute "mini missions", narrated audio for the read-aloud parts, a TV mode, printable quest maps, and partnerships with activity-box brands for physical "chapter boxes".

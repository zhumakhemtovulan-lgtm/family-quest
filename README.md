# Family Quest 🗝️

**Tonight, your living room becomes an adventure.**

Family Quest is a web app that turns "what do we do with the kids tonight?" into a ready-to-play, screen-free adventure in under a minute. A parent tells it the kids' ages and a few things lying around the house. AI builds a 20-minute quest from exactly those items. The parent's phone becomes the game master; the kids run, search, build and laugh. At the end the family takes a photo, gets a shareable card, and next week the story continues.

Built solo in 24 hours for **Business Cup 2.0** (Zimran × AIESEC × Nazarbayev University), Entertainment track.

## The problem

- **User:** working parents in the US, 25–44, with kids aged 5–10 (≈35M people in married-with-kids households, Census ACS 2024).
- **Pain:** they want time together, but screens win by default. Parents spend **~10 hours a week** looking for screen-free activities and **42%** feel disconnected from their kids because of technology (Talker Research for Lowe's, Jan 2026, n=2,000).
- **Insight:** parents don't need more ideas. They need **less preparation**. Existing apps (Otter, Yonder) still leave the planning to the parent; activity boxes (KiwiCo, $24+/mo) need shipping and supplies.

## How it works

1. **Setup (30 s):** family name, kids' ages, tap what's at home, 20 or 40 minutes, pick a world (pirates, space, mystery…).
2. **AI quest:** `POST /api/quest` asks Gemini for a structured quest (4–5 challenges: search, riddle, move, create) using *only* the listed items, safe for the youngest child. The server validates the JSON with Zod, checks that no unlisted items are used and that the secret word fits, and retries once with a targeted fix if not.
3. **Play:** one challenge per screen, big read-aloud text, a private tip for the parent, hint and riddle answer on demand. Each challenge reveals one letter of a secret word.
4. **Finale & photo:** a 5-second self-timer so the whole family is in the shot. The app draws a 1080×1920 Stories card in the browser (canvas) and shares it via the native share sheet.
5. **Family book:** every chapter is saved with its card. The next chapter continues the same story using summaries of earlier chapters.

**Privacy by design:** no accounts, no database. Profiles, chapters and photos live only on the device (localStorage + IndexedDB). Kids' photos never leave the phone.

## Business model

- First adventure free; **Family Plan $7.99/month or $59/year**, 7-day free trial (prototype: no payment is taken).
- Weekly chapters give a reason to come back; the family book makes leaving costly.
- Shared photo cards are a built-in, zero-cost acquisition loop.
- Generation cost: one short text quest per family per week.

## Tech

Next.js 15 (App Router, TypeScript), Tailwind CSS 4, Google Gemini (`@google/genai`, structured JSON output), Zod, Canvas API, Web Share API, IndexedDB. Deployed on Vercel.

```
src/
  app/              pages: / (landing), /setup, /play, /book, /pricing, /api/quest
  components/       SetupForm, QuestPlayer, PhotoCapture, FamilyBook, PricingPlans
  lib/
    prompt.ts       game-master prompt (safety rules, item rules, story continuity)
    gemini.ts       model call, validation, item check, one targeted retry
    quest-schema.ts request/response schemas (Zod + JSON schema for Gemini)
    card.ts         Stories card renderer (canvas)
    storage.ts      on-device storage (localStorage + IndexedDB)
```

## Run locally

```bash
npm install
cp .env.example .env.local   # add your GEMINI_API_KEY (free at aistudio.google.com)
npm run dev
```

Open http://localhost:3000 and press **Try a sample family**.

import Link from "next/link";
import { Card, Container, SiteHeader, btnPrimary, btnSecondary } from "@/components/ui";

const steps = [
  {
    emoji: "🧺",
    title: "Tell us what's at home",
    text: "Kids' ages and a few things lying around: pillows, a spoon, socks. 30 seconds.",
  },
  {
    emoji: "📱",
    title: "Your phone runs the game",
    text: "You read each clue out loud. The kids run, search, build and laugh. Nobody stares at a screen.",
  },
  {
    emoji: "📸",
    title: "Keep the moment",
    text: "Snap a family photo at the finale. Next Friday, the story continues.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <Container>
        <section className="pt-6 text-center sm:pt-12">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sun px-4 py-1.5 text-sm font-extrabold">
            Zero prep · 20 minutes · ages 5–10
          </p>
          <h1 className="font-display mx-auto mt-6 max-w-2xl text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
            Tonight, your living room becomes an adventure.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink/75">
            A screen-free family quest built from what&apos;s already in your home and made for your kids&apos; ages.
            You don&apos;t plan anything. You just play.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/setup" className={btnPrimary}>
              Start our adventure →
            </Link>
            <Link href="/setup?sample=1" className={btnSecondary}>
              Try a sample family
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink/60">No sign-up. Your first adventure is free.</p>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <Card key={s.title} className="text-left">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cream text-2xl">{s.emoji}</span>
                <span className="text-sm font-extrabold text-coral">Step {i + 1}</span>
              </div>
              <h2 className="mt-3 text-lg font-extrabold">{s.title}</h2>
              <p className="mt-1 text-ink/70">{s.text}</p>
            </Card>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="font-display text-3xl font-bold">Why we built it</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-ink p-6 text-cream">
              <p className="font-display text-5xl font-bold text-sun">~10 hrs</p>
              <p className="mt-2">a week parents spend looking for screen-free things to do with their kids.</p>
            </div>
            <div className="rounded-3xl bg-ink p-6 text-cream">
              <p className="font-display text-5xl font-bold text-sun">42%</p>
              <p className="mt-2">of parents feel disconnected from their children because of screens.</p>
            </div>
          </div>
          <p className="mt-4 text-lg">
            Parents don&apos;t need more ideas. They need <strong>less preparation</strong>. Family Quest turns
            &ldquo;what do we do tonight?&rdquo; into a ready-to-play adventure in under a minute.
          </p>
          <p className="mt-3 text-xs text-ink/50">
            Source: Talker Research survey of 2,000 U.S. millennial and Gen Z parents for Lowe&apos;s, January 2026.
          </p>
        </section>

        <section className="mt-16">
          <Card className="bg-sun/40">
            <h2 className="font-display text-2xl font-bold">Your photos stay on your phone.</h2>
            <p className="mt-2 text-ink/75">
              No accounts and no uploads. Family photos and your family book are saved only on this device, and you
              decide what to share.
            </p>
          </Card>
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t-2 border-line pt-6 text-sm text-ink/60">
          <span>Family Quest · Business Cup 2.0 prototype</span>
          <span className="flex gap-4">
            <Link href="/book" className="hover:underline">
              Our book
            </Link>
            <Link href="/pricing" className="hover:underline">
              Pricing
            </Link>
          </span>
        </footer>
      </Container>
    </>
  );
}

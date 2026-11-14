import Link from "next/link";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-3.5 text-base font-extrabold text-white shadow-[0_4px_0_0_#c23f20] transition active:translate-y-[2px] active:shadow-[0_2px_0_0_#c23f20] hover:bg-coral-dark disabled:opacity-50 disabled:pointer-events-none";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-paper px-6 py-3 text-base font-extrabold text-ink transition hover:bg-white active:translate-y-[1px] disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-ink/70 underline-offset-4 hover:underline";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
      <Link href="/" className="flex items-center gap-2" aria-label="Family Quest home">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lg">🗝️</span>
        <span className="font-display text-xl font-bold tracking-tight">Family Quest</span>
      </Link>
      <nav className="flex items-center gap-1 text-sm font-bold">
        <Link href="/book" className="rounded-full px-3 py-2 hover:bg-white/70">
          Our book
        </Link>
        <Link href="/pricing" className="rounded-full px-3 py-2 hover:bg-white/70">
          Pricing
        </Link>
      </nav>
    </header>
  );
}

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <main className={`mx-auto w-full max-w-3xl px-4 pb-16 ${className}`}>{children}</main>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border-2 border-ink bg-paper p-5 shadow-[0_6px_0_0_#1f2340] sm:p-7 ${className}`}>
      {children}
    </div>
  );
}

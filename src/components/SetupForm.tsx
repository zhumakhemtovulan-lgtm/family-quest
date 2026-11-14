"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, btnPrimary, btnSecondary } from "@/components/ui";
import {
  COMMON_ITEMS,
  FREE_CHAPTERS,
  MAX_AGE,
  MAX_KIDS,
  MIN_AGE,
  MIN_ITEMS,
  SAMPLE_FAMILY,
  THEMES,
  themeById,
} from "@/lib/constants";
import { store } from "@/lib/storage";
import type { ChapterRecord, FamilyProfile, Quest } from "@/lib/types";

const DEFAULT_PROFILE: FamilyProfile = {
  familyName: "",
  kids: [{ name: "", age: 7 }],
  items: [],
  minutes: 20,
  theme: "pirates",
};

const LOADING_LINES = [
  "Hiding clues behind the couch…",
  "Teaching the pirate to rhyme…",
  "Counting your pillows…",
  "Writing a riddle a 6-year-old can crack…",
  "Folding the treasure map…",
];

export default function SetupForm({ sample, newStory }: { sample: boolean; newStory: boolean }) {
  const router = useRouter();
  const [profile, setProfile] = useState<FamilyProfile>(DEFAULT_PROFILE);
  const [chapters, setChapters] = useState<ChapterRecord[]>([]);
  const [plan, setPlan] = useState<"free" | "trial">("free");
  const [customItem, setCustomItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLine, setLoadingLine] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // Stable keys for kid rows so removing one row never shifts typing into another.
  const [kidKeys, setKidKeys] = useState<number[]>([0, 1, 2, 3]);
  const [nextKidKey, setNextKidKey] = useState(4);

  useEffect(() => {
    const saved = store.getProfile();
    setProfile(sample ? SAMPLE_FAMILY : saved ?? DEFAULT_PROFILE);
    setChapters(store.getChapters());
    setPlan(store.getPlan());
    setReady(true);
  }, [sample]);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadingLine((i) => (i + 1) % LOADING_LINES.length), 1800);
    return () => clearInterval(t);
  }, [loading]);

  const lastChapter = chapters[chapters.length - 1];
  const continuing = Boolean(lastChapter) && !newStory;
  const storyChapters = continuing ? chapters.filter((c) => c.storyId === lastChapter.storyId) : [];
  const nextChapter = continuing ? storyChapters.length + 1 : 1;
  const gated = chapters.length >= FREE_CHAPTERS && plan === "free";

  // When continuing, the story keeps its original theme.
  const effectiveTheme = continuing && lastChapter ? lastChapter.theme : profile.theme;

  const allItems = useMemo(
    () => [...COMMON_ITEMS, ...profile.items.filter((i) => !COMMON_ITEMS.includes(i))],
    [profile.items],
  );

  const problems: string[] = [];
  if (!profile.familyName.trim()) problems.push("Add your family name");
  if (profile.items.length < MIN_ITEMS) problems.push(`Pick at least ${MIN_ITEMS} things you have at home`);

  function update<K extends keyof FamilyProfile>(key: K, value: FamilyProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function toggleItem(item: string) {
    update(
      "items",
      profile.items.includes(item) ? profile.items.filter((i) => i !== item) : [...profile.items, item],
    );
  }

  function addCustomItem() {
    const item = customItem.trim().toLowerCase().slice(0, 32);
    if (item && !profile.items.includes(item)) update("items", [...profile.items, item]);
    setCustomItem("");
  }

  async function createQuest() {
    if (problems.length > 0) return;
    setLoading(true);
    setError(null);
    const finalProfile: FamilyProfile = { ...profile, theme: effectiveTheme };
    const previousSummaries = storyChapters.slice(-5).map((c) => c.summary);
    const storyId = continuing && lastChapter ? lastChapter.storyId : crypto.randomUUID();
    try {
      const res = await fetch("/api/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: finalProfile, chapter: nextChapter, previousSummaries }),
      });
      const data = (await res.json()) as { quest?: Quest; error?: string };
      if (!res.ok || !data.quest) throw new Error(data.error || "Something went wrong.");
      store.setProfile(finalProfile);
      store.setCurrentQuest({ ...data.quest, storyId });
      router.push("/play");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (!ready) return null;

  if (gated) {
    return (
      <Card className="mt-6 text-center">
        <p className="text-5xl">{themeById(lastChapter?.theme ?? "pirates").emoji}</p>
        <h1 className="font-display mt-3 text-3xl font-bold">
          {continuing ? `Chapter ${nextChapter} is waiting` : "Ready for another adventure?"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-ink/75">
          Your first adventure was on us. The Family Plan unlocks a new chapter every week, bonus quests and your
          family book.
        </p>
        <Link href="/pricing" className={`${btnPrimary} mt-6`}>
          See the Family Plan →
        </Link>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mt-10 text-center" >
        <p className="animate-pop text-6xl">{themeById(effectiveTheme).emoji}</p>
        <h1 className="font-display mt-4 text-3xl font-bold">Building your quest…</h1>
        <p className="mt-2 text-ink/70" aria-live="polite">
          {LOADING_LINES[loadingLine]}
        </p>
        <p className="mt-6 text-sm text-ink/50">This takes about 10–20 seconds.</p>
      </Card>
    );
  }

  return (
    <div className="mt-2">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        {continuing ? `Chapter ${nextChapter}: the story continues` : "Set up tonight's adventure"}
      </h1>
      <p className="mt-2 text-ink/70">
        {continuing
          ? `Last time: ${lastChapter?.title}. Check what's at home tonight and we'll write the next chapter.`
          : "30 seconds. We use this to build a quest that fits your kids and your home."}
      </p>
      {sample && (
        <p className="mt-3 rounded-2xl bg-sun/50 px-4 py-2 text-sm font-bold">
          Sample family loaded. Change anything, or just press the button below.
        </p>
      )}

      <div className="mt-6 space-y-5">
        <Card>
          <label htmlFor="familyName" className="text-lg font-extrabold">
            Your family name
          </label>
          <input
            id="familyName"
            value={profile.familyName}
            onChange={(e) => update("familyName", e.target.value.slice(0, 40))}
            placeholder="The Johnsons"
            className="mt-2 w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg outline-none focus:border-ink"
          />
        </Card>

        <Card>
          <h2 className="text-lg font-extrabold">Who&apos;s playing?</h2>
          <p className="text-sm text-ink/60">Ages {MIN_AGE}–{MAX_AGE}. Names are optional but make the story theirs.</p>
          <div className="mt-3 space-y-3">
            {profile.kids.map((kid, i) => (
              <div key={kidKeys[i] ?? i} className="flex items-center gap-2">
                <input
                  aria-label={`Child ${i + 1} name`}
                  value={kid.name}
                  onChange={(e) => {
                    const kids = [...profile.kids];
                    kids[i] = { ...kid, name: e.target.value.slice(0, 24) };
                    update("kids", kids);
                  }}
                  placeholder={`Child ${i + 1} name`}
                  className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-white px-4 py-3 outline-none focus:border-ink"
                />
                <select
                  aria-label={`Child ${i + 1} age`}
                  value={kid.age}
                  onChange={(e) => {
                    const kids = [...profile.kids];
                    kids[i] = { ...kid, age: Number(e.target.value) };
                    update("kids", kids);
                  }}
                  className="rounded-2xl border-2 border-line bg-white px-3 py-3 font-bold outline-none focus:border-ink"
                >
                  {Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, n) => MIN_AGE + n).map((age) => (
                    <option key={age} value={age}>
                      {age} yrs
                    </option>
                  ))}
                </select>
                {profile.kids.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      update("kids", profile.kids.filter((_, j) => j !== i));
                      setKidKeys((keys) => keys.filter((_, j) => j !== i));
                    }}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-line text-lg hover:border-ink"
                    aria-label={`Remove child ${i + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {profile.kids.length < MAX_KIDS && (
            <button
              type="button"
              onClick={() => {
                update("kids", [...profile.kids, { name: "", age: 7 }]);
                setKidKeys((keys) => [...keys.slice(0, profile.kids.length), nextKidKey]);
                setNextKidKey((k) => k + 1);
              }}
              className="mt-3 text-sm font-extrabold text-coral hover:underline"
            >
              + Add another kid
            </button>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-extrabold">What&apos;s around the house tonight?</h2>
          <p className="text-sm text-ink/60">
            Tap at least {MIN_ITEMS}. The quest only uses what you pick, so there&apos;s nothing to buy or prepare.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {allItems.map((item) => {
              const on = profile.items.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleItem(item)}
                  aria-pressed={on}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                    on ? "border-ink bg-ink text-cream" : "border-line bg-white hover:border-ink"
                  }`}
                >
                  {on ? "✓ " : ""}
                  {item}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={customItem}
              onChange={(e) => setCustomItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomItem();
                }
              }}
              placeholder="Something else? e.g. hula hoop"
              aria-label="Add another item"
              className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-white px-4 py-2.5 outline-none focus:border-ink"
            />
            <button type="button" onClick={addCustomItem} className={btnSecondary}>
              Add
            </button>
          </div>
          <p className="mt-2 text-sm font-bold text-ink/60">{profile.items.length} selected</p>
        </Card>

        <Card>
          <h2 className="text-lg font-extrabold">How long do you have?</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {([20, 40] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => update("minutes", m)}
                aria-pressed={profile.minutes === m}
                className={`rounded-2xl border-2 px-4 py-3 font-extrabold ${
                  profile.minutes === m ? "border-ink bg-sun" : "border-line bg-white hover:border-ink"
                }`}
              >
                {m} min
                <span className="block text-xs font-bold text-ink/60">{m === 20 ? "4 challenges" : "5 challenges"}</span>
              </button>
            ))}
          </div>
        </Card>

        {!continuing && (
          <Card>
            <h2 className="text-lg font-extrabold">Pick a world</h2>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update("theme", t.id)}
                  aria-pressed={profile.theme === t.id}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left ${
                    profile.theme === t.id ? "border-ink bg-sun" : "border-line bg-white hover:border-ink"
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span>
                    <span className="block font-extrabold">{t.label}</span>
                    <span className="block text-sm text-ink/60">{t.blurb}</span>
                  </span>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-2xl border-2 border-coral bg-white px-4 py-3 font-bold text-coral-dark">
          {error} Please try again.
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 mt-6 bg-gradient-to-t from-cream via-cream to-transparent px-4 pt-6 pb-4">
        <button type="button" onClick={createQuest} disabled={problems.length > 0} className={`${btnPrimary} w-full`}>
          {continuing ? `Write Chapter ${nextChapter} →` : "Create our quest →"}
        </button>
        {problems.length > 0 && <p className="mt-2 text-center text-sm text-ink/60">{problems[0]}</p>}
        {continuing && (
          <p className="mt-2 text-center text-sm">
            <Link href="/setup?mode=new" className="font-bold text-ink/60 underline">
              Start a brand-new story instead
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

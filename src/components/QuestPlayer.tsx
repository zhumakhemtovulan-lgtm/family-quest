"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PhotoCapture from "@/components/PhotoCapture";
import { Card, Container, btnPrimary, btnSecondary, btnGhost } from "@/components/ui";
import { renderFamilyCard } from "@/lib/card";
import { downloadQuestNightReminder, nextQuestNight } from "@/lib/calendar";
import { themeById } from "@/lib/constants";
import { saveCard, store } from "@/lib/storage";
import type { FamilyProfile, Quest, StepType } from "@/lib/types";

type Stage = "intro" | "step" | "finale" | "photo" | "card";

const STEP_LABEL: Record<StepType, { label: string; emoji: string }> = {
  find: { label: "Search", emoji: "🔎" },
  riddle: { label: "Riddle", emoji: "🧩" },
  move: { label: "Move", emoji: "🤸" },
  create: { label: "Create", emoji: "🎨" },
};

function LetterTiles({ quest, revealed }: { quest: Quest; revealed: number }) {
  return (
    <div className="flex justify-center gap-2" aria-label={`Secret word: ${revealed} of ${quest.steps.length} letters found`}>
      {quest.steps.map((s, i) => (
        <span
          key={i}
          className={`font-display grid h-12 w-11 place-items-center rounded-xl border-2 text-2xl font-bold ${
            i < revealed ? "animate-pop border-ink bg-sun" : "border-dashed border-ink/30 bg-white text-transparent"
          }`}
        >
          {i < revealed ? s.clueLetter : "?"}
        </span>
      ))}
    </div>
  );
}

export default function QuestPlayer() {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState<Stage>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  useEffect(() => {
    setQuest(store.getCurrentQuest());
    setProfile(store.getProfile());
    setLoaded(true);
  }, []);

  useEffect(() => () => {
    if (cardUrl) URL.revokeObjectURL(cardUrl);
  }, [cardUrl]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage, stepIndex]);

  if (!loaded) return null;

  if (!quest) {
    return (
      <Container>
        <Card className="mt-8 text-center">
          <p className="text-5xl">🗺️</p>
          <h1 className="font-display mt-3 text-3xl font-bold">No quest in progress</h1>
          <p className="mt-2 text-ink/70">Set up tonight&apos;s adventure and we&apos;ll build one for your family.</p>
          <Link href="/setup" className={`${btnPrimary} mt-6`}>
            Start an adventure
          </Link>
        </Card>
      </Container>
    );
  }

  const theme = themeById(quest.theme);
  const familyName = profile?.familyName || "Our family";
  const chapterId = `${quest.storyId ?? "story"}-${quest.chapter}-${quest.createdAt}`;
  const step = quest.steps[stepIndex];

  function recordChapter(hasCard: boolean) {
    if (!quest) return;
    store.addChapter({
      id: chapterId,
      storyId: quest.storyId ?? "story",
      chapter: quest.chapter,
      title: quest.title,
      theme: quest.theme,
      summary: quest.summary,
      familyName,
      completedAt: new Date().toISOString(),
      hasCard,
    });
  }

  function nextStep() {
    setShowHint(false);
    setShowAnswer(false);
    if (stepIndex + 1 < quest!.steps.length) {
      setStepIndex(stepIndex + 1);
    } else {
      recordChapter(false);
      setStage("finale");
    }
  }

  async function makeCard(photo: HTMLCanvasElement | null) {
    setBusy(true);
    try {
      const blob = await renderFamilyCard({
        photo,
        title: quest!.title,
        familyName,
        chapter: quest!.chapter,
        secretWord: quest!.secretWord,
        themeEmoji: theme.emoji,
        date: new Date(),
      });
      const saved = await saveCard(chapterId, blob);
      recordChapter(saved);
      setCardBlob(blob);
      setCardUrl(URL.createObjectURL(blob));
      setStage("card");
    } finally {
      setBusy(false);
    }
  }

  const fileName = `family-quest-chapter-${quest.chapter}.jpg`;

  function download() {
    if (!cardUrl) return;
    const a = document.createElement("a");
    a.href = cardUrl;
    a.download = fileName;
    a.click();
  }

  async function share() {
    if (!cardBlob) return;
    const file = new File([cardBlob], fileName, { type: "image/jpeg" });
    const data = {
      files: [file],
      title: quest!.title,
      text: `${familyName} just finished "${quest!.title}" on Family Quest 🗝️`,
    };
    try {
      if (navigator.canShare?.(data)) {
        await navigator.share(data);
      } else {
        download();
        setShareNote("Sharing isn't supported in this browser, so we downloaded the card instead.");
      }
    } catch {
      // The family closed the share sheet; nothing to do.
    }
  }

  return (
    <Container>
      {stage === "intro" && (
        <Card className="mt-4">
          <p className="text-sm font-extrabold text-coral">
            {theme.emoji} Chapter {quest.chapter} · {quest.steps.length} challenges · read out loud
          </p>
          <h1 className="font-display mt-2 text-3xl leading-tight font-bold sm:text-4xl">{quest.title}</h1>
          <p className="mt-2 text-sm font-bold text-ink/60">Gather everyone around. You&apos;re the storyteller tonight.</p>
          <p className="font-display mt-5 text-xl leading-relaxed sm:text-2xl">{quest.intro}</p>
          <div className="mt-6 rounded-2xl bg-cream p-4">
            <p className="text-sm font-extrabold">Collect one letter per challenge to unlock the secret word:</p>
            <div className="mt-3">
              <LetterTiles quest={quest} revealed={0} />
            </div>
          </div>
          <button type="button" onClick={() => setStage("step")} className={`${btnPrimary} mt-6 w-full`}>
            Let&apos;s begin →
          </button>
        </Card>
      )}

      {stage === "step" && step && (
        <div className="mt-4">
          <div className="mb-4">
            <LetterTiles quest={quest} revealed={stepIndex} />
          </div>
          <Card>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-ink px-3 py-1 text-sm font-extrabold text-cream">
                {STEP_LABEL[step.type].emoji} {STEP_LABEL[step.type].label}
              </span>
              <span className="text-sm font-extrabold text-ink/60">
                Challenge {stepIndex + 1} of {quest.steps.length}
              </span>
            </div>
            <h2 className="font-display mt-4 text-2xl font-bold">{step.title}</h2>
            <p className="mt-1 text-xs font-extrabold tracking-wide text-coral uppercase">Read this out loud</p>
            <p className="font-display mt-2 text-xl leading-relaxed sm:text-2xl">{step.readAloud}</p>

            {step.itemsUsed.length > 0 && (
              <p className="mt-4 text-sm">
                <span className="font-extrabold">You&apos;ll need: </span>
                {step.itemsUsed.join(", ")}
              </p>
            )}

            {step.parentTip && (
              <div className="mt-4 rounded-2xl bg-cream px-4 py-3 text-sm">
                <span className="font-extrabold">Just for you: </span>
                {step.parentTip}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {step.hint && (
                <button type="button" onClick={() => setShowHint((v) => !v)} className={btnGhost}>
                  {showHint ? "Hide hint" : "Need a hint?"}
                </button>
              )}
              {step.type === "riddle" && step.answer && (
                <button type="button" onClick={() => setShowAnswer((v) => !v)} className={btnGhost}>
                  {showAnswer ? "Hide answer" : "Show answer (parents only)"}
                </button>
              )}
            </div>
            {showHint && <p className="mt-2 rounded-2xl bg-sun/40 px-4 py-3 text-sm font-bold">💡 {step.hint}</p>}
            {showAnswer && (
              <p className="mt-2 rounded-2xl bg-teal/20 px-4 py-3 text-sm font-bold">Answer: {step.answer}</p>
            )}

            <button type="button" onClick={nextStep} className={`${btnPrimary} mt-6 w-full`}>
              We did it! Reveal letter “{step.clueLetter}” →
            </button>
          </Card>
        </div>
      )}

      {stage === "finale" && (
        <Card className="mt-4 text-center">
          <p className="text-sm font-extrabold text-coral">You found every letter!</p>
          <div className="mt-4">
            <LetterTiles quest={quest} revealed={quest.steps.length} />
          </div>
          <h1 className="font-display mt-5 text-4xl font-bold tracking-wide">{quest.secretWord}</h1>
          <p className="font-display mt-4 text-left text-xl leading-relaxed sm:text-2xl">{quest.finale}</p>
          <div className="mt-6 rounded-2xl bg-ink p-4 text-left text-cream">
            <p className="text-xs font-extrabold tracking-wide text-sun uppercase">Next Friday…</p>
            <p className="mt-1 font-bold">{quest.nextTeaser}</p>
          </div>
          <button type="button" onClick={() => setStage("photo")} className={`${btnPrimary} mt-6 w-full`}>
            📸 Take our family photo
          </button>
        </Card>
      )}

      {stage === "photo" && (
        <div className="mt-4">
          <h1 className="font-display text-3xl font-bold">Capture this moment</h1>
          <p className="mt-1 text-ink/70">Your photo stays on this phone. You choose what to share.</p>
          <div className="mt-4">
            {busy ? (
              <Card className="text-center">
                <p className="text-5xl">🖼️</p>
                <p className="mt-2 font-extrabold">Making your family card…</p>
              </Card>
            ) : (
              <PhotoCapture onPhoto={(p) => void makeCard(p)} onSkip={() => void makeCard(null)} />
            )}
          </div>
        </div>
      )}

      {stage === "card" && cardUrl && (
        <div className="mt-4">
          <h1 className="font-display text-3xl font-bold">Chapter {quest.chapter}, complete!</h1>
          <p className="mt-1 text-ink/70">Saved to your family book.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardUrl}
            alt={`Family card for ${quest.title}`}
            className="mx-auto mt-4 w-full max-w-sm rounded-3xl border-2 border-ink shadow-[0_6px_0_0_#1f2340]"
          />
          <div className="mx-auto mt-5 flex max-w-sm flex-col gap-3">
            <button type="button" onClick={share} className={btnPrimary}>
              Share to Stories or family chat
            </button>
            <button type="button" onClick={download} className={btnSecondary}>
              Download card
            </button>
            <button type="button" onClick={() => downloadQuestNightReminder(familyName)} className={btnSecondary}>
              📅 Remind us next Friday
            </button>
            <p className="text-center text-sm text-ink/60">
              Chapter {quest.chapter + 1} unlocks{" "}
              {nextQuestNight().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}, 7 pm.
            </p>
            {shareNote && <p className="text-center text-sm text-ink/60">{shareNote}</p>}
            <Link href="/book" className={btnGhost}>
              Open our family book →
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
}

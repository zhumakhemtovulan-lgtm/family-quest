"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, Container, btnPrimary } from "@/components/ui";
import { themeById } from "@/lib/constants";
import { loadCard, store } from "@/lib/storage";
import type { ChapterRecord } from "@/lib/types";

function ChapterCard({ chapter }: { chapter: ChapterRecord }) {
  const [url, setUrl] = useState<string | null>(null);
  const theme = themeById(chapter.theme);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (chapter.hasCard) {
      void loadCard(chapter.id).then((blob) => {
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      });
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [chapter.id, chapter.hasCard]);

  return (
    <Card className="overflow-hidden p-0 sm:p-0">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`Family card: ${chapter.title}`} className="aspect-[9/16] w-full object-cover" />
      ) : (
        <div className="grid aspect-[9/16] place-items-center bg-gradient-to-br from-coral to-sun text-7xl">
          {theme.emoji}
        </div>
      )}
      <div className="p-4">
        <p className="text-xs font-extrabold text-coral uppercase">Chapter {chapter.chapter}</p>
        <h3 className="font-display mt-1 text-lg leading-tight font-bold">{chapter.title}</h3>
        <p className="mt-1 text-sm text-ink/60">
          {new Date(chapter.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>
    </Card>
  );
}

export default function FamilyBook() {
  const [chapters, setChapters] = useState<ChapterRecord[] | null>(null);

  useEffect(() => {
    setChapters(store.getChapters());
  }, []);

  if (!chapters) return null;

  if (chapters.length === 0) {
    return (
      <Container>
        <Card className="mt-8 text-center">
          <p className="text-5xl">📖</p>
          <h1 className="font-display mt-3 text-3xl font-bold">Your family book is empty</h1>
          <p className="mt-2 text-ink/70">Every adventure you finish becomes a page here, with your family photo.</p>
          <Link href="/setup" className={`${btnPrimary} mt-6`}>
            Start your first adventure
          </Link>
        </Card>
      </Container>
    );
  }

  const newestFirst = [...chapters].reverse();
  const familyName = newestFirst[0]?.familyName ?? "Our family";
  const weeksInARow = chapters.length;

  return (
    <Container>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{familyName}&apos;s book</h1>
          <p className="mt-1 text-ink/70">
            {weeksInARow} {weeksInARow === 1 ? "adventure" : "adventures"} together. Every page stays on this device.
          </p>
        </div>
        <Link href="/setup" className={btnPrimary}>
          Play the next chapter →
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {newestFirst.map((c) => (
          <ChapterCard key={c.id} chapter={c} />
        ))}
      </div>
    </Container>
  );
}

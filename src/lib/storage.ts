"use client";

import type { ChapterRecord, FamilyProfile, Quest } from "./types";

/**
 * Everything is stored on the family's own device: no accounts, no server database.
 * Photos of kids never leave the phone.
 */
const KEYS = {
  profile: "fq.profile",
  current: "fq.current",
  chapters: "fq.chapters",
  plan: "fq.plan",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode). The app still works for this session.
  }
}

export const store = {
  getProfile: () => read<FamilyProfile | null>(KEYS.profile, null),
  setProfile: (p: FamilyProfile) => write(KEYS.profile, p),

  getCurrentQuest: () => read<Quest | null>(KEYS.current, null),
  setCurrentQuest: (q: Quest) => write(KEYS.current, q),
  clearCurrentQuest: () => {
    try {
      window.localStorage.removeItem(KEYS.current);
    } catch {}
  },

  getChapters: () => read<ChapterRecord[]>(KEYS.chapters, []),
  addChapter: (c: ChapterRecord) => {
    const all = read<ChapterRecord[]>(KEYS.chapters, []).filter((x) => x.id !== c.id);
    write(KEYS.chapters, [...all, c]);
  },

  getPlan: () => read<"free" | "trial">(KEYS.plan, "free"),
  setPlan: (p: "free" | "trial") => write(KEYS.plan, p),

  /** Demo helper: wipes everything this app stored on the device, including photo cards. */
  resetDevice: async () => {
    try {
      Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
    } catch {}
    await new Promise<void>((resolve) => {
      try {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = req.onerror = req.onblocked = () => resolve();
      } catch {
        resolve();
      }
    });
  },
};

/* ---------- Family cards (images) live in IndexedDB: they are too big for localStorage ---------- */

const DB_NAME = "family-quest";
const STORE = "cards";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCard(id: string, blob: Blob): Promise<boolean> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch {
    return false;
  }
}

export async function loadCard(id: string): Promise<Blob | null> {
  try {
    const db = await openDb();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

import "server-only";
import { GoogleGenAI } from "@google/genai";
import { buildQuestPrompt } from "./prompt";
import { modelQuestSchema, questJsonSchema, type ModelQuest } from "./quest-schema";
import type { Quest, QuestRequest } from "./types";

const DEFAULT_MODEL = "gemini-2.5-flash";

export class QuestGenerationError extends Error {}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

/** Returns a readable problem with the model's quest, or null when it is usable. */
function findProblem(quest: ModelQuest, req: QuestRequest): string | null {
  const allowed = new Set(req.profile.items.map(normalize));
  const foreign = quest.steps.flatMap((s) => s.itemsUsed).filter((i) => !allowed.has(normalize(i)));
  if (foreign.length > 0) {
    return `You used items the family does not have: ${[...new Set(foreign)].join(", ")}. Only use the listed items.`;
  }
  const word = quest.secretWord.replace(/[^A-Za-z]/g, "");
  if (word.length !== quest.steps.length) {
    return `secretWord must have exactly ${quest.steps.length} letters, one per step.`;
  }
  if (!quest.steps.some((s) => s.type === "riddle")) {
    return "Include at least one riddle step.";
  }
  return null;
}

async function callModel(ai: GoogleGenAI, model: string, prompt: string): Promise<ModelQuest> {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: questJsonSchema,
      temperature: 1,
      // A quest is ~1,000 words; the cap keeps cost per family predictable.
      maxOutputTokens: 4096,
      // Flash does not need long reasoning for a kids' quest: skipping it cuts wait time for tired parents.
      ...(model.includes("flash") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  });
  const text = response.text;
  if (!text) throw new QuestGenerationError("The story engine returned an empty answer.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new QuestGenerationError("The story engine returned malformed JSON.");
  }
  const result = modelQuestSchema.safeParse(parsed);
  if (!result.success) {
    throw new QuestGenerationError("The story engine returned an incomplete quest.");
  }
  return result.data;
}

function finalize(quest: ModelQuest, req: QuestRequest): Quest {
  const allowed = new Map(req.profile.items.map((i) => [normalize(i), i]));
  const word = quest.secretWord.replace(/[^A-Za-z]/g, "").toUpperCase();
  return {
    title: quest.title,
    chapter: req.chapter,
    intro: quest.intro,
    secretWord: word,
    finale: quest.finale,
    nextTeaser: quest.nextTeaser,
    summary: quest.summary,
    theme: req.profile.theme,
    createdAt: new Date().toISOString(),
    steps: quest.steps.map((s, i) => ({
      ...s,
      // Keep only items the family actually listed, in their original spelling.
      itemsUsed: s.itemsUsed
        .map((item) => allowed.get(normalize(item)))
        .filter((item): item is string => Boolean(item)),
      answer: s.type === "riddle" ? s.answer : "",
      clueLetter: word[i] ?? "",
    })),
  };
}

export async function generateQuest(req: QuestRequest): Promise<Quest> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    throw new QuestGenerationError("The story engine is not configured yet.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  let quest: ModelQuest;
  try {
    quest = await callModel(ai, model, buildQuestPrompt(req));
  } catch (err) {
    // One retry for transient failures (network, overloaded model, malformed answer).
    console.warn("first quest attempt failed, retrying once", err);
    quest = await callModel(ai, model, buildQuestPrompt(req));
  }
  const problem = findProblem(quest, req);
  if (problem) {
    // One focused retry; if the second answer still has a small issue we clean it up in finalize().
    try {
      quest = await callModel(ai, model, buildQuestPrompt(req, problem));
    } catch {
      // keep the first quest
    }
  }
  return finalize(quest, req);
}

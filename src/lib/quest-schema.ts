import { z } from "zod";
import { MAX_AGE, MAX_KIDS, MIN_AGE, MIN_ITEMS } from "./constants";

const themeEnum = z.enum(["pirates", "space", "mystery", "dinosaurs", "magic-forest"]);

/** Validates what the browser sends to /api/quest. */
export const questRequestSchema = z.object({
  profile: z.object({
    familyName: z.string().trim().min(1).max(40),
    kids: z
      .array(
        z.object({
          name: z.string().trim().max(24),
          age: z.number().int().min(MIN_AGE).max(MAX_AGE),
        }),
      )
      .min(1)
      .max(MAX_KIDS),
    items: z.array(z.string().trim().min(1).max(32)).min(MIN_ITEMS).max(30),
    minutes: z.union([z.literal(20), z.literal(40)]),
    theme: themeEnum,
  }),
  chapter: z.number().int().min(1).max(52),
  previousSummaries: z.array(z.string().max(600)).max(5),
});

/** Validates what the model returns before it reaches the family. */
export const modelQuestSchema = z.object({
  title: z.string().min(3).max(80),
  intro: z.string().min(20).max(900),
  steps: z
    .array(
      z.object({
        type: z.enum(["find", "riddle", "move", "create"]),
        title: z.string().min(2).max(60),
        readAloud: z.string().min(10).max(600),
        parentTip: z.string().max(300),
        hint: z.string().max(250),
        answer: z.string().max(40),
        itemsUsed: z.array(z.string().max(32)).max(6),
      }),
    )
    .min(4)
    .max(6),
  secretWord: z.string().min(4).max(6),
  finale: z.string().min(20).max(900),
  nextTeaser: z.string().min(10).max(300),
  summary: z.string().min(10).max(600),
});

export type ModelQuest = z.infer<typeof modelQuestSchema>;

/** JSON schema handed to Gemini so it answers in the exact shape we validate. */
export const questJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "Short, fun quest title" },
    intro: { type: "string", description: "Story opening the parent reads aloud, 3-5 sentences" },
    steps: {
      type: "array",
      minItems: 4,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["find", "riddle", "move", "create"] },
          title: { type: "string" },
          readAloud: { type: "string", description: "What the parent reads to the kids, 2-4 short sentences" },
          parentTip: { type: "string", description: "One practical tip only the parent sees" },
          hint: { type: "string", description: "A gentle hint if kids get stuck" },
          answer: { type: "string", description: "For riddles: the household item that solves it. Otherwise empty." },
          itemsUsed: { type: "array", items: { type: "string" } },
        },
        required: ["type", "title", "readAloud", "parentTip", "hint", "answer", "itemsUsed"],
      },
    },
    secretWord: { type: "string", description: "Uppercase word with exactly one letter per step" },
    finale: { type: "string", description: "Story ending the parent reads aloud when the secret word is found" },
    nextTeaser: { type: "string", description: "One cliffhanger sentence hinting at next week's chapter" },
    summary: { type: "string", description: "Two-sentence recap of what happened, for continuing the story next week" },
  },
  required: ["title", "intro", "steps", "secretWord", "finale", "nextTeaser", "summary"],
} as const;

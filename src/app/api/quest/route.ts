import { NextResponse } from "next/server";
import { generateQuest, QuestGenerationError } from "@/lib/gemini";
import { questRequestSchema } from "@/lib/quest-schema";
import { clientKey, isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: "That's a lot of adventures! Please wait a few minutes before creating another." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = questRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your family details and try again." },
      { status: 400 },
    );
  }

  try {
    const quest = await generateQuest(parsed.data);
    return NextResponse.json({ quest });
  } catch (err) {
    const message =
      err instanceof QuestGenerationError
        ? err.message
        : "The story engine is busy. Please try again in a moment.";
    console.error("quest generation failed", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

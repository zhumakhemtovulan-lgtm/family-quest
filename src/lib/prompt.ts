import { themeById } from "./constants";
import type { QuestRequest } from "./types";

export function buildQuestPrompt(req: QuestRequest, retryNote?: string): string {
  const { profile, chapter, previousSummaries } = req;
  const theme = themeById(profile.theme);
  const kids = profile.kids
    .map((k) => `${k.name.trim() || "a child"} (age ${k.age})`)
    .join(", ");
  const youngest = Math.min(...profile.kids.map((k) => k.age));
  const stepCount = profile.minutes === 20 ? 4 : 5;

  const story =
    chapter === 1 || previousSummaries.length === 0
      ? `This is Chapter 1. Start a brand-new ${theme.label.toLowerCase()} story (${theme.blurb.toLowerCase()}).`
      : `This is Chapter ${chapter} of an ongoing story. Keep the same world and characters and continue from these earlier chapters:\n${previousSummaries
          .map((s, i) => `- Chapter ${chapter - previousSummaries.length + i}: ${s}`)
          .join("\n")}`;

  return `You are the game master for "Family Quest", a screen-free adventure a tired parent runs at home with their kids.
The parent holds the phone and reads your text out loud. The kids never need to look at the screen.

FAMILY
- Family name: ${profile.familyName}
- Kids: ${kids}
- Youngest child is ${youngest}, so every riddle and task must work for a ${youngest}-year-old.
- Total play time: about ${profile.minutes} minutes.
- Theme: ${theme.label}

HOUSEHOLD ITEMS THEY HAVE (use ONLY these, exactly as written):
${profile.items.map((i) => `- ${i}`).join("\n")}

STORY
${story}

WRITE A QUEST WITH EXACTLY ${stepCount} STEPS. Mix the step types:
- "find": kids search the home for one listed item.
- "riddle": a short rhyming riddle whose answer is one listed item; kids fetch it. Put that item in "answer".
- "move": a safe, silly physical challenge (tiptoe, freeze, balance a book on your head).
- "create": build, draw or act something with listed items (a pillow fort ship, a crayon map).
Include at least one riddle and at least one create step.

RULES
- Use the kids' names in the story so it feels like theirs.
- Every item in "itemsUsed" must come from the list above, written exactly the same way. Never require anything else (no scissors, food, outdoors, or purchases).
- Safety: no climbing on furniture, no running on stairs, no water, heat, sharp objects, or hiding in closed spaces.
- Keep each "readAloud" to 2-4 short, vivid sentences a parent can read in 20 seconds.
- "parentTip" tells the parent one practical thing (e.g. "Hide the spoon under a pillow while they close their eyes").
- "secretWord" is an uppercase English word with exactly ${stepCount} letters, related to the story. Each step reveals the next letter.
- "finale" celebrates the family by name and reveals the secret word's meaning. Warm, funny, no lessons or morals.
- "nextTeaser" is one cliffhanger sentence for next week's chapter.
- Wholesome, kind, a little silly. No scary violence, romance, brands, or real people.
${retryNote ? `\nIMPORTANT FIX: ${retryNote}` : ""}
Return JSON only.`;
}

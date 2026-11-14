export type ThemeId = "pirates" | "space" | "mystery" | "dinosaurs" | "magic-forest";

export type Kid = {
  name: string;
  age: number;
};

export type FamilyProfile = {
  familyName: string;
  kids: Kid[];
  items: string[];
  minutes: 20 | 40;
  theme: ThemeId;
};

export type StepType = "find" | "riddle" | "move" | "create";

export type QuestStep = {
  type: StepType;
  title: string;
  /** What the parent reads out loud to the kids. */
  readAloud: string;
  /** Short, practical note only the parent sees. */
  parentTip: string;
  hint: string;
  /** For riddles: the answer the kids should find. Empty for other steps. */
  answer: string;
  /** Household items this step needs, always taken from the family's list. */
  itemsUsed: string[];
  /** One letter of the secret word, added by the server. */
  clueLetter: string;
};

export type Quest = {
  title: string;
  chapter: number;
  intro: string;
  steps: QuestStep[];
  secretWord: string;
  finale: string;
  nextTeaser: string;
  /** Two-sentence recap the next chapter uses to continue the story. */
  summary: string;
  theme: ThemeId;
  createdAt: string;
  /** Groups chapters of one ongoing story. Set in the browser. */
  storyId?: string;
};

export type QuestRequest = {
  profile: FamilyProfile;
  chapter: number;
  previousSummaries: string[];
};

export type ChapterRecord = {
  id: string;
  storyId: string;
  chapter: number;
  title: string;
  theme: ThemeId;
  summary: string;
  familyName: string;
  completedAt: string;
  hasCard: boolean;
};

import type { FamilyProfile, ThemeId } from "./types";

export const APP_NAME = "Family Quest";

export const THEMES: { id: ThemeId; label: string; emoji: string; blurb: string }[] = [
  { id: "pirates", label: "Pirates", emoji: "🏴‍☠️", blurb: "Hidden treasure, secret maps" },
  { id: "space", label: "Space", emoji: "🚀", blurb: "A lost robot needs your crew" },
  { id: "mystery", label: "Mystery", emoji: "🔍", blurb: "Something vanished from the house" },
  { id: "dinosaurs", label: "Dinosaurs", emoji: "🦕", blurb: "A baby dino hatched in the hallway" },
  { id: "magic-forest", label: "Magic forest", emoji: "🌲", blurb: "A fairy left a trail of clues" },
];

export const COMMON_ITEMS = [
  "pillows",
  "blanket",
  "cardboard box",
  "socks",
  "books",
  "spoon",
  "flashlight",
  "crayons",
  "paper",
  "plastic cups",
  "stuffed animals",
  "towel",
  "tape",
  "toy cars",
  "Lego bricks",
  "chairs",
];

export const MIN_ITEMS = 4;
export const MIN_AGE = 5;
export const MAX_AGE = 10;
export const MAX_KIDS = 4;
export const FREE_CHAPTERS = 1;

export const SAMPLE_FAMILY: FamilyProfile = {
  familyName: "The Johnsons",
  kids: [
    { name: "Mia", age: 6 },
    { name: "Leo", age: 9 },
  ],
  items: ["pillows", "blanket", "spoon", "books", "socks", "flashlight", "cardboard box", "crayons"],
  minutes: 20,
  theme: "pirates",
};

export function themeById(id: ThemeId) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

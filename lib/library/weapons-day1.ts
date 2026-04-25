// Day-1 weapons library — generics, not tied to any specific friend.
// Signature weapons emerge from each fighter's trait cloud at the 10-trait threshold.

import type { Drunkenness } from "@prisma/client";

export type WeaponLibraryEntry = {
  key: string;
  name: string;
  blurb: string;
  modifiers: string[];
  excludeLocations?: string[];
  onlyLocations?: string[];
  minDrunkenness?: Drunkenness;
  minGrit?: number;
};

export const DAY1_WEAPONS: WeaponLibraryEntry[] = [
  {
    key: "pool-noodle",
    name: "Pool noodle",
    blurb: "Foam cylinder. Zero damage, maximum humiliation.",
    modifiers: [
      "damage negligible",
      "high-charisma trait → +2 (ironic swing earns more morale than earnest)",
      "vs anyone wielding a real weapon → useless",
    ],
  },
  {
    key: "kitchen-knife",
    name: "Kitchen knife",
    blurb: "Real knife, real stakes.",
    modifiers: [
      "+4 damage",
      "low-grit fighter freezes on the draw, won't actually use it",
      "'will actually stab you' trait → +6 damage",
    ],
    excludeLocations: ["open-water"],
    minGrit: 5,
  },
  {
    key: "louisville-slugger",
    name: "Louisville Slugger",
    blurb: '34" wooden bat.',
    modifiers: [
      "+3 damage",
      "low-grit fighter → one swing then dropped",
      "high-grit → sustained use, full damage",
    ],
    minGrit: 4,
  },
  {
    key: "nerf-blaster",
    name: "Nerf blaster",
    blurb: "Loud, plastic, harmless. Good for setups.",
    modifiers: [
      "damage negligible",
      "first-shot surprise → +2 initiative",
      "chaos-agent trait → +1 (native language)",
    ],
  },
  {
    key: "folding-chair",
    name: "Folding chair",
    blurb: "Either way it's an attack.",
    modifiers: ["+2 damage", "two-handed → low-strength fighter -1 accuracy"],
  },
  {
    key: "bare-fists",
    name: "Bare fists",
    blurb: "No weapon. Honest option.",
    modifiers: [
      "strength trait drives damage directly",
      "emotional-cold trait +1 (no distraction)",
      "wit-based fighters -2 (kit doesn't activate)",
    ],
  },
  {
    key: "laser-pointer",
    name: "Laser pointer",
    blurb: "Mostly symbolic.",
    modifiers: [
      "damage none",
      "reads-people trait +2 (targets specific irritation)",
      "pointed at opponent's signature quirk → counts as a quirk-attack critical-hit attempt",
    ],
  },
  {
    key: "frying-pan",
    name: "Frying pan",
    blurb: "Cast iron. Great clang.",
    modifiers: [
      "+3 damage",
      "high-strength trait → +1 accuracy",
      "overlap with kitchen venues — don't double-count",
    ],
    excludeLocations: ["open-water"],
  },
];

// Day-1 location library — generic venues, not tied to any specific friend.
// Personal/home venues (e.g. someone's backyard) emerge from each fighter's
// trait cloud at the 15-trait threshold and are stored separately.

export type LocationLibraryEntry = {
  key: string;
  name: string;
  blurb: string;
  modifiers: string[];
  environmentalAmmo: string[];
};

export const DAY1_LOCATIONS: LocationLibraryEntry[] = [
  {
    key: "open-water",
    name: "Open water",
    blurb: "Ocean, lake, or pool. No walls, no footing, no weapons unless they float.",
    modifiers: [
      "low-stamina trait → -3 (can't tread water long)",
      "any melee weapon -2 (lost or soaked)",
      "can't-swim trait -5",
    ],
    environmentalAmmo: ["A kayak oar", "An inflatable swan", "A jellyfish drifting through"],
  },
  {
    key: "antarctic-tundra",
    name: "Antarctic tundra",
    blurb: "Featureless frozen plain. No traction, no shelter, no dignity once someone slips.",
    modifiers: [
      "any charge or tackle -3 accuracy (slip risk)",
      "long fight -2/round (cold attrition)",
      "fast-mover trait ignores first slip",
    ],
    environmentalAmmo: ["A jagged chunk of ice", "A fallen penguin", "A blinding snow flurry"],
  },
  {
    key: "golf-course",
    name: "Golf course",
    blurb:
      "Manicured fairways, pro shop, cart path. Every implement on the property is a weapon.",
    modifiers: [
      "best-golfer trait +3",
      "any club counts as a free equipped melee weapon",
      "golf-cart chase is a legal move",
    ],
    environmentalAmmo: ["A golf ball (ranged)", "A sand wedge", "A stolen golf cart"],
  },
  {
    key: "costco-parking-lot",
    name: "Costco parking lot",
    blurb:
      "Fluorescent concrete flatland. Carts, TVs in boxes, rotisserie chicken visible through the doors, security guard 90 seconds out.",
    modifiers: [
      "tool-handler trait +3",
      "fight runs long → security-guard cameo check",
      "low charisma -1 (crowd disapproves)",
    ],
    environmentalAmmo: ["A runaway shopping cart", "A rotisserie chicken", "Stacked patio chairs"],
  },
  {
    key: "ikea-showroom",
    name: "IKEA showroom",
    blurb:
      "Labyrinth of flat-pack furniture, yellow arrows, and Swedish meatballs. Every wall is pretend.",
    modifiers: [
      "flight-response trait -3 (can't find exit)",
      "Allen wrench as weapon -1 damage but high shame factor",
      "fake living rooms break easily (destruction is the point)",
    ],
    environmentalAmmo: ["A BILLY bookcase", "A pillow named SKROBLA", "A tray of meatballs"],
  },
  {
    key: "dirty-woman-park",
    name: "Dirty Woman Park",
    blurb:
      "A shitty park with a name nobody will explain and a basketball court with half a net. Chain-link fence, one working streetlamp, a bench with a broken slat.",
    modifiers: [
      "basketball on scene → first to grab +2 (court control)",
      "low charisma irrelevant (no audience)",
      "exit-the-venue moves -2 (nowhere meaningful to leave to)",
    ],
    environmentalAmmo: [
      "The basketball",
      "A chain-link fence",
      "A beer bottle nobody's proud of",
    ],
  },
];

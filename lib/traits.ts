// Trait normalization + suggestions helpers shared across server and client.

export const TRAIT_MAX_LENGTH = 30;

export function normalizeTraitTag(input: string): string {
  return input
    .toLowerCase()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function tidyDisplayTag(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function isValidTraitInput(input: string): boolean {
  const tidy = tidyDisplayTag(input);
  if (tidy.length === 0 || tidy.length > TRAIT_MAX_LENGTH) return false;
  const normalized = normalizeTraitTag(tidy);
  if (normalized.length === 0) return false;
  return true;
}

// Categories that rotate as inspiration on the "Add a trait" form. Suggestions
// are not required — the user can type anything that passes the sanity gate.
export const TRAIT_SUGGESTION_CATEGORIES: string[] = [
  "a personality trait",
  "an iconic item they always carry",
  "a fear they pretend they don't have",
  "a pattern they always do",
  "a sentence only they would say",
  "their move when they're drunk",
  "the thing that always sets them off",
  "their tell when they're lying",
  "what they do at a wedding",
  "what they do at a bar at last call",
  "their go-to text when something's wrong",
  "the friend-group nickname",
  "the thing they'd argue about for an hour",
  "their move at the gym / on a court",
  "what they're like sober",
  "what they reach for in a fight",
  "the body language tell",
  "their relationship with the group",
  "a phobia or hard limit",
  "their finishing-the-night ritual",
];

export function pickSuggestions(seed: number, count = 3): string[] {
  const len = TRAIT_SUGGESTION_CATEGORIES.length;
  const out: string[] = [];
  const used = new Set<number>();
  let i = Math.abs(Math.floor(seed)) % len;
  while (out.length < count && used.size < len) {
    if (!used.has(i)) {
      out.push(TRAIT_SUGGESTION_CATEGORIES[i]);
      used.add(i);
    }
    i = (i + 7) % len;
  }
  return out;
}

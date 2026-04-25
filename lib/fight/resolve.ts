// Outcome resolution. Variance lives in the slot rolls, not in the
// resolver — once setup is locked, the math mostly decides:
//   probability >= 70 → deterministic (favorite wins, every time)
//   30 < probability < 70 → roll
//   probability <= 30 → deterministic (favorite wins, every time)

const DETERMINISTIC_FLOOR = 30;
const DETERMINISTIC_CEIL = 70;

export type ResolveResult = {
  winner: "A" | "B";
  resolvedDeterministically: boolean;
  rolledValue: number | null;
};

export function resolveOutcome(
  probabilityA: number,
  rng: () => number = Math.random,
): ResolveResult {
  const p = Math.max(0, Math.min(100, Math.round(probabilityA)));
  if (p >= DETERMINISTIC_CEIL) {
    return { winner: "A", resolvedDeterministically: true, rolledValue: null };
  }
  if (p <= DETERMINISTIC_FLOOR) {
    return { winner: "B", resolvedDeterministically: true, rolledValue: null };
  }
  const roll = rng() * 100;
  return {
    winner: roll < p ? "A" : "B",
    resolvedDeterministically: false,
    rolledValue: roll,
  };
}

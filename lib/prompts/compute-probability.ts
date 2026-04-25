import { groq, LLM_MODEL } from "@/lib/anthropic";
import type { CloudTag } from "@/lib/profile-data";
import type { Location, Weapon, Drunkenness } from "@prisma/client";

export type ProbabilityInput = {
  fighterA: { name: string; traits: CloudTag[]; drunkenness: Drunkenness };
  fighterB: { name: string; traits: CloudTag[]; drunkenness: Drunkenness };
  location: Location;
  weaponA: Weapon | null;
  weaponB: Weapon | null;
};

const SYSTEM = `You set the win probability for fighter A in BattleBros, a friend-group brawl
sim. You'll receive both fighters' trait clouds (weighted tags), the venue,
the weapons, and the drunkenness levels.

Your job:
- Read both clouds. Heavier traits matter more.
- Apply venue + weapon + drunkenness modifiers.
- Emit ONE integer 0-100 representing the chance fighter A wins.

Important rules:
- Mismatches stay lopsided. If one cloud is way thicker on combat-relevant
  traits, push toward 90/10 or further. Don't artificially narrow the gap.
- Don't soften results to feel competitive. Comedy comes from the lopsided
  fights too.
- Be decisive. A coin-flip 50 should be rare; most fights have a real
  favorite.

Reply by calling the \`emit\` tool exactly once.`;

function describeFighter(f: ProbabilityInput["fighterA"]): string {
  const cloud = f.traits.length
    ? f.traits.slice(0, 20).map((t) => `${t.displayTag}(${t.weight})`).join(", ")
    : "(empty cloud)";
  return `${f.name} — drunkenness: ${f.drunkenness}\n  traits: ${cloud}`;
}

function describeWeapon(w: Weapon | null, side: string): string {
  if (!w) return `${side}: bare hands`;
  const mods = (w.modifiers as string[]).join("; ");
  return `${side}: ${w.name} — ${w.blurb} [${mods}]`;
}

export async function computeProbability(input: ProbabilityInput): Promise<number> {
  const result = await groq().chat.completions.create({
    model: LLM_MODEL,
    max_tokens: 300,
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: [
          `Fighter A: ${describeFighter(input.fighterA)}`,
          `Fighter B: ${describeFighter(input.fighterB)}`,
          ``,
          `Venue: ${input.location.name} — ${input.location.blurb} [modifiers: ${(input.location.modifiers as string[]).join("; ")}]`,
          describeWeapon(input.weaponA, "Weapon A"),
          describeWeapon(input.weaponB, "Weapon B"),
        ].join("\n"),
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "emit",
          description: "Emit the integer probability fighter A wins (0-100).",
          parameters: {
            type: "object",
            properties: {
              probabilityA: { type: "integer", minimum: 0, maximum: 100 },
              reasoning: { type: "string" },
            },
            required: ["probabilityA"],
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "emit" } },
  });

  const call = result.choices[0]?.message?.tool_calls?.[0];
  if (!call || call.type !== "function") return 50;
  try {
    const out = JSON.parse(call.function.arguments) as { probabilityA?: number };
    const p = typeof out.probabilityA === "number" ? out.probabilityA : 50;
    return Math.max(0, Math.min(100, Math.round(p)));
  } catch {
    return 50;
  }
}

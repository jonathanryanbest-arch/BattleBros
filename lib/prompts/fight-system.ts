// Fight narration system prompt + tool definition.
// Claude is told the resolved winner up front and narrates the entire fight
// toward that verdict with full detail. The trait cloud shapes how the win
// reads; the venue and weapons drive the beats.

import type { Tool } from "@anthropic-ai/sdk/resources";
import type { CloudTag } from "@/lib/profile-data";
import type { Location, Weapon, Drunkenness } from "@prisma/client";

export type NarrationInput = {
  fighterA: { id: string; name: string; traits: CloudTag[]; drunkenness: Drunkenness };
  fighterB: { id: string; name: string; traits: CloudTag[]; drunkenness: Drunkenness };
  location: Location;
  weaponA: Weapon | null;
  weaponB: Weapon | null;
  resolvedWinner: "A" | "B";
};

export const FIGHT_SYSTEM_PROMPT = `You are the narrator of BattleBros, a head-to-head fight simulator for a
friend group. Two friends square off in a venue, possibly with a weapon, and
you stream a tight, dramatic play-by-play.

Style:
- Third-person, present tense. Punchy short paragraphs (2-4 sentences).
- Grounded and funny. The comedy is from real-feeling reactions and stakes,
  not slapstick.
- Read both fighters' trait clouds. Heavier traits dominate; a fighter
  whose cloud says "wins by mockery" wins by mockery, a fighter whose cloud
  says "leaves rather than engages" wins by leaving.
- Use the venue's environmental ammo. Reach for the unexpected option (golf
  ball, not the club).
- Do NOT manufacture closeness. If the matchup is lopsided, narrate full
  domination — total dismantling, played for tragicomedy. One-sided beatings
  are funny, not grim.
- Full detail every fight. Even foregone conclusions get the complete
  play-by-play. Predictability of the verdict doesn't shorten the narration.

Structure:
- 4-7 short paragraphs of narration leading toward the verdict.
- The resolved winner is given to you up front. Your job is to make that
  outcome feel earned and shaped by the winner's trait cloud, not random.
- Stop narrating before declaring the winner explicitly. Your narration
  ends with the moment the fight ends, but the verdict itself is delivered
  by calling the \`finalize_fight\` tool with finalBlow + tagline.

Tool:
- \`finalize_fight\` is your terminator. Call it exactly once at the end.
  finalBlow is one sentence describing the decisive moment. tagline is one
  short, quotable line capturing the vibe of the win.

Never say "you" or "your" — third-person framing throughout.
Never reveal the resolved winner's name in the narration before the tool call.`;

export const FINALIZE_FIGHT_TOOL: Tool = {
  name: "finalize_fight",
  description:
    "End the fight. Emit the final blow and a one-line tagline consistent with the resolved winner.",
  input_schema: {
    type: "object",
    properties: {
      finalBlow: {
        type: "string",
        description: "One sentence describing the decisive moment that ends the fight.",
      },
      tagline: {
        type: "string",
        description: "One short, quotable line capturing the vibe of the win (≤ 80 chars).",
      },
    },
    required: ["finalBlow", "tagline"],
  },
};

export function buildNarrationUserPrompt(input: NarrationInput): string {
  const winnerLabel = input.resolvedWinner === "A" ? input.fighterA.name : input.fighterB.name;
  const cloud = (f: NarrationInput["fighterA"]) =>
    f.traits.length
      ? f.traits.slice(0, 25).map((t) => `${t.displayTag} [${t.weight}]`).join(", ")
      : "(no traits yet)";
  const wpn = (w: Weapon | null, side: string) =>
    w
      ? `${side}: ${w.name}. ${w.blurb} Modifiers: ${(w.modifiers as string[]).join("; ")}.`
      : `${side}: bare hands.`;
  return [
    `Setup:`,
    `Fighter A: ${input.fighterA.name} (drunkenness: ${input.fighterA.drunkenness})`,
    `  trait cloud: ${cloud(input.fighterA)}`,
    `Fighter B: ${input.fighterB.name} (drunkenness: ${input.fighterB.drunkenness})`,
    `  trait cloud: ${cloud(input.fighterB)}`,
    `Venue: ${input.location.name}. ${input.location.blurb}`,
    `  modifiers: ${(input.location.modifiers as string[]).join("; ")}`,
    `  environmental ammo: ${input.location.environmentalAmmo.join("; ")}`,
    wpn(input.weaponA, "Weapon A"),
    wpn(input.weaponB, "Weapon B"),
    ``,
    `Resolved winner: ${winnerLabel} (fighter ${input.resolvedWinner}).`,
    `Narrate the fight toward this verdict. End by calling finalize_fight.`,
  ].join("\n");
}

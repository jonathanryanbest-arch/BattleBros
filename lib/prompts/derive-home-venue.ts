// Reads a fighter's trait cloud and proposes their iconic Location library
// entry — their "home venue." Fired by the nightly cron the night the cloud
// first crosses 15 unique tags.

import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import type { CloudTag } from "@/lib/profile-data";

export type ProposedLocation = {
  key: string;
  name: string;
  blurb: string;
  modifiers: string[];
  environmentalAmmo: string[];
};

const SYSTEM = `You design the home venue for a fighter in BattleBros, a friend-group brawl
simulator. You'll be given the fighter's trait cloud — a list of weighted short
tags — and asked to propose ONE location that emerges naturally from the
heaviest traits.

Rules for the proposal:
- The venue must be a specific real place this person frequents (their
  backyard, their job site, the bar they always pick), NOT a vague concept.
- It should grant home-turf advantage: at least one modifier rewards the
  fighter for being in their element.
- Modifiers are 2–4 short rules in "X → +Y/-Y" or "X → effect" shape.
- Environmental ammo is 2–3 weird, situational attack options Claude can
  reach for during narration.
- Use a short, lowercase, hyphen-separated key (max 30 chars).
- Tone is grounded and funny, never mean-spirited.
- If the trait cloud doesn't justify a specific venue yet, return
  confidence:false rather than forcing one.

Reply by calling the \`propose\` tool exactly once.`;

export async function deriveHomeVenue(input: {
  friendName: string;
  traits: CloudTag[];
}): Promise<ProposedLocation | null> {
  const cloudText = input.traits
    .slice(0, 40)
    .map((t) => `- ${t.displayTag} (weight ${t.weight})`)
    .join("\n");

  const result = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 800,
    system: SYSTEM,
    tools: [
      {
        name: "propose",
        description: "Emit the proposed home Location library entry for this fighter.",
        input_schema: {
          type: "object",
          properties: {
            confidence: { type: "boolean" },
            key: { type: "string" },
            name: { type: "string" },
            blurb: { type: "string" },
            modifiers: { type: "array", items: { type: "string" } },
            environmentalAmmo: { type: "array", items: { type: "string" } },
          },
          required: ["confidence"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "propose" },
    messages: [
      {
        role: "user",
        content: `Fighter: ${input.friendName}\n\nTrait cloud (heaviest first):\n${cloudText || "(empty)"}`,
      },
    ],
  });

  const toolUse = result.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") return null;
  const out = toolUse.input as Partial<ProposedLocation> & { confidence?: boolean };
  if (!out.confidence) return null;
  if (!out.key || !out.name || !out.blurb || !out.modifiers || !out.environmentalAmmo) return null;
  return {
    key: out.key,
    name: out.name,
    blurb: out.blurb,
    modifiers: out.modifiers,
    environmentalAmmo: out.environmentalAmmo,
  };
}

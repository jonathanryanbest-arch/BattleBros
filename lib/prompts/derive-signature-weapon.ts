import { groq, LLM_MODEL } from "@/lib/anthropic";
import type { CloudTag } from "@/lib/profile-data";

export type ProposedWeapon = {
  key: string;
  name: string;
  blurb: string;
  modifiers: string[];
  excludeLocations?: string[];
  onlyLocations?: string[];
  minDrunkenness?: "sober" | "buzzed" | "drunk" | "hammered";
  minGrit?: number;
};

const SYSTEM = `You design the signature weapon for a fighter in BattleBros, a friend-group
brawl simulator. You'll be given the fighter's trait cloud — a list of weighted
short tags — and asked to propose ONE weapon that emerges naturally from the
heaviest traits.

Rules for the proposal:
- The weapon must read as a real, narrow object the fighter would actually
  reach for, not an abstract stat. "Broken putter" yes; "Anger" no.
- It should connect to a heavy trait. If the cloud is dominated by golf and
  rage, propose something golf-and-rage shaped.
- Modifiers are 2–4 short rules in "X → +Y/-Y" or "X → effect" shape, like
  '+4 damage when wielded by this fighter' or 'on a golf course it's free'.
- Set fighterSpecific eligibility implicitly — this weapon is only for this
  fighter; you don't need to specify it.
- Use a short, lowercase, hyphen-separated key (max 30 chars).
- Tone is grounded and funny, never mean-spirited.
- If the trait cloud doesn't actually justify any specific weapon yet, return
  with confidence:false. Don't force it.

Reply by calling the \`propose\` tool exactly once.`;

export async function deriveSignatureWeapon(input: {
  friendName: string;
  traits: CloudTag[];
}): Promise<ProposedWeapon | null> {
  const cloudText = input.traits
    .slice(0, 30)
    .map((t) => `- ${t.displayTag} (weight ${t.weight})`)
    .join("\n");

  const result = await groq().chat.completions.create({
    model: LLM_MODEL,
    max_tokens: 700,
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Fighter: ${input.friendName}\n\nTrait cloud (heaviest first):\n${cloudText || "(empty)"}`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "propose",
          description: "Emit the proposed signature Weapon library entry for this fighter.",
          parameters: {
            type: "object",
            properties: {
              confidence: { type: "boolean" },
              key: { type: "string" },
              name: { type: "string" },
              blurb: { type: "string" },
              modifiers: { type: "array", items: { type: "string" } },
              excludeLocations: { type: "array", items: { type: "string" } },
              onlyLocations: { type: "array", items: { type: "string" } },
              minDrunkenness: {
                type: "string",
                enum: ["sober", "buzzed", "drunk", "hammered"],
              },
              minGrit: { type: "integer", minimum: 0, maximum: 10 },
            },
            required: ["confidence"],
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "propose" } },
  });

  const call = result.choices[0]?.message?.tool_calls?.[0];
  if (!call || call.type !== "function") return null;
  try {
    const out = JSON.parse(call.function.arguments) as Partial<ProposedWeapon> & { confidence?: boolean };
    if (!out.confidence) return null;
    if (!out.key || !out.name || !out.blurb || !out.modifiers) return null;
    return {
      key: out.key,
      name: out.name,
      blurb: out.blurb,
      modifiers: out.modifiers,
      excludeLocations: out.excludeLocations,
      onlyLocations: out.onlyLocations,
      minDrunkenness: out.minDrunkenness,
      minGrit: out.minGrit,
    };
  } catch {
    return null;
  }
}

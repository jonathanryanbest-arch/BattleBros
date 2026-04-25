import { groq, LLM_MODEL } from "@/lib/anthropic";

export type SanityVerdict = {
  decision: "accept" | "reject";
  reason?: string;
};

const SYSTEM = `You are the moderation gate for BattleBros, a friend-group fight simulator.
Players submit short trait tags about each other (≤ 30 characters) — things like
"always wears a bucket hat", "wins by mockery", "broken-putter wielder".

You ACCEPT a tag when it could plausibly be a character trait. Unflattering is fine
("can't hold his liquor", "always late", "bad at golf"). Embarrassing is fine.
Rude-but-harmless is fine.

You REJECT a tag when it is:
- A slur, hate-speech reference, or attack on protected attributes (race, sexuality, etc.)
- An accusation of a serious crime (e.g. assault, abuse, theft framed as fact)
- Sexually explicit
- An identifying piece of personal data (full address, phone number, SSN-shape)
- Empty, gibberish, advertising, or otherwise not a character description

Reply by calling the \`decide\` tool exactly once.`;

export async function runSanityGate(displayTag: string): Promise<SanityVerdict> {
  const result = await groq().chat.completions.create({
    model: LLM_MODEL,
    max_tokens: 200,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Trait tag submission:\n\n"${displayTag}"` },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "decide",
          description: "Emit the moderation decision for the trait tag.",
          parameters: {
            type: "object",
            properties: {
              decision: { type: "string", enum: ["accept", "reject"] },
              reason: {
                type: "string",
                description:
                  "If rejected, a one-sentence explanation suitable to show the user. Optional on accept.",
              },
            },
            required: ["decision"],
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "decide" } },
  });

  const call = result.choices[0]?.message?.tool_calls?.[0];
  if (!call || call.type !== "function") return { decision: "accept" };
  try {
    const input = JSON.parse(call.function.arguments) as { decision?: string; reason?: string };
    if (input.decision === "reject") {
      return { decision: "reject", reason: input.reason };
    }
  } catch {
    // Parse failure — default accept
  }
  return { decision: "accept" };
}

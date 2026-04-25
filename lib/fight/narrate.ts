import { groq, LLM_MODEL } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import {
  buildNarrationUserPrompt,
  FIGHT_SYSTEM_PROMPT,
  type NarrationInput,
} from "@/lib/prompts/fight-system";
import type { CloudTag } from "@/lib/profile-data";

export type StreamEvent =
  | { type: "ready"; fight: { fighterAId: string; fighterBId: string } }
  | { type: "delta"; text: string }
  | { type: "verdict"; winnerId: string; finalBlow: string; tagline: string }
  | { type: "error"; message: string };

export async function* runFightStream(fightId: string): AsyncGenerator<StreamEvent> {
  const fight = await prisma.fight.findUnique({
    where: { id: fightId },
    include: { fighterA: true, fighterB: true },
  });
  if (!fight) {
    yield { type: "error", message: "Fight not found" };
    return;
  }
  if (fight.status === "done") {
    const turns = await prisma.fightTurn.findMany({
      where: { fightId },
      orderBy: { ord: "asc" },
    });
    yield {
      type: "ready",
      fight: { fighterAId: fight.fighterAId, fighterBId: fight.fighterBId },
    };
    for (const t of turns) {
      if (t.kind === "narration") {
        const text = (t.content as { text: string }).text;
        yield { type: "delta", text };
      } else if (t.kind === "verdict" && fight.rolledWinnerId) {
        const v = t.content as { finalBlow: string; tagline: string };
        yield {
          type: "verdict",
          winnerId: fight.rolledWinnerId,
          finalBlow: v.finalBlow,
          tagline: v.tagline,
        };
      }
    }
    return;
  }
  if (fight.status !== "locked") {
    yield { type: "error", message: "Fight is not ready to stream yet." };
    return;
  }
  if (!fight.rolledWinnerId) {
    yield { type: "error", message: "Fight is missing a resolved winner." };
    return;
  }

  await prisma.fight.update({
    where: { id: fightId },
    data: { status: "streaming" },
  });

  const [location, weaponA, weaponB] = await Promise.all([
    prisma.location.findUnique({ where: { key: fight.locationKey } }),
    fight.weaponAKey
      ? prisma.weapon.findUnique({ where: { key: fight.weaponAKey } })
      : Promise.resolve(null),
    fight.weaponBKey
      ? prisma.weapon.findUnique({ where: { key: fight.weaponBKey } })
      : Promise.resolve(null),
  ]);
  if (!location) {
    yield { type: "error", message: "Location vanished." };
    return;
  }

  const traitsA = (fight.fighterA.cachedTraits as unknown as CloudTag[]) ?? [];
  const traitsB = (fight.fighterB.cachedTraits as unknown as CloudTag[]) ?? [];
  const winnerLabel: "A" | "B" = fight.rolledWinnerId === fight.fighterAId ? "A" : "B";

  const input: NarrationInput = {
    fighterA: {
      id: fight.fighterAId,
      name: fight.fighterA.name,
      traits: traitsA,
      drunkenness: fight.drunkennessA,
    },
    fighterB: {
      id: fight.fighterBId,
      name: fight.fighterB.name,
      traits: traitsB,
      drunkenness: fight.drunkennessB,
    },
    location,
    weaponA,
    weaponB,
    resolvedWinner: winnerLabel,
  };

  yield {
    type: "ready",
    fight: { fighterAId: fight.fighterAId, fighterBId: fight.fighterBId },
  };

  let accumulatedText = "";
  let finalBlow: string | null = null;
  let tagline: string | null = null;

  const stream = await groq().chat.completions.create({
    model: LLM_MODEL,
    max_tokens: 1500,
    stream: true,
    messages: [
      { role: "system", content: FIGHT_SYSTEM_PROMPT },
      { role: "user", content: buildNarrationUserPrompt(input) },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "finalize_fight",
          description:
            "End the fight. Emit the final blow and a one-line tagline consistent with the resolved winner.",
          parameters: {
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
        },
      },
    ],
  });

  let toolCallArgs = "";

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    if (!delta) continue;

    if (delta.content) {
      accumulatedText += delta.content;
      yield { type: "delta", text: delta.content };
    }

    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        if (tc.function?.arguments) {
          toolCallArgs += tc.function.arguments;
        }
      }
    }
  }

  if (toolCallArgs) {
    try {
      const parsed = JSON.parse(toolCallArgs) as { finalBlow?: string; tagline?: string };
      finalBlow = parsed.finalBlow ?? null;
      tagline = parsed.tagline ?? null;
    } catch {
      // Tool call JSON incomplete
    }
  }

  if (!finalBlow || !tagline) {
    finalBlow = finalBlow ?? "The fight ends.";
    tagline = tagline ?? "And that was that.";
  }

  let ord = 0;
  await prisma.fightTurn.create({
    data: {
      fightId,
      ord: ord++,
      kind: "narration",
      content: { text: accumulatedText },
    },
  });
  await prisma.fightTurn.create({
    data: {
      fightId,
      ord: ord++,
      kind: "verdict",
      content: { finalBlow, tagline },
    },
  });
  await prisma.fight.update({
    where: { id: fightId },
    data: { status: "done", finalBlow, tagline },
  });

  yield {
    type: "verdict",
    winnerId: fight.rolledWinnerId,
    finalBlow,
    tagline,
  };
}

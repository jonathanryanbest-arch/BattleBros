// Lock-in path: collect setup, run probability call, resolve outcome,
// stamp the fight as 'locked' with the hidden winner. The streaming route
// picks up from here.

import { prisma } from "@/lib/prisma";
import { computeProbability } from "@/lib/prompts/compute-probability";
import { resolveOutcome } from "@/lib/fight/resolve";
import type { CloudTag } from "@/lib/profile-data";

export async function lockFight(fightId: string): Promise<{ winner: "A" | "B"; probabilityA: number }> {
  const fight = await prisma.fight.findUniqueOrThrow({
    where: { id: fightId },
    include: {
      fighterA: true,
      fighterB: true,
    },
  });
  if (fight.status !== "spinning") {
    throw new Error("Fight is not in spinning state");
  }

  const [location, weaponA, weaponB] = await Promise.all([
    prisma.location.findUnique({ where: { key: fight.locationKey } }),
    fight.weaponAKey
      ? prisma.weapon.findUnique({ where: { key: fight.weaponAKey } })
      : Promise.resolve(null),
    fight.weaponBKey
      ? prisma.weapon.findUnique({ where: { key: fight.weaponBKey } })
      : Promise.resolve(null),
  ]);
  if (!location) throw new Error("Location not found");

  const traitsA = (fight.fighterA.cachedTraits as unknown as CloudTag[]) ?? [];
  const traitsB = (fight.fighterB.cachedTraits as unknown as CloudTag[]) ?? [];

  const probabilityA = await computeProbability({
    fighterA: { name: fight.fighterA.name, traits: traitsA, drunkenness: fight.drunkennessA },
    fighterB: { name: fight.fighterB.name, traits: traitsB, drunkenness: fight.drunkennessB },
    location,
    weaponA,
    weaponB,
  });
  const result = resolveOutcome(probabilityA);
  const rolledWinnerId = result.winner === "A" ? fight.fighterAId : fight.fighterBId;

  const updated = await prisma.fight.updateMany({
    where: { id: fightId, status: "spinning" },
    data: {
      baseProbabilityA: probabilityA,
      rolledWinnerId,
      status: "locked",
    },
  });
  if (updated.count === 0) {
    throw new Error("Fight was locked by another request");
  }
  return { winner: result.winner, probabilityA };
}

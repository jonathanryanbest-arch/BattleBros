// Slot-machine eligibility: given the current matchup, return the draw pool
// for each reel. Day-1 generics are always in; emergent (per-friend) entries
// only show up when the originating friend is part of the matchup.

import type { Location, Weapon } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type EligibleLocations = Location[];
export type EligibleWeaponsForFighter = Weapon[];

export async function loadEligibleLocations(
  fighterAId: string,
  fighterBId: string,
): Promise<EligibleLocations> {
  return prisma.location.findMany({
    where: {
      OR: [
        { source: "day1" },
        {
          source: "emergent",
          derivedFromFriendId: { in: [fighterAId, fighterBId] },
        },
      ],
    },
    orderBy: { name: "asc" },
  });
}

export async function loadEligibleWeapons(
  wielderId: string,
  locationKey: string,
): Promise<EligibleWeaponsForFighter> {
  const all = await prisma.weapon.findMany({
    where: {
      OR: [
        { source: "day1" },
        { source: "emergent", derivedFromFriendId: wielderId },
      ],
    },
    orderBy: { name: "asc" },
  });

  return all.filter((w) => {
    if (w.fighterSpecificId && w.fighterSpecificId !== wielderId) return false;
    if (w.excludeLocations.length && w.excludeLocations.includes(locationKey)) return false;
    if (w.onlyLocations.length && !w.onlyLocations.includes(locationKey)) return false;
    return true;
  });
}

export function pickRandom<T>(items: T[], rng: () => number = Math.random): T {
  if (items.length === 0) throw new Error("Cannot pick from empty list");
  const idx = Math.floor(rng() * items.length);
  return items[idx];
}

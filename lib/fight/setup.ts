// Fight setup helpers — initial spin generation and re-roll for each slot.

import { prisma } from "@/lib/prisma";
import {
  loadEligibleLocations,
  loadEligibleWeapons,
  pickRandom,
} from "@/lib/fight/eligibility";

export type Slot = "location" | "weaponA" | "weaponB";

export async function rollLocation(
  fighterAId: string,
  fighterBId: string,
): Promise<string> {
  const locations = await loadEligibleLocations(fighterAId, fighterBId);
  if (locations.length === 0) throw new Error("No eligible locations");
  return pickRandom(locations).key;
}

export async function rollWeapon(
  wielderId: string,
  locationKey: string,
): Promise<string | null> {
  const weapons = await loadEligibleWeapons(wielderId, locationKey);
  // 1 in 6 chance of "no weapon" so bare-hands fights happen sometimes.
  if (Math.random() < 1 / 6) return null;
  if (weapons.length === 0) return null;
  return pickRandom(weapons).key;
}

export async function ensureWeaponEligibleForLocation(
  weaponKey: string | null | undefined,
  wielderId: string,
  locationKey: string,
): Promise<string | null> {
  if (!weaponKey) return null;
  const weapons = await loadEligibleWeapons(wielderId, locationKey);
  if (weapons.find((w) => w.key === weaponKey)) return weaponKey;
  // Current weapon doesn't fit the new location — pick a fresh one.
  if (weapons.length === 0) return null;
  return pickRandom(weapons).key;
}

export async function spinSlot(fightId: string, slot: Slot): Promise<void> {
  const fight = await prisma.fight.findUniqueOrThrow({
    where: { id: fightId },
    select: {
      id: true,
      fighterAId: true,
      fighterBId: true,
      locationKey: true,
      weaponAKey: true,
      weaponBKey: true,
      status: true,
    },
  });
  if (fight.status !== "spinning") {
    throw new Error("Cannot re-roll a locked fight");
  }
  if (slot === "location") {
    const newLoc = await rollLocation(fight.fighterAId, fight.fighterBId);
    const weaponA = await ensureWeaponEligibleForLocation(
      fight.weaponAKey,
      fight.fighterAId,
      newLoc,
    );
    const weaponB = await ensureWeaponEligibleForLocation(
      fight.weaponBKey,
      fight.fighterBId,
      newLoc,
    );
    await prisma.fight.update({
      where: { id: fightId },
      data: { locationKey: newLoc, weaponAKey: weaponA, weaponBKey: weaponB },
    });
    return;
  }
  if (slot === "weaponA") {
    const weaponA = await rollWeapon(fight.fighterAId, fight.locationKey);
    await prisma.fight.update({ where: { id: fightId }, data: { weaponAKey: weaponA } });
    return;
  }
  if (slot === "weaponB") {
    const weaponB = await rollWeapon(fight.fighterBId, fight.locationKey);
    await prisma.fight.update({ where: { id: fightId }, data: { weaponBKey: weaponB } });
    return;
  }
}

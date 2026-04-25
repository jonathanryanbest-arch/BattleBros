// Nightly trait-cloud refresh job.
//
// For each Friend whose corpus has changed since `cachedTraitsAt`:
//   1. Aggregate (tag, displayTag, weight = submits + upvotes) over
//      `FriendTraitContribution` rows.
//   2. Write the snapshot to `Friend.cachedTraits` and stamp
//      `cachedTraitsAt`.
//   3. Flip `status` to `unlocked` the first time the snapshot has ≥ 5
//      unique tags.
//   4. If the snapshot crosses 10 unique tags for the first time, fire
//      `derive-signature-weapon` and persist the proposed Weapon row.
//   5. If the snapshot crosses 15 unique tags for the first time, fire
//      `derive-home-venue` and persist the proposed Location row.

import type { CloudTag } from "@/lib/profile-data";
import { prisma } from "@/lib/prisma";
import { deriveSignatureWeapon } from "@/lib/prompts/derive-signature-weapon";
import { deriveHomeVenue } from "@/lib/prompts/derive-home-venue";

const UNLOCK_AT = 5;
const SIGNATURE_WEAPON_AT = 10;
const HOME_VENUE_AT = 15;

export type RefreshSummary = {
  friendId: string;
  friendName: string;
  uniqueTagsBefore: number;
  uniqueTagsAfter: number;
  unlocked: boolean;
  signatureWeaponProposed: boolean;
  homeVenueProposed: boolean;
};

export async function refreshAllProfiles(): Promise<RefreshSummary[]> {
  const friends = await prisma.friend.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      cachedTraits: true,
      cachedTraitsAt: true,
    },
  });

  const summaries: RefreshSummary[] = [];
  for (const friend of friends) {
    const since = friend.cachedTraitsAt;
    const newCount = await prisma.friendTraitContribution.count({
      where: {
        friendId: friend.id,
        ...(since ? { createdAt: { gt: since } } : {}),
      },
    });
    if (newCount === 0) continue;

    const summary = await refreshOneFriend(friend.id, friend.name);
    summaries.push(summary);
  }
  return summaries;
}

async function refreshOneFriend(
  friendId: string,
  friendName: string,
): Promise<RefreshSummary> {
  const friend = await prisma.friend.findUniqueOrThrow({
    where: { id: friendId },
    select: { status: true, cachedTraits: true },
  });
  const previous = (friend.cachedTraits as unknown as CloudTag[]) ?? [];
  const previousUnique = previous.length;

  const cloud = await aggregateCloud(friendId);
  const uniqueAfter = cloud.length;

  const willUnlock = friend.status === "locked" && uniqueAfter >= UNLOCK_AT;
  const crossedSignatureWeapon =
    previousUnique < SIGNATURE_WEAPON_AT && uniqueAfter >= SIGNATURE_WEAPON_AT;
  const crossedHomeVenue =
    previousUnique < HOME_VENUE_AT && uniqueAfter >= HOME_VENUE_AT;

  await prisma.friend.update({
    where: { id: friendId },
    data: {
      cachedTraits: cloud as unknown as object,
      cachedTraitsAt: new Date(),
      ...(willUnlock ? { status: "unlocked", unlockedAt: new Date() } : {}),
    },
  });

  let signatureWeaponProposed = false;
  if (crossedSignatureWeapon) {
    signatureWeaponProposed = await trySignatureWeapon(friendId, friendName, cloud);
  }
  let homeVenueProposed = false;
  if (crossedHomeVenue) {
    homeVenueProposed = await tryHomeVenue(friendId, friendName, cloud);
  }

  return {
    friendId,
    friendName,
    uniqueTagsBefore: previousUnique,
    uniqueTagsAfter: uniqueAfter,
    unlocked: willUnlock,
    signatureWeaponProposed,
    homeVenueProposed,
  };
}

async function aggregateCloud(friendId: string): Promise<CloudTag[]> {
  const rows = await prisma.friendTraitContribution.findMany({
    where: { friendId },
    select: { tag: true, displayTag: true, kind: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  type Bucket = { tag: string; displayTag: string; weight: number };
  const byTag = new Map<string, Bucket>();
  for (const r of rows) {
    const existing = byTag.get(r.tag);
    if (existing) {
      existing.weight += 1;
      continue;
    }
    byTag.set(r.tag, { tag: r.tag, displayTag: r.displayTag, weight: 1 });
  }
  return Array.from(byTag.values()).sort((a, b) => b.weight - a.weight || a.tag.localeCompare(b.tag));
}

async function trySignatureWeapon(
  friendId: string,
  friendName: string,
  cloud: CloudTag[],
): Promise<boolean> {
  try {
    const proposed = await deriveSignatureWeapon({ friendName, traits: cloud });
    if (!proposed) return false;
    await prisma.weapon.create({
      data: {
        key: `${friendId}-${proposed.key}`,
        name: proposed.name,
        blurb: proposed.blurb,
        modifiers: proposed.modifiers,
        source: "emergent",
        derivedFromFriendId: friendId,
        fighterSpecificId: friendId,
        excludeLocations: proposed.excludeLocations ?? [],
        onlyLocations: proposed.onlyLocations ?? [],
        minDrunkenness: proposed.minDrunkenness ?? null,
        minGrit: proposed.minGrit ?? null,
      },
    });
    return true;
  } catch (e) {
    console.error("derive-signature-weapon failed", e);
    return false;
  }
}

async function tryHomeVenue(
  friendId: string,
  friendName: string,
  cloud: CloudTag[],
): Promise<boolean> {
  try {
    const proposed = await deriveHomeVenue({ friendName, traits: cloud });
    if (!proposed) return false;
    await prisma.location.create({
      data: {
        key: `${friendId}-${proposed.key}`,
        name: proposed.name,
        blurb: proposed.blurb,
        modifiers: proposed.modifiers,
        environmentalAmmo: proposed.environmentalAmmo,
        source: "emergent",
        derivedFromFriendId: friendId,
      },
    });
    return true;
  } catch (e) {
    console.error("derive-home-venue failed", e);
    return false;
  }
}

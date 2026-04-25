import { prisma } from "@/lib/prisma";

export type TraitCounts = {
  uniqueTagsInSnapshot: number;
  pendingSubmissions: number;
};

export async function getTraitCountsForFriend(friendId: string): Promise<TraitCounts> {
  const friend = await prisma.friend.findUnique({
    where: { id: friendId },
    select: { cachedTraits: true, cachedTraitsAt: true },
  });
  const traits = (friend?.cachedTraits as Array<{ tag: string }> | null) ?? [];
  const since = friend?.cachedTraitsAt ?? new Date(0);
  const pending = await prisma.friendTraitContribution.count({
    where: {
      friendId,
      kind: "submit",
      createdAt: { gt: since },
    },
  });
  return {
    uniqueTagsInSnapshot: Array.isArray(traits) ? traits.length : 0,
    pendingSubmissions: pending,
  };
}

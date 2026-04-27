// Server-side helpers that assemble the per-friend profile data the page
// renders: the cached cloud (drives gameplay) and the live contribution
// list (drives the contribution UX, including pending submissions).

import { prisma } from "@/lib/prisma";

export type CloudTag = {
  tag: string;
  displayTag: string;
  weight: number;
};

export type ContributionRow = {
  tag: string;
  displayTag: string;
  submittedAt: string;
  upvotes: number;
  viewerHasUpvoted: boolean;
  pending: boolean;
};

export async function loadCachedTraits(friendId: string): Promise<{
  traits: CloudTag[];
  cachedTraitsAt: Date | null;
}> {
  const friend = await prisma.friend.findUnique({
    where: { id: friendId },
    select: { cachedTraits: true, cachedTraitsAt: true },
  });
  const raw = (friend?.cachedTraits as unknown) ?? [];
  const traits = Array.isArray(raw) ? (raw as CloudTag[]) : [];
  return { traits, cachedTraitsAt: friend?.cachedTraitsAt ?? null };
}

export async function loadContributionRows(
  friendId: string,
  viewerId: string,
  cachedTraitsAt: Date | null,
): Promise<ContributionRow[]> {
  const submissions = await prisma.friendTraitContribution.findMany({
    where: { friendId, kind: "submit" },
    select: {
      tag: true,
      displayTag: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const upvotes = await prisma.friendTraitContribution.findMany({
    where: { friendId, kind: "upvote" },
    select: { tag: true, contributorId: true },
  });

  type Bucket = {
    tag: string;
    displayTag: string;
    submittedAt: Date;
    upvotes: number;
    viewerHasUpvoted: boolean;
  };
  const byTag = new Map<string, Bucket>();
  for (const s of submissions) {
    const existing = byTag.get(s.tag);
    if (existing) {
      // Earlier submission keeps the display tag and timestamp; subsequent
      // submissions of the same tag count toward weight (the cron sums kind=submit).
      existing.upvotes += 1;
      continue;
    }
    byTag.set(s.tag, {
      tag: s.tag,
      displayTag: s.displayTag,
      submittedAt: s.createdAt,
      upvotes: 0,
      viewerHasUpvoted: false,
    });
  }
  for (const u of upvotes) {
    const bucket = byTag.get(u.tag);
    if (!bucket) continue;
    bucket.upvotes += 1;
    if (u.contributorId === viewerId) bucket.viewerHasUpvoted = true;
  }

  return Array.from(byTag.values())
    .sort((a, b) => b.upvotes - a.upvotes || a.submittedAt.getTime() - b.submittedAt.getTime())
    .map((b) => ({
      tag: b.tag,
      displayTag: b.displayTag,
      submittedAt: b.submittedAt.toISOString(),
      upvotes: b.upvotes,
      viewerHasUpvoted: b.viewerHasUpvoted,
      pending: cachedTraitsAt ? b.submittedAt > cachedTraitsAt : true,
    }));
}

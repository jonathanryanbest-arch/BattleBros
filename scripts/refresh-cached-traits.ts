// Aggregate FriendTraitContribution rows into Friend.cachedTraits and
// flip status to "unlocked" once a friend has >= 5 unique tags.
// Mirrors aggregateCloud + refreshOneFriend in lib/cron/refresh-traits.ts,
// minus the Claude calls for emergent weapons/locations (those need the
// live app's GROQ_API_KEY and we just want the cloud visible).

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const UNLOCK_AT = 5;

type Bucket = { tag: string; displayTag: string; weight: number };

async function main() {
  const friends = await prisma.friend.findMany({ select: { id: true, name: true, status: true } });
  for (const f of friends) {
    const rows = await prisma.friendTraitContribution.findMany({
      where: { friendId: f.id },
      select: { tag: true, displayTag: true },
      orderBy: { createdAt: "asc" },
    });
    const byTag = new Map<string, Bucket>();
    for (const r of rows) {
      const b = byTag.get(r.tag);
      if (b) { b.weight += 1; continue; }
      byTag.set(r.tag, { tag: r.tag, displayTag: r.displayTag, weight: 1 });
    }
    const cloud = [...byTag.values()].sort((a, b) => b.weight - a.weight || a.tag.localeCompare(b.tag));
    const willUnlock = f.status === "locked" && cloud.length >= UNLOCK_AT;

    await prisma.friend.update({
      where: { id: f.id },
      data: {
        cachedTraits: cloud as unknown as object,
        cachedTraitsAt: new Date(),
        ...(willUnlock ? { status: "unlocked", unlockedAt: new Date() } : {}),
      },
    });
    console.log(`${f.name.padEnd(8)} uniqueTags=${cloud.length} unlocked=${willUnlock || f.status === "unlocked"}`);
  }
}

main().finally(() => prisma.$disconnect());

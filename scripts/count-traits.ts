import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const friends = await prisma.friend.findMany({
    select: { id: true, name: true, status: true, cachedTraits: true, cachedTraitsAt: true },
    orderBy: { name: "asc" },
  });
  for (const f of friends) {
    const contribCount = await prisma.friendTraitContribution.count({ where: { friendId: f.id } });
    const cached = Array.isArray(f.cachedTraits) ? (f.cachedTraits as unknown[]).length : 0;
    console.log(`${f.name.padEnd(8)} status=${f.status.padEnd(8)} contributions=${contribCount}  cachedTraits=${cached}  cachedAt=${f.cachedTraitsAt?.toISOString() ?? "—"}`);
  }
  console.log("---");
  const total = await prisma.friendTraitContribution.count();
  console.log(`TOTAL FriendTraitContribution rows: ${total}`);
}

main().finally(() => prisma.$disconnect());

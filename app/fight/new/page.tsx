import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { FightStarter } from "@/components/FightStarter";

export const dynamic = "force-dynamic";

export default async function NewFightPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const unlocked = await prisma.friend.findMany({
    where: { status: "unlocked" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-2xl px-6 py-10 space-y-6">
        <Link href="/roster" className="text-sm text-neutral-400 hover:text-neutral-200">
          ← Roster
        </Link>
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">New fight</h1>
          <p className="text-sm text-neutral-400">
            Pick the matchup. The slot machine spins venue and weapons next.
          </p>
        </header>
        {unlocked.length < 2 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-sm text-neutral-300 space-y-2">
            <p>Need at least two unlocked fighters to start a fight.</p>
            <p className="text-neutral-500">
              Unlock a fighter by adding 5 unique traits about them on their profile.
            </p>
          </div>
        ) : (
          <FightStarter friends={unlocked} />
        )}
      </div>
    </main>
  );
}

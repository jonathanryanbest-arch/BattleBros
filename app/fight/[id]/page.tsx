import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { FightSlotMachine } from "@/components/FightSlotMachine";
import { FightStream } from "@/components/FightStream";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function FightPage({ params }: { params: Params }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const fight = await prisma.fight.findUnique({
    where: { id },
    include: { fighterA: true, fighterB: true },
  });
  if (!fight) notFound();

  const [location, weaponA, weaponB] = await Promise.all([
    prisma.location.findUnique({ where: { key: fight.locationKey } }),
    fight.weaponAKey
      ? prisma.weapon.findUnique({ where: { key: fight.weaponAKey } })
      : Promise.resolve(null),
    fight.weaponBKey
      ? prisma.weapon.findUnique({ where: { key: fight.weaponBKey } })
      : Promise.resolve(null),
  ]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <Link href="/roster" className="text-sm text-neutral-400 hover:text-neutral-200">
          ← Roster
        </Link>

        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {fight.fighterA.name} vs {fight.fighterB.name}
          </h1>
          <p className="text-sm text-neutral-400">
            {fight.status === "spinning"
              ? "Re-roll any reel until you're happy. Then lock in to fight."
              : fight.status === "locked"
                ? "Locked. Press play to start the fight."
                : fight.status === "streaming"
                  ? "Live now."
                  : "Done."}
          </p>
        </header>

        {fight.status === "spinning" ? (
          <FightSlotMachine
            fightId={fight.id}
            fighterAName={fight.fighterA.name}
            fighterBName={fight.fighterB.name}
            location={location ? { name: location.name, blurb: location.blurb } : null}
            weaponA={weaponA ? { name: weaponA.name, blurb: weaponA.blurb } : null}
            weaponB={weaponB ? { name: weaponB.name, blurb: weaponB.blurb } : null}
          />
        ) : (
          <FightStream
            fightId={fight.id}
            fighterAId={fight.fighterAId}
            fighterAName={fight.fighterA.name}
            fighterBId={fight.fighterBId}
            fighterBName={fight.fighterB.name}
            initialNarration={
              fight.status === "done"
                ? undefined
                : undefined /* live streaming starts on mount */
            }
            initialVerdict={
              fight.status === "done" && fight.rolledWinnerId
                ? {
                    winnerId: fight.rolledWinnerId,
                    finalBlow: fight.finalBlow ?? "",
                    tagline: fight.tagline ?? "",
                  }
                : null
            }
            isDone={fight.status === "done"}
          />
        )}
      </div>
    </main>
  );
}

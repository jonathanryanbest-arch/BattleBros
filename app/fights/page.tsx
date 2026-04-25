import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function FightsHistoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const fights = await prisma.fight.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { fighterA: true, fighterB: true },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <Link href="/roster" className="text-sm text-neutral-400 hover:text-neutral-200">
          ← Roster
        </Link>
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Fights</h1>
        </header>
        {fights.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No fights yet.{" "}
            <Link href="/fight/new" className="underline">
              Start one
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {fights.map((f: (typeof fights)[number]) => {
              const winnerName =
                f.rolledWinnerId === f.fighterAId
                  ? f.fighterA.name
                  : f.rolledWinnerId === f.fighterBId
                    ? f.fighterB.name
                    : null;
              return (
                <li key={f.id}>
                  <Link
                    href={`/fight/${f.id}`}
                    className="block rounded-xl border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-600"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-base font-medium">
                        {f.fighterA.name} vs {f.fighterB.name}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">
                        {f.status}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-neutral-400">
                      {winnerName
                        ? `${winnerName} wins${f.tagline ? ` — "${f.tagline}"` : ""}`
                        : "Pending verdict"}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      {new Date(f.createdAt).toLocaleString()}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

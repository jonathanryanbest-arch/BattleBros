import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getTraitCountsForFriend } from "@/lib/trait-counts";
import { LogoutButton } from "@/components/LogoutButton";

const NEW_FIGHT_HREF = "/fight/new";

export const dynamic = "force-dynamic";

const UNLOCK_THRESHOLD = 5;

export default async function RosterPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const friends = await prisma.friend.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      status: true,
    },
  });

  const cards = await Promise.all(
    friends.map(async (f: (typeof friends)[number]) => ({
      ...f,
      counts: await getTraitCountsForFriend(f.id),
    })),
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">BattleBros</h1>
            <p className="text-sm text-neutral-400">
              {session.name} is signed in. Pick a fighter or contribute traits.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/fights"
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:border-neutral-500"
            >
              Past fights
            </Link>
            <Link
              href={NEW_FIGHT_HREF}
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:border-neutral-500"
            >
              Start a fight
            </Link>
            <LogoutButton />
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((f: (typeof cards)[number]) => {
            const locked = f.status === "locked";
            const fillRatio = Math.min(f.counts.uniqueTagsInSnapshot / UNLOCK_THRESHOLD, 1);
            return (
              <Link
                key={f.id}
                href={`/roster/${f.id}`}
                className={
                  "group relative block rounded-xl border bg-neutral-900 p-5 transition-colors hover:border-neutral-500 " +
                  (locked
                    ? "border-neutral-800 text-neutral-500"
                    : "border-neutral-700 text-neutral-100")
                }
              >
                <div className="flex items-start gap-4">
                  <div
                    className={
                      "h-16 w-16 shrink-0 rounded-full " +
                      (locked ? "bg-neutral-800" : "bg-neutral-700") +
                      " flex items-center justify-center text-xl font-semibold"
                    }
                  >
                    {locked ? "?" : f.name[0]}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold">{locked ? "Locked" : f.name}</h2>
                    <p className="text-xs uppercase tracking-wide">
                      {locked
                        ? `Traits: ${f.counts.uniqueTagsInSnapshot} / ${UNLOCK_THRESHOLD} to unlock`
                        : "Unlocked fighter"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full bg-neutral-400 transition-all"
                    style={{ width: `${fillRatio * 100}%` }}
                  />
                </div>
                {f.counts.pendingSubmissions > 0 ? (
                  <p className="mt-2 text-[11px] text-neutral-500">
                    {f.counts.pendingSubmissions} pending — applies at next nightly refresh
                  </p>
                ) : null}
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}

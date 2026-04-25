import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getTraitCountsForFriend } from "@/lib/trait-counts";

export const dynamic = "force-dynamic";

const UNLOCK_THRESHOLD = 5;

type Params = Promise<{ id: string }>;

export default async function FriendProfilePage({ params }: { params: Params }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const friend = await prisma.friend.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      status: true,
      cachedTraits: true,
      cachedTraitsAt: true,
    },
  });
  if (!friend) notFound();

  const counts = await getTraitCountsForFriend(friend.id);
  const locked = friend.status === "locked";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-8">
        <Link href="/roster" className="text-sm text-neutral-400 hover:text-neutral-200">
          ← Roster
        </Link>

        <header className="flex items-start gap-5">
          <div
            className={
              "h-24 w-24 shrink-0 rounded-full " +
              (locked ? "bg-neutral-800" : "bg-neutral-700") +
              " flex items-center justify-center text-3xl font-semibold"
            }
          >
            {locked ? "?" : friend.name[0]}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {locked ? "Locked" : friend.name}
            </h1>
            <p className="text-sm text-neutral-400">
              {locked
                ? `Traits: ${counts.uniqueTagsInSnapshot} / ${UNLOCK_THRESHOLD} to unlock as a fighter`
                : "Unlocked fighter"}
            </p>
            {counts.pendingSubmissions > 0 ? (
              <p className="text-xs text-neutral-500">
                {counts.pendingSubmissions} pending submission
                {counts.pendingSubmissions === 1 ? "" : "s"} — applies at next nightly refresh
              </p>
            ) : null}
          </div>
        </header>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Trait cloud
          </h2>
          <p className="text-sm text-neutral-500">
            {locked ? "No traits yet — be the first to add one." : "Trait cloud coming soon."}
          </p>
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Add a trait
          </h2>
          <p className="text-sm text-neutral-500">Trait submission UI ships in M2.</p>
        </section>
      </div>
    </main>
  );
}

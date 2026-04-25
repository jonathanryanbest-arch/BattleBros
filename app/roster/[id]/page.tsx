import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getTraitCountsForFriend } from "@/lib/trait-counts";
import { loadCachedTraits, loadContributionRows } from "@/lib/profile-data";
import { pickSuggestions } from "@/lib/traits";
import { AddTraitForm } from "@/components/AddTraitForm";
import { TraitCloud } from "@/components/TraitCloud";
import { TraitContributionList } from "@/components/TraitContributionList";

export const dynamic = "force-dynamic";

const UNLOCK_THRESHOLD = 5;

type Params = Promise<{ id: string }>;

export default async function FriendProfilePage({ params }: { params: Params }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const friend = await prisma.friend.findUnique({
    where: { id },
    select: { id: true, name: true, avatarUrl: true, status: true },
  });
  if (!friend) notFound();

  const [counts, cached] = await Promise.all([
    getTraitCountsForFriend(friend.id),
    loadCachedTraits(friend.id),
  ]);
  const contributions = await loadContributionRows(
    friend.id,
    session.friendId,
    cached.cachedTraitsAt,
  );

  const locked = friend.status === "locked";
  const seed = (friend.id + (session.friendId ?? "")).split("").reduce(
    (acc, ch) => acc + ch.charCodeAt(0),
    0,
  );
  const suggestions = pickSuggestions(seed, 3);

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
          <TraitCloud
            traits={cached.traits}
            emptyMessage={
              locked
                ? "No traits yet — be the first to add one."
                : "Snapshot pending — refreshes nightly."
            }
          />
          {cached.cachedTraitsAt ? (
            <p className="text-[11px] text-neutral-500">
              Last refreshed {new Date(cached.cachedTraitsAt).toLocaleString()}
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Add a trait
          </h2>
          <AddTraitForm friendId={friend.id} friendName={friend.name} suggestions={suggestions} />
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Contributed traits
          </h2>
          <TraitContributionList friendId={friend.id} contributions={contributions} />
        </section>
      </div>
    </main>
  );
}

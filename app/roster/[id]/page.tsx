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

const FIGHTER_THRESHOLD = 5;
const SIGNATURE_WEAPON_THRESHOLD = 10;
const HOME_VENUE_THRESHOLD = 15;

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
      heightInches: true,
      weightLbs: true,
    },
  });
  if (!friend) notFound();

  const [counts, cached, signatureWeapon, homeVenue] = await Promise.all([
    getTraitCountsForFriend(friend.id),
    loadCachedTraits(friend.id),
    prisma.weapon.findFirst({
      where: { source: "emergent", derivedFromFriendId: friend.id },
      select: { name: true, blurb: true },
    }),
    prisma.location.findFirst({
      where: { source: "emergent", derivedFromFriendId: friend.id },
      select: { name: true, blurb: true },
    }),
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
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-neutral-700 flex items-center justify-center text-3xl font-semibold">
            {friend.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={friend.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              friend.name[0]
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{friend.name}</h1>
            {friend.heightInches != null || friend.weightLbs != null ? (
              <p className="text-sm text-neutral-300">
                {formatHeightWeight(friend.heightInches, friend.weightLbs)}
              </p>
            ) : null}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span
                className={
                  "uppercase tracking-wide rounded-full px-2 py-0.5 " +
                  (locked
                    ? "bg-neutral-800 text-neutral-400"
                    : "bg-emerald-900/40 text-emerald-300")
                }
              >
                {locked ? "Locked fighter" : "Unlocked fighter"}
              </span>
              {counts.pendingSubmissions > 0 ? (
                <span className="text-neutral-500">
                  {counts.pendingSubmissions} syncing
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Progress to unlocks
          </h2>
          <div className="space-y-3">
            <UnlockRow
              label="Fighter"
              threshold={FIGHTER_THRESHOLD}
              current={counts.uniqueTagsInSnapshot}
              unlockedItem={null}
            />
            <UnlockRow
              label="Signature weapon"
              threshold={SIGNATURE_WEAPON_THRESHOLD}
              current={counts.uniqueTagsInSnapshot}
              unlockedItem={signatureWeapon}
              pendingDerivation
            />
            <UnlockRow
              label="Home venue"
              threshold={HOME_VENUE_THRESHOLD}
              current={counts.uniqueTagsInSnapshot}
              unlockedItem={homeVenue}
              pendingDerivation
            />
          </div>
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Trait cloud
          </h2>
          <TraitCloud
            traits={cached.traits}
            emptyMessage={
              locked
                ? "No traits yet — be the first to add one."
                : "No traits in the snapshot yet."
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

function formatHeightWeight(
  heightInches: number | null,
  weightLbs: number | null,
): string {
  const parts: string[] = [];
  if (heightInches != null) {
    const feet = Math.floor(heightInches / 12);
    const inches = heightInches % 12;
    parts.push(`${feet}'${inches}"`);
  }
  if (weightLbs != null) {
    parts.push(`${weightLbs} lbs`);
  }
  return parts.join(" • ");
}

function UnlockRow({
  label,
  threshold,
  current,
  unlockedItem,
  pendingDerivation = false,
}: {
  label: string;
  threshold: number;
  current: number;
  unlockedItem: { name: string; blurb: string } | null;
  pendingDerivation?: boolean;
}) {
  const reached = current >= threshold;
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
        {!reached ? (
          <p className="text-sm text-neutral-400">Locked</p>
        ) : unlockedItem ? (
          <>
            <p className="text-sm font-medium text-neutral-100">{unlockedItem.name}</p>
            <p className="text-xs text-neutral-500">{unlockedItem.blurb}</p>
          </>
        ) : pendingDerivation ? (
          <p className="text-sm text-neutral-400">
            Pending — applies at next nightly refresh
          </p>
        ) : (
          <p className="text-sm text-emerald-300">Unlocked</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-[11px] text-neutral-500">
          {Math.min(current, threshold)} / {threshold}
        </p>
        {!reached ? (
          <div className="mt-1 h-1 w-24 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-neutral-400"
              style={{ width: `${Math.min(current / threshold, 1) * 100}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

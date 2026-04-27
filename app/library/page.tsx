import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const SIGNATURE_WEAPON_THRESHOLD = 10;
const HOME_VENUE_THRESHOLD = 15;

type Friend = {
  id: string;
  name: string;
  cachedTraits: unknown;
};

type EmergentEntry = {
  derivedFromFriendId: string | null;
  name: string;
  blurb: string;
};

export default async function LibraryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [weapons, locations, friends] = await Promise.all([
    prisma.weapon.findMany({
      orderBy: [{ source: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        blurb: true,
        source: true,
        derivedFromFriendId: true,
      },
    }),
    prisma.location.findMany({
      orderBy: [{ source: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        blurb: true,
        source: true,
        derivedFromFriendId: true,
      },
    }),
    prisma.friend.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, cachedTraits: true },
    }),
  ]);

  const day1Weapons = weapons.filter((w: (typeof weapons)[number]) => w.source === "day1");
  const day1Locations = locations.filter((l: (typeof locations)[number]) => l.source === "day1");

  const emergentWeaponByFriend = new Map<string, EmergentEntry>();
  for (const w of weapons) {
    if (w.source === "emergent" && w.derivedFromFriendId) {
      emergentWeaponByFriend.set(w.derivedFromFriendId, w);
    }
  }
  const emergentLocationByFriend = new Map<string, EmergentEntry>();
  for (const l of locations) {
    if (l.source === "emergent" && l.derivedFromFriendId) {
      emergentLocationByFriend.set(l.derivedFromFriendId, l);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-10">
        <Link href="/roster" className="text-sm text-neutral-400 hover:text-neutral-200">
          ← Roster
        </Link>

        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-sm text-neutral-400">
            Every weapon and venue in the slot machine. Day-1 items are always available.
            Signature weapons unlock per-fighter at {SIGNATURE_WEAPON_THRESHOLD} traits;
            home venues at {HOME_VENUE_THRESHOLD}.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Weapons — Day 1
          </h2>
          <ul className="rounded-xl border border-neutral-800 bg-neutral-900 divide-y divide-neutral-800">
            {day1Weapons.map((w: (typeof day1Weapons)[number]) => (
              <ItemRow key={w.id} name={w.name} blurb={w.blurb} status="day1" />
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Signature weapons
          </h2>
          <ul className="rounded-xl border border-neutral-800 bg-neutral-900 divide-y divide-neutral-800">
            {friends.map((f: Friend) => (
              <SignatureRow
                key={f.id}
                friend={f}
                threshold={SIGNATURE_WEAPON_THRESHOLD}
                kind="weapon"
                item={emergentWeaponByFriend.get(f.id) ?? null}
              />
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Venues — Day 1
          </h2>
          <ul className="rounded-xl border border-neutral-800 bg-neutral-900 divide-y divide-neutral-800">
            {day1Locations.map((l: (typeof day1Locations)[number]) => (
              <ItemRow key={l.id} name={l.name} blurb={l.blurb} status="day1" />
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Home venues
          </h2>
          <ul className="rounded-xl border border-neutral-800 bg-neutral-900 divide-y divide-neutral-800">
            {friends.map((f: Friend) => (
              <SignatureRow
                key={f.id}
                friend={f}
                threshold={HOME_VENUE_THRESHOLD}
                kind="venue"
                item={emergentLocationByFriend.get(f.id) ?? null}
              />
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function ItemRow({
  name,
  blurb,
  status,
}: {
  name: string;
  blurb: string;
  status: "day1" | "unlocked" | "locked" | "pending";
}) {
  return (
    <li className="flex items-start justify-between gap-4 px-5 py-4">
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-100">{name}</p>
        <p className="text-xs text-neutral-500">{blurb}</p>
      </div>
      {status === "day1" ? (
        <span className="text-[10px] uppercase tracking-wide rounded-full bg-neutral-800 text-neutral-400 px-2 py-0.5 shrink-0">
          Day 1
        </span>
      ) : status === "unlocked" ? (
        <span className="text-[10px] uppercase tracking-wide rounded-full bg-emerald-900/40 text-emerald-300 px-2 py-0.5 shrink-0">
          Unlocked
        </span>
      ) : null}
    </li>
  );
}

function SignatureRow({
  friend,
  threshold,
  kind,
  item,
}: {
  friend: Friend;
  threshold: number;
  kind: "weapon" | "venue";
  item: EmergentEntry | null;
}) {
  const traitCount = Array.isArray(friend.cachedTraits)
    ? (friend.cachedTraits as unknown[]).length
    : 0;
  const reached = traitCount >= threshold;
  const label = kind === "weapon" ? "signature weapon" : "home venue";

  return (
    <li className="flex items-start justify-between gap-4 px-5 py-4">
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {friend.name}&apos;s {label}
        </p>
        {item ? (
          <>
            <p className="text-sm font-medium text-neutral-100">{item.name}</p>
            <p className="text-xs text-neutral-500">{item.blurb}</p>
          </>
        ) : reached ? (
          <p className="text-sm text-neutral-400">
            Pending — applies at next nightly refresh
          </p>
        ) : (
          <p className="text-sm text-neutral-400">Locked</p>
        )}
      </div>
      <div className="text-right shrink-0">
        {item ? (
          <span className="text-[10px] uppercase tracking-wide rounded-full bg-emerald-900/40 text-emerald-300 px-2 py-0.5">
            Unlocked
          </span>
        ) : (
          <>
            <p className="text-[11px] text-neutral-500">
              {Math.min(traitCount, threshold)} / {threshold}
            </p>
            {!reached ? (
              <div className="mt-1 h-1 w-24 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-neutral-400"
                  style={{ width: `${Math.min(traitCount / threshold, 1) * 100}%` }}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </li>
  );
}

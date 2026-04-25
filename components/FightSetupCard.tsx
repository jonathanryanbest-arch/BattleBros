import type { Drunkenness } from "@prisma/client";

type Props = {
  location: { name: string; blurb: string } | null;
  weaponA: { name: string } | null;
  weaponB: { name: string } | null;
  fighterAName: string;
  fighterBName: string;
  drunkennessA: Drunkenness;
  drunkennessB: Drunkenness;
};

export function FightSetupCard({
  location,
  weaponA,
  weaponB,
  fighterAName,
  fighterBName,
  drunkennessA,
  drunkennessB,
}: Props) {
  return (
    <aside className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
      <Stat label="Venue" value={location ? location.name : "—"} sub={location?.blurb} />
      <Stat
        label={fighterAName}
        value={weaponA ? weaponA.name : "Bare hands"}
        sub={drunkennessLabel(drunkennessA)}
      />
      <Stat
        label={fighterBName}
        value={weaponB ? weaponB.name : "Bare hands"}
        sub={drunkennessLabel(drunkennessB)}
      />
    </aside>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="text-base font-medium text-neutral-100">{value}</p>
      {sub ? <p className="text-xs text-neutral-500">{sub}</p> : null}
    </div>
  );
}

function drunkennessLabel(d: Drunkenness): string {
  return d.charAt(0).toUpperCase() + d.slice(1);
}

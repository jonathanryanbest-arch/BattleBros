"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SlotInfo = { name: string; blurb: string } | null;

type Props = {
  fightId: string;
  fighterAName: string;
  fighterBName: string;
  location: SlotInfo;
  weaponA: SlotInfo;
  weaponB: SlotInfo;
};

export function FightSlotMachine({
  fightId,
  fighterAName,
  fighterBName,
  location,
  weaponA,
  weaponB,
}: Props) {
  const router = useRouter();
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function spin(slot: "location" | "weaponA" | "weaponB") {
    setError(null);
    setPendingSlot(slot);
    try {
      const res = await fetch(`/api/fight/${fightId}/spin/${slot}`, { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Re-roll failed.");
        return;
      }
      router.refresh();
    } finally {
      setPendingSlot(null);
    }
  }

  async function lock() {
    setError(null);
    setLocking(true);
    try {
      const res = await fetch(`/api/fight/${fightId}/lock`, { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Lock failed.");
        return;
      }
      router.refresh();
    } finally {
      setLocking(false);
    }
  }

  return (
    <div className="space-y-4">
      <Reel
        title="Venue"
        slot={location}
        spinning={pendingSlot === "location"}
        emptyMsg="…"
        onSpin={() => spin("location")}
      />
      <Reel
        title={`Weapon — ${fighterAName}`}
        slot={weaponA}
        spinning={pendingSlot === "weaponA"}
        emptyMsg="bare hands"
        onSpin={() => spin("weaponA")}
      />
      <Reel
        title={`Weapon — ${fighterBName}`}
        slot={weaponB}
        spinning={pendingSlot === "weaponB"}
        emptyMsg="bare hands"
        onSpin={() => spin("weaponB")}
      />
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          When you&apos;re happy, lock in. The verdict is rolled at lock and hidden until the
          end of narration.
        </div>
        <button
          type="button"
          disabled={locking || !!pendingSlot}
          onClick={lock}
          className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 disabled:opacity-50"
        >
          {locking ? "Locking…" : "Lock in & fight"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

function Reel({
  title,
  slot,
  spinning,
  emptyMsg,
  onSpin,
}: {
  title: string;
  slot: SlotInfo;
  spinning: boolean;
  emptyMsg: string;
  onSpin: () => void;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 flex items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-wide text-neutral-500">{title}</p>
        <p className={"text-lg font-medium " + (spinning ? "text-neutral-500" : "text-neutral-100")}>
          {spinning ? "spinning…" : slot ? slot.name : emptyMsg}
        </p>
        {slot ? <p className="text-xs text-neutral-500">{slot.blurb}</p> : null}
      </div>
      <button
        type="button"
        disabled={spinning}
        onClick={onSpin}
        className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:border-neutral-500 disabled:opacity-50"
      >
        {spinning ? "…" : "Re-roll"}
      </button>
    </div>
  );
}

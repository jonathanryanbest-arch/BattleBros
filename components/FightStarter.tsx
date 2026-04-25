"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  friends: { id: string; name: string }[];
};

export function FightStarter({ friends }: Props) {
  const router = useRouter();
  const [aId, setAId] = useState(friends[0]?.id ?? "");
  const [bId, setBId] = useState(friends[1]?.id ?? friends[0]?.id ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/fight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fighterAId: aId, fighterBId: bId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fightId?: string;
      };
      if (!res.ok || !data.fightId) {
        setError(data.error ?? "Couldn't start fight.");
        return;
      }
      router.push(`/fight/${data.fightId}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-neutral-400">Fighter A</span>
          <select
            value={aId}
            onChange={(e) => setAId(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          >
            {friends.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-neutral-400">Fighter B</span>
          <select
            value={bId}
            onChange={(e) => setBId(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          >
            {friends.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={pending || aId === bId}
        className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 disabled:opacity-50"
      >
        {pending ? "Starting…" : "Spin the reels"}
      </button>
      {aId === bId ? (
        <p className="text-xs text-neutral-500">Pick two different fighters.</p>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </form>
  );
}

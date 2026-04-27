"use client";

import { useMemo, useState } from "react";

type FriendOption = {
  id: string;
  name: string;
  heightInches: number | null;
  weightLbs: number | null;
};

type TraitsResult = {
  inserted: number;
  duplicates: number;
  invalid: string[];
};

export function OperatorPanel({ friends }: { friends: FriendOption[] }) {
  const [friendId, setFriendId] = useState(friends[0]?.id ?? "");
  const selected = useMemo(
    () => friends.find((f) => f.id === friendId) ?? null,
    [friends, friendId],
  );

  return (
    <div className="space-y-6">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-neutral-200">Friend</span>
        <select
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-neutral-400 focus:outline-none"
        >
          {friends.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>

      {selected ? (
        <>
          <StatsSection
            key={`stats-${selected.id}`}
            friendId={selected.id}
            friendName={selected.name}
            initialHeightInches={selected.heightInches}
            initialWeightLbs={selected.weightLbs}
          />
          <TraitsSection
            key={`traits-${selected.id}`}
            friendId={selected.id}
            friendName={selected.name}
          />
        </>
      ) : null}
    </div>
  );
}

function StatsSection({
  friendId,
  friendName,
  initialHeightInches,
  initialWeightLbs,
}: {
  friendId: string;
  friendName: string;
  initialHeightInches: number | null;
  initialWeightLbs: number | null;
}) {
  const initialFeet =
    initialHeightInches != null ? Math.floor(initialHeightInches / 12) : "";
  const initialInches =
    initialHeightInches != null ? initialHeightInches % 12 : "";

  const [feet, setFeet] = useState<string>(String(initialFeet));
  const [inches, setInches] = useState<string>(String(initialInches));
  const [weight, setWeight] = useState<string>(
    initialWeightLbs != null ? String(initialWeightLbs) : "",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(null);

    let heightInches: number | null = null;
    if (feet !== "" || inches !== "") {
      const f = Number(feet || 0);
      const i = Number(inches || 0);
      if (!Number.isFinite(f) || !Number.isFinite(i) || f < 0 || i < 0 || i >= 12) {
        setError("Invalid height. Inches must be 0–11.");
        return;
      }
      heightInches = f * 12 + i;
      if (heightInches < 36 || heightInches > 96) {
        setError("Height must be between 3'0\" and 8'0\".");
        return;
      }
    }

    let weightLbs: number | null = null;
    if (weight !== "") {
      const w = Number(weight);
      if (!Number.isFinite(w) || w < 40 || w > 600) {
        setError("Weight must be between 40 and 600 lbs.");
        return;
      }
      weightLbs = Math.round(w);
    }

    setPending(true);
    try {
      const res = await fetch(`/api/friends/${friendId}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heightInches, weightLbs }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Save failed.");
        return;
      }
      setSaved(`Saved stats for ${friendName}.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
        Friend stats
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-neutral-500">
              Height
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={8}
                value={feet}
                onChange={(e) => setFeet(e.target.value)}
                placeholder="ft"
                className="w-16 rounded-md border border-neutral-700 bg-neutral-950 px-2 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-400 focus:outline-none"
              />
              <span className="text-sm text-neutral-400">ft</span>
              <input
                type="number"
                min={0}
                max={11}
                value={inches}
                onChange={(e) => setInches(e.target.value)}
                placeholder="in"
                className="w-16 rounded-md border border-neutral-700 bg-neutral-950 px-2 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-400 focus:outline-none"
              />
              <span className="text-sm text-neutral-400">in</span>
            </div>
          </label>
          <label className="col-span-2 block space-y-1">
            <span className="text-xs uppercase tracking-wide text-neutral-500">
              Weight
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={40}
                max={600}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="lbs"
                className="w-24 rounded-md border border-neutral-700 bg-neutral-950 px-2 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-400 focus:outline-none"
              />
              <span className="text-sm text-neutral-400">lbs</span>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save stats"}
        </button>

        <p className="text-[11px] text-neutral-500">
          Leave a field blank to clear it.
        </p>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {saved ? <p className="text-sm text-emerald-400">{saved}</p> : null}
      </form>
    </section>
  );
}

function TraitsSection({
  friendId,
  friendName,
}: {
  friendId: string;
  friendName: string;
}) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TraitsResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const tags = text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (tags.length === 0) {
      setError("Add at least one trait.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`/api/friends/${friendId}/traits/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        inserted?: number;
        duplicates?: number;
        invalid?: string[];
      };
      if (!res.ok) {
        setError(data.error ?? "Submit failed.");
        return;
      }
      setResult({
        inserted: data.inserted ?? 0,
        duplicates: data.duplicates ?? 0,
        invalid: data.invalid ?? [],
      });
      setText("");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
        Starter traits
      </h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-neutral-200">
            Traits for {friendName} (one per line)
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder={"always wears a bucket hat\nfreezes when challenged\ntalks too loud at last call"}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-400 focus:outline-none font-mono"
          />
          <span className="text-[11px] text-neutral-500">
            Bypasses the sanity gate and the daily rate limit. Duplicates of
            traits you&apos;ve already submitted are silently skipped.
          </span>
        </label>

        <button
          type="submit"
          disabled={pending || text.trim().length === 0}
          className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 disabled:opacity-50"
        >
          {pending ? "Submitting…" : "Submit traits"}
        </button>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {result ? (
          <div className="space-y-2 rounded-md border border-emerald-900/50 bg-emerald-950/30 p-3 text-sm">
            <p className="text-emerald-300">
              {friendName}: {result.inserted} added
              {result.duplicates > 0
                ? `, ${result.duplicates} duplicate${result.duplicates === 1 ? "" : "s"}`
                : ""}
              {result.invalid.length > 0
                ? `, ${result.invalid.length} invalid`
                : ""}
              .
            </p>
            {result.invalid.length > 0 ? (
              <div className="text-xs text-neutral-400">
                <p className="text-neutral-500">Invalid lines:</p>
                <ul className="list-disc list-inside">
                  {result.invalid.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="text-[11px] text-neutral-500">
              Trait cloud refreshes nightly.
            </p>
          </div>
        ) : null}
      </form>
    </section>
  );
}

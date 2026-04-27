"use client";

import { useState } from "react";

type FriendOption = { id: string; name: string };

type Result = {
  friendName: string;
  inserted: number;
  duplicates: number;
  invalid: string[];
};

export function StarterTraitsForm({ friends }: { friends: FriendOption[] }) {
  const [friendId, setFriendId] = useState(friends[0]?.id ?? "");
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

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
    if (!friendId) {
      setError("Pick a friend.");
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
      const friendName = friends.find((f) => f.id === friendId)?.name ?? "";
      setResult({
        friendName,
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
    <form onSubmit={onSubmit} className="space-y-4">
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

      <label className="block space-y-1">
        <span className="text-sm font-medium text-neutral-200">
          Traits (one per line)
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder={"always wears a bucket hat\nfreezes when challenged\ntalks too loud at last call"}
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-400 focus:outline-none font-mono"
        />
        <span className="text-[11px] text-neutral-500">
          Bypasses the sanity gate and the daily rate limit. Duplicates of traits
          you&apos;ve already submitted are silently skipped.
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
            {result.friendName}: {result.inserted} added
            {result.duplicates > 0 ? `, ${result.duplicates} duplicate${result.duplicates === 1 ? "" : "s"}` : ""}
            {result.invalid.length > 0 ? `, ${result.invalid.length} invalid` : ""}
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
  );
}

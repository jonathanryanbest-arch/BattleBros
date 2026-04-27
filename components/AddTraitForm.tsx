"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TRAIT_MAX_LENGTH } from "@/lib/traits";

type Props = {
  friendId: string;
  friendName: string;
  suggestions: string[];
};

export function AddTraitForm({ friendId, friendName, suggestions }: Props) {
  const router = useRouter();
  const [tag, setTag] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConfirmation(null);
    setPending(true);
    try {
      const res = await fetch(`/api/friends/${friendId}/traits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        displayTag?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Couldn't submit that trait.");
        return;
      }
      setTag("");
      setConfirmation(
        `Added "${data.displayTag ?? tag}" to ${friendName}'s cloud.`,
      );
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-neutral-200">
          Add a trait for {friendName}
        </span>
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value.slice(0, TRAIT_MAX_LENGTH))}
          maxLength={TRAIT_MAX_LENGTH}
          placeholder="e.g. always wears a bucket hat"
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-400 focus:outline-none"
          required
        />
        <span className="text-[11px] text-neutral-500">
          {tag.length} / {TRAIT_MAX_LENGTH}
        </span>
      </label>

      <div className="space-y-1">
        <span className="text-[11px] uppercase tracking-wide text-neutral-500">
          Maybe try…
        </span>
        <ul className="flex flex-wrap gap-2 text-[12px] text-neutral-400">
          {suggestions.map((s) => (
            <li key={s} className="rounded-full border border-neutral-800 px-2 py-0.5">
              {s}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="submit"
        disabled={pending || tag.trim().length === 0}
        className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit trait"}
      </button>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {confirmation ? <p className="text-sm text-emerald-400">{confirmation}</p> : null}
    </form>
  );
}

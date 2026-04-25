"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type ContributionRow = {
  tag: string;
  displayTag: string;
  submitterName: string;
  submittedAt: string; // ISO
  upvotes: number;
  viewerHasUpvoted: boolean;
  pending: boolean;
};

type Props = {
  friendId: string;
  contributions: ContributionRow[];
};

export function TraitContributionList({ friendId, contributions }: Props) {
  const router = useRouter();
  const [pendingTag, setPendingTag] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (contributions.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No traits yet. Add the first one above.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-800">
      {contributions.map((c) => (
        <li key={c.tag} className="flex items-start justify-between gap-3 py-3">
          <div className="space-y-0.5">
            <p className="text-sm text-neutral-100">
              {c.displayTag}
              {c.pending ? (
                <span className="ml-2 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-400">
                  pending nightly refresh
                </span>
              ) : null}
            </p>
            <p className="text-[11px] text-neutral-500">
              first by {c.submitterName} · weight {c.upvotes + 1}
            </p>
          </div>
          <button
            type="button"
            disabled={c.viewerHasUpvoted || pendingTag === c.tag}
            onClick={async () => {
              setPendingTag(c.tag);
              try {
                await fetch(
                  `/api/friends/${friendId}/traits/${encodeURIComponent(c.tag)}/upvote`,
                  { method: "POST" },
                );
                startTransition(() => router.refresh());
              } finally {
                setPendingTag(null);
              }
            }}
            className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-200 hover:border-neutral-500 disabled:opacity-50"
          >
            {c.viewerHasUpvoted ? "Upvoted" : pendingTag === c.tag ? "…" : "Upvote"}
          </button>
        </li>
      ))}
    </ul>
  );
}

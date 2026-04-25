"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  fighterAId: string;
  fighterBId: string;
};

export function RematchButton({ fighterAId, fighterBId }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setError(null);
          setPending(true);
          try {
            const res = await fetch("/api/fight", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fighterAId, fighterBId }),
            });
            const data = (await res.json().catch(() => ({}))) as {
              error?: string;
              fightId?: string;
            };
            if (!res.ok || !data.fightId) {
              setError(data.error ?? "Couldn't start a rematch.");
              return;
            }
            router.push(`/fight/${data.fightId}`);
          } finally {
            setPending(false);
          }
        }}
        className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:border-neutral-500 disabled:opacity-50"
      >
        {pending ? "Setting up…" : "Rematch — fresh roll"}
        {error ? <span className="ml-2 text-red-400">{error}</span> : null}
      </button>
    </div>
  );
}

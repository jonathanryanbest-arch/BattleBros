"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Verdict = {
  winnerId: string;
  finalBlow: string;
  tagline: string;
};

type Props = {
  fightId: string;
  fighterAId: string;
  fighterAName: string;
  fighterBId: string;
  fighterBName: string;
  initialNarration?: string;
  initialVerdict: Verdict | null;
  isDone: boolean;
};

type StreamEvent =
  | { type: "ready" }
  | { type: "delta"; text: string }
  | { type: "verdict"; winnerId: string; finalBlow: string; tagline: string }
  | { type: "error"; message: string }
  | { type: "end" };

export function FightStream({
  fightId,
  fighterAId,
  fighterAName,
  fighterBId,
  fighterBName,
  initialNarration,
  initialVerdict,
  isDone,
}: Props) {
  const [text, setText] = useState(initialNarration ?? "");
  const [verdict, setVerdict] = useState<Verdict | null>(initialVerdict);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStreaming(true);
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/fight/${fightId}/stream`);
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          setError(`Stream failed: ${res.status} ${text || res.statusText}`);
          return;
        }
        if (!res.body) {
          setError("No stream body");
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const block of events) {
            const line = block.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            try {
              const ev = JSON.parse(line.slice(6)) as StreamEvent;
              if (ev.type === "delta") setText((prev) => prev + ev.text);
              else if (ev.type === "verdict") {
                setVerdict({
                  winnerId: ev.winnerId,
                  finalBlow: ev.finalBlow,
                  tagline: ev.tagline,
                });
              } else if (ev.type === "error") setError(ev.message);
            } catch {
              /* ignore */
            }
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Stream failed";
        setError(msg);
      } finally {
        if (!cancelled) setStreaming(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fightId]);

  const winnerName =
    verdict?.winnerId === fighterAId
      ? fighterAName
      : verdict?.winnerId === fighterBId
        ? fighterBName
        : null;

  return (
    <div className="space-y-6">
      <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-neutral-100">
          {text}
          {streaming && !verdict ? <span className="opacity-60"> ▍</span> : null}
        </p>
      </article>

      {verdict ? (
        <article className="rounded-xl border border-emerald-700 bg-emerald-950/50 p-6 space-y-2">
          <p className="text-xs uppercase tracking-wide text-emerald-400">Verdict</p>
          <h2 className="text-2xl font-bold text-emerald-200">{winnerName} wins!</h2>
          <p className="text-sm text-emerald-100">{verdict.finalBlow}</p>
          <p className="text-base italic text-emerald-300">&quot;{verdict.tagline}&quot;</p>
        </article>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {isDone || verdict ? (
        <p className="text-sm text-neutral-500">
          Finished.{" "}
          <Link href="/fight/new" className="underline">
            Start another fight
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}

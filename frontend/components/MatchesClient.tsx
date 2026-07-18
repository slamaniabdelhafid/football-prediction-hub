"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Match } from "@/lib/types";
import MatchCard from "@/components/MatchCard";

type DayFilter = "today" | "tomorrow" | "yesterday" | null;
type StatusFilter = "live" | "finished" | "scheduled" | null;

const DAY_CHIPS: { key: DayFilter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "yesterday", label: "Yesterday" },
];
const STATUS_CHIPS: { key: StatusFilter; label: string }[] = [
  { key: "live", label: "Live" },
  { key: "finished", label: "Finished" },
  { key: "scheduled", label: "Upcoming" },
];

export default function MatchesClient() {
  const [day, setDay] = useState<DayFilter>(null);
  const [status, setStatus] = useState<StatusFilter>(null);
  const [highConfidence, setHighConfidence] = useState(false);
  const [btts, setBtts] = useState(false);
  const [over25, setOver25] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.matchesFiltered({
        day: day ?? undefined,
        status: status ?? undefined,
        minConfidence: highConfidence ? 85 : undefined,
        bttsMin: btts ? 60 : undefined,
        over25Min: over25 ? 60 : undefined,
      });
      setMatches(data);
      setError(null);
    } catch {
      setError("Can't reach the backend API right now.");
    } finally {
      setLoading(false);
    }
  }, [day, status, highConfidence, btts, over25]);

  useEffect(() => {
    load();
  }, [load]);

  function Chip({
    active,
    label,
    onClick,
  }: {
    active: boolean;
    label: string;
    onClick: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-1.5 rounded-full text-sm font-mono uppercase tracking-wide border whitespace-nowrap transition-colors ${
          active
            ? "bg-turf/15 border-turf text-turf"
            : "border-line text-text-dim hover:text-text"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-[11px] font-mono text-turf uppercase tracking-widest mb-1">
        {loading ? "Loading…" : `${matches.length} matches`}
      </p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight mb-8">
        All Matches
      </h1>

      <div className="flex flex-col gap-3 mb-8">
        <div className="flex gap-2 overflow-x-auto">
          {DAY_CHIPS.map((c) => (
            <Chip
              key={c.label}
              label={c.label}
              active={day === c.key}
              onClick={() => setDay(day === c.key ? null : c.key)}
            />
          ))}
          {STATUS_CHIPS.map((c) => (
            <Chip
              key={c.label}
              label={c.label}
              active={status === c.key}
              onClick={() => setStatus(status === c.key ? null : c.key)}
            />
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Chip label="High Confidence" active={highConfidence} onClick={() => setHighConfidence((v) => !v)} />
          <Chip label="BTTS" active={btts} onClick={() => setBtts((v) => !v)} />
          <Chip label="Over 2.5 Goals" active={over25} onClick={() => setOver25((v) => !v)} />
        </div>
      </div>

      {error && (
        <div className="rounded-card border border-red/40 bg-red/10 text-red text-sm font-mono px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {!loading && matches.length === 0 && !error ? (
        <p className="text-text-dim text-sm font-mono py-12 text-center border border-dashed border-line rounded-card">
          No matches match these filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

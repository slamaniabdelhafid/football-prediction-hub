"use client";

import type { League } from "@/lib/types";

export default function LeagueManager({
  leagues,
  onToggle,
  pendingIds,
}: {
  leagues: League[];
  onToggle: (leagueId: string, next: boolean) => void;
  pendingIds: Set<string>;
}) {
  if (leagues.length === 0) {
    return <p className="text-text-dim text-sm font-mono py-6">No leagues loaded.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {leagues.map((l) => (
        <div
          key={l.id}
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-card border border-line bg-surface"
        >
          <div className="min-w-0 flex items-center gap-2">
            <span className="text-lg leading-none">{l.country.flag_emoji}</span>
            <div className="min-w-0">
              <p className="truncate font-medium text-sm">{l.name}</p>
              <p className="text-[11px] font-mono text-text-dim truncate">{l.country.name}</p>
            </div>
          </div>
          <button
            onClick={() => onToggle(l.id, !l.popular)}
            disabled={pendingIds.has(l.id)}
            className={`text-xs font-mono px-3 py-1.5 rounded-full border shrink-0 transition-colors disabled:opacity-50 ${
              l.popular
                ? "bg-turf/15 border-turf text-turf"
                : "border-line text-text-dim hover:text-text"
            }`}
          >
            {pendingIds.has(l.id) ? "…" : l.popular ? "Enabled" : "Disabled"}
          </button>
        </div>
      ))}
    </div>
  );
}

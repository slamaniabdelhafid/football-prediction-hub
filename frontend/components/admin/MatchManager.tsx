"use client";

import type { Match } from "@/lib/types";

export default function MatchManager({
  matches,
  onToggleFeature,
  pendingIds,
}: {
  matches: Match[];
  onToggleFeature: (matchId: string, next: boolean) => void;
  pendingIds: Set<string>;
}) {
  if (matches.length === 0) {
    return <p className="text-text-dim text-sm font-mono py-6">No matches today.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {matches.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between gap-4 px-4 py-3 rounded-card border border-line bg-surface"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">
              {m.home_team.name} <span className="text-text-dim">vs</span> {m.away_team.name}
            </p>
            <p className="text-[11px] font-mono text-text-dim truncate">
              {m.league_id.replace(/-/g, " ")}
            </p>
          </div>
          <button
            onClick={() => onToggleFeature(m.id, !m.featured)}
            disabled={pendingIds.has(m.id)}
            className={`text-xs font-mono px-3 py-1.5 rounded-full border shrink-0 transition-colors disabled:opacity-50 ${
              m.featured
                ? "bg-amber/15 border-amber text-amber"
                : "border-line text-text-dim hover:text-text"
            }`}
          >
            {pendingIds.has(m.id) ? "…" : m.featured ? "Featured ★" : "Feature"}
          </button>
        </div>
      ))}
    </div>
  );
}

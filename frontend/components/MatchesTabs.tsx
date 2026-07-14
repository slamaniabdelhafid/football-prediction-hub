"use client";

import { useState } from "react";
import type { Match } from "@/lib/types";
import MatchCard from "./MatchCard";

type TabKey = "today" | "tomorrow" | "yesterday";

export default function MatchesTabs({
  today,
  tomorrow,
  yesterday,
}: {
  today: Match[];
  tomorrow: Match[];
  yesterday: Match[];
}) {
  const [tab, setTab] = useState<TabKey>("today");
  const data: Record<TabKey, Match[]> = { today, tomorrow, yesterday };
  const active = data[tab];

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {(["today", "tomorrow", "yesterday"] as TabKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-mono uppercase tracking-wide border transition-colors ${
              tab === key
                ? "bg-turf/15 border-turf text-turf"
                : "border-line text-text-dim hover:text-text"
            }`}
          >
            {key} <span className="opacity-60">({data[key].length})</span>
          </button>
        ))}
      </div>

      {active.length === 0 ? (
        <p className="text-text-dim text-sm font-mono py-8 text-center border border-dashed border-line rounded-card">
          No matches to show for {tab}.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

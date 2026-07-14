"use client";

import { useState } from "react";
import type { Match, StandingRow } from "@/lib/types";
import StandingsTable from "./StandingsTable";
import FixtureRow from "./FixtureRow";
import MatchCard from "./MatchCard";

type TabKey = "standings" | "fixtures" | "results" | "predictions";

const TABS: { key: TabKey; label: string }[] = [
  { key: "standings", label: "Standings" },
  { key: "fixtures", label: "Fixtures" },
  { key: "results", label: "Results" },
  { key: "predictions", label: "Predictions" },
];

export default function LeagueTabs({
  standings,
  fixtures,
  results,
}: {
  standings: StandingRow[];
  fixtures: Match[];
  results: Match[];
}) {
  const [tab, setTab] = useState<TabKey>("standings");

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-mono uppercase tracking-wide border whitespace-nowrap transition-colors ${
              tab === t.key
                ? "bg-turf/15 border-turf text-turf"
                : "border-line text-text-dim hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "standings" && (
        standings.length > 0
          ? <StandingsTable rows={standings} />
          : <EmptyState label="standings" />
      )}

      {tab === "fixtures" && (
        fixtures.length > 0
          ? <div className="flex flex-col gap-2">{fixtures.map((m) => <FixtureRow key={m.id} match={m} />)}</div>
          : <EmptyState label="fixtures" />
      )}

      {tab === "results" && (
        results.length > 0
          ? <div className="flex flex-col gap-2">{results.map((m) => <FixtureRow key={m.id} match={m} />)}</div>
          : <EmptyState label="results" />
      )}

      {tab === "predictions" && (
        fixtures.length > 0
          ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fixtures.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          )
          : <EmptyState label="upcoming predictions" />
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-text-dim text-sm font-mono py-10 text-center border border-dashed border-line rounded-card">
      No {label} available right now.
    </p>
  );
}

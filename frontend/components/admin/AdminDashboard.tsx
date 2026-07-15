"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Match, League } from "@/lib/types";
import StatsGrid from "./StatsGrid";
import SyncPanel from "./SyncPanel";
import MatchManager from "./MatchManager";
import LeagueManager from "./LeagueManager";

type TabKey = "overview" | "matches" | "leagues";

type Stats = {
  total_leagues: number; total_teams: number; total_matches: number;
  matches_today: number; api_status: string; last_sync: string;
};
type LogEntry = { time: string; status: string; detail: string };

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [pendingMatchIds, setPendingMatchIds] = useState<Set<string>>(new Set());
  const [pendingLeagueIds, setPendingLeagueIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [s, l, m, leaguesRes] = await Promise.all([
        api.adminStats(),
        api.adminLogs(),
        api.today(false),
        api.leagues({ liveOnly: false }),
      ]);
      setStats(s);
      setLogs(l);
      setMatches(m);
      setLeagues(leaguesRes.countries.flatMap((c) => c.leagues));
      setError(null);
    } catch {
      setError("Can't reach the backend API. Make sure uvicorn is running on the configured host.");
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleSync() {
    setSyncing(true);
    try {
      await api.adminTriggerSync();
      await loadAll();
    } catch {
      setError("Sync request failed.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleToggleFeature(matchId: string, next: boolean) {
    setPendingMatchIds((prev) => new Set(prev).add(matchId));
    try {
      await api.adminFeatureMatch(matchId, next);
      setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, featured: next } : m)));
    } catch {
      setError("Could not update match.");
    } finally {
      setPendingMatchIds((prev) => {
        const copy = new Set(prev);
        copy.delete(matchId);
        return copy;
      });
    }
  }

  async function handleToggleLeague(leagueId: string, next: boolean) {
    setPendingLeagueIds((prev) => new Set(prev).add(leagueId));
    try {
      await api.adminToggleLeague(leagueId, next);
      setLeagues((prev) => prev.map((l) => (l.id === leagueId ? { ...l, popular: next } : l)));
    } catch {
      setError("Could not update league.");
    } finally {
      setPendingLeagueIds((prev) => {
        const copy = new Set(prev);
        copy.delete(leagueId);
        return copy;
      });
    }
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "matches", label: "Manage Matches" },
    { key: "leagues", label: "Manage Leagues" },
  ];

  return (
    <div>
      {error && (
        <div className="rounded-card border border-red/40 bg-red/10 text-red text-sm font-mono px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-mono uppercase tracking-wide border transition-colors ${
              tab === t.key
                ? "bg-turf/15 border-turf text-turf"
                : "border-line text-text-dim hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="flex flex-col gap-6">
          <StatsGrid stats={stats} />
          <SyncPanel logs={logs} syncing={syncing} onSync={handleSync} />
        </div>
      )}

      {tab === "matches" && (
        <MatchManager
          matches={matches}
          onToggleFeature={handleToggleFeature}
          pendingIds={pendingMatchIds}
        />
      )}

      {tab === "leagues" && (
        <LeagueManager
          leagues={leagues}
          onToggle={handleToggleLeague}
          pendingIds={pendingLeagueIds}
        />
      )}
    </div>
  );
}

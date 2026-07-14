import type {
  Match, MatchDetail, StandingRow, League, LeaguesResponse, Cup, CupDetail,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function get<T>(path: string, revalidateSeconds = 60): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status} on ${path}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => get<{ status: string; mode: string }>("/api/health", 0),

  matchesFiltered: (opts: {
    day?: "today" | "tomorrow" | "yesterday";
    status?: "scheduled" | "live" | "finished";
    minConfidence?: number;
    bttsMin?: number;
    over25Min?: number;
  }) => {
    const params = new URLSearchParams();
    if (opts.day) params.set("day", opts.day);
    if (opts.status) params.set("status", opts.status);
    if (opts.minConfidence != null) params.set("min_confidence", String(opts.minConfidence));
    if (opts.bttsMin != null) params.set("btts_min", String(opts.bttsMin));
    if (opts.over25Min != null) params.set("over_2_5_min", String(opts.over25Min));
    const qs = params.toString();
    return get<Match[]>(`/api/matches${qs ? `?${qs}` : ""}`, 0);
  },

  // Leagues
  leagues: (opts?: { country?: string; popularOnly?: boolean }) => {
    const params = new URLSearchParams();
    if (opts?.country) params.set("country", opts.country);
    if (opts?.popularOnly) params.set("popular_only", "true");
    const qs = params.toString();
    return get<LeaguesResponse>(`/api/leagues${qs ? `?${qs}` : ""}`);
  },
  league: (id: string) => get<League>(`/api/leagues/${id}`),
  standings: (id: string) => get<StandingRow[]>(`/api/leagues/${id}/standings`),
  fixtures: (id: string) => get<Match[]>(`/api/leagues/${id}/fixtures`),
  results: (id: string) => get<Match[]>(`/api/leagues/${id}/results`),

  // Matches
  today: () => get<Match[]>("/api/matches/today", 30),
  tomorrow: () => get<Match[]>("/api/matches/tomorrow", 30),
  yesterday: () => get<Match[]>("/api/matches/yesterday", 60),
  live: () => get<Match[]>("/api/matches/live", 15),
  featured: () => get<Match[]>("/api/matches/featured", 60),
  topPredictions: (minConfidence = 85) =>
    get<Match[]>(`/api/matches/top-predictions?min_confidence=${minConfidence}`, 60),
  search: (q: string) => get<Match[]>(`/api/matches/search?q=${encodeURIComponent(q)}`, 0),
  matchDetail: (id: string) => get<MatchDetail>(`/api/matches/${id}`, 30),

  // Cups
  cups: () => get<Cup[]>("/api/cups", 300),
  cupDetail: (id: string) => get<CupDetail>(`/api/cups/${id}`, 60),

  // Admin
  adminStats: () =>
    get<{
      total_leagues: number; total_teams: number; total_matches: number;
      matches_today: number; api_status: string; last_sync: string;
    }>("/api/admin/stats", 0),
  adminLogs: () =>
    get<{ time: string; status: string; detail: string }[]>("/api/admin/logs", 0),
  adminTriggerSync: async () => {
    const res = await fetch(`${API_BASE}/api/admin/sync`, { method: "POST" });
    if (!res.ok) throw new Error("Sync failed");
    return res.json();
  },
  adminFeatureMatch: async (matchId: string, featured: boolean) => {
    const res = await fetch(
      `${API_BASE}/api/admin/matches/${matchId}/feature?featured=${featured}`,
      { method: "POST" },
    );
    if (!res.ok) throw new Error("Update failed");
    return res.json();
  },
  adminToggleLeague: async (leagueId: string, enabled: boolean) => {
    const res = await fetch(
      `${API_BASE}/api/admin/leagues/${leagueId}/toggle?enabled=${enabled}`,
      { method: "POST" },
    );
    if (!res.ok) throw new Error("Update failed");
    return res.json();
  },
};

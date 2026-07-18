import type {
  Match, MatchDetail, StandingRow, League, LeaguesResponse, Cup, CupDetail,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function assertOk<T = unknown>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

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
    liveOnly?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (opts.day) params.set("day", opts.day);
    if (opts.status) params.set("status", opts.status);
    if (opts.minConfidence != null) params.set("min_confidence", String(opts.minConfidence));
    if (opts.bttsMin != null) params.set("btts_min", String(opts.bttsMin));
    if (opts.over25Min != null) params.set("over_2_5_min", String(opts.over25Min));
    params.set("live_only", String(opts.liveOnly ?? true));
    const qs = params.toString();
    return get<Match[]>(`/api/matches${qs ? `?${qs}` : ""}`, 0);
  },

  // Leagues
  leagues: (opts?: { country?: string; popularOnly?: boolean; liveOnly?: boolean }) => {
    const params = new URLSearchParams();
    if (opts?.country) params.set("country", opts.country);
    if (opts?.popularOnly) params.set("popular_only", "true");
    params.set("live_only", String(opts?.liveOnly ?? true));
    const qs = params.toString();
    return get<LeaguesResponse>(`/api/leagues${qs ? `?${qs}` : ""}`);
  },
  league: (id: string) => get<League>(`/api/leagues/${id}`),
  standings: (id: string) => get<StandingRow[]>(`/api/leagues/${id}/standings`),
  fixtures: (id: string) => get<Match[]>(`/api/leagues/${id}/fixtures`),
  results: (id: string) => get<Match[]>(`/api/leagues/${id}/results`),

  // Matches — liveOnly defaults to true (hide leagues that haven't synced real
  // data yet); admin passes liveOnly: false to see everything for management.
  today: (liveOnly = true) => get<Match[]>(`/api/matches/today?live_only=${liveOnly}`, 30),
  tomorrow: (liveOnly = true) => get<Match[]>(`/api/matches/tomorrow?live_only=${liveOnly}`, 30),
  yesterday: (liveOnly = true) => get<Match[]>(`/api/matches/yesterday?live_only=${liveOnly}`, 60),
  live: (liveOnly = true) => get<Match[]>(`/api/matches/live?live_only=${liveOnly}`, 15),
  featured: (liveOnly = true) => get<Match[]>(`/api/matches/featured?live_only=${liveOnly}`, 60),
  topPredictions: (minConfidence = 85, liveOnly = true) =>
    get<Match[]>(`/api/matches/top-predictions?min_confidence=${minConfidence}&live_only=${liveOnly}`, 60),
  search: (q: string, liveOnly = true) =>
    get<Match[]>(`/api/matches/search?q=${encodeURIComponent(q)}&live_only=${liveOnly}`, 0),
  matchDetail: (id: string) => get<MatchDetail>(`/api/matches/${id}`, 30),

  // Cups
  cups: () => get<Cup[]>("/api/cups", 300),
  cupDetail: (id: string) => get<CupDetail>(`/api/cups/${id}`, 60),

  // Admin — every call needs the admin key (set once via the password
  // gate on /admin, stored in sessionStorage, passed in here explicitly
  // rather than read from storage inside lib/api.ts, so this file stays
  // usable from both client and server contexts).
  adminStats: (adminKey: string) =>
    fetch(`${API_BASE}/api/admin/stats`, { headers: { "X-Admin-Key": adminKey } })
      .then((res) => assertOk<{
        total_leagues: number; total_teams: number; total_matches: number;
        matches_today: number; api_status: string; last_sync: string;
      }>(res)),
  adminLogs: (adminKey: string) =>
    fetch(`${API_BASE}/api/admin/logs`, { headers: { "X-Admin-Key": adminKey } })
      .then((res) => assertOk<{ time: string; status: string; detail: string }[]>(res)),
  adminTriggerSync: (adminKey: string) =>
    fetch(`${API_BASE}/api/admin/sync`, { method: "POST", headers: { "X-Admin-Key": adminKey } })
      .then((res) => assertOk<{ ok: boolean; detail: string }>(res)),
  adminFeatureMatch: (matchId: string, featured: boolean, adminKey: string) =>
    fetch(
      `${API_BASE}/api/admin/matches/${matchId}/feature?featured=${featured}`,
      { method: "POST", headers: { "X-Admin-Key": adminKey } },
    ).then((res) => assertOk(res)),
  adminToggleLeague: (leagueId: string, enabled: boolean, adminKey: string) =>
    fetch(
      `${API_BASE}/api/admin/leagues/${leagueId}/toggle?enabled=${enabled}`,
      { method: "POST", headers: { "X-Admin-Key": adminKey } },
    ).then((res) => assertOk(res)),
  // Used only by the password gate itself, to check a key is valid before
  // storing it — hits the cheapest admin route rather than a dedicated one.
  adminCheckKey: (adminKey: string) =>
    fetch(`${API_BASE}/api/admin/stats`, { headers: { "X-Admin-Key": adminKey } }),
};

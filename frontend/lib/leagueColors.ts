// Accent colors per league, chosen to evoke each competition's real branding.
// Used for header banners, card accents, and small UI flourishes — never for
// anything that carries functional meaning (e.g. StandingsTable's green
// qualification-zone stripe stays green everywhere, regardless of league).

export interface LeagueColor {
  primary: string;
  accent: string;
}

const LEAGUE_COLORS: Record<string, LeagueColor> = {
  "premier-league": { primary: "#3D195B", accent: "#E90052" },
  "championship": { primary: "#1B4F72", accent: "#1B4F72" },
  "la-liga": { primary: "#A50044", accent: "#A50044" },
  "serie-a": { primary: "#0066B3", accent: "#0066B3" },
  "bundesliga": { primary: "#D3010C", accent: "#D3010C" },
  "ligue-1": { primary: "#0B4F6C", accent: "#0B4F6C" },
  "eredivisie": { primary: "#FF6C00", accent: "#FF6C00" },
  "primeira-liga": { primary: "#00A650", accent: "#00A650" },
  "brasileirao": { primary: "#009C3B", accent: "#FFCC00" },
  "champions-league": { primary: "#0A1155", accent: "#C0C0C0" },
};

const DEFAULT_COLOR: LeagueColor = { primary: "#1fae6b", accent: "#1fae6b" };

export function getLeagueColor(leagueId: string): LeagueColor {
  return LEAGUE_COLORS[leagueId] ?? DEFAULT_COLOR;
}

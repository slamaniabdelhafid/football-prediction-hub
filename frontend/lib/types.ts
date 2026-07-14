export interface Country {
  name: string;
  code: string;
  flag_emoji: string;
}

export interface League {
  id: string;
  name: string;
  short_name: string;
  country: Country;
  logo: string;
  season: string;
  num_teams: number;
  tier: number;
  popular: boolean;
  data_source: "simulated" | "live";
}

export interface Team {
  id: string;
  name: string;
  short_name: string;
  logo: string;
  league_id: string;
}

export interface StandingRow {
  position: number;
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
  form: string[];
}

export interface Prediction {
  home_win_pct: number;
  draw_pct: number;
  away_win_pct: number;
  confidence_pct: number;
  btts_pct: number;
  over_1_5_pct: number;
  over_2_5_pct: number;
  under_2_5_pct: number;
  double_chance: string;
  predicted_winner: "home" | "away" | "draw" | null;
  note: string | null;
}

export interface MatchStatus {
  kind: "scheduled" | "live" | "finished";
  minute: number | null;
  home_score: number | null;
  away_score: number | null;
}

export interface Match {
  id: string;
  league_id: string;
  home_team: Team;
  away_team: Team;
  kickoff: string;
  stadium: string | null;
  status: MatchStatus;
  prediction: Prediction;
  featured: boolean;
  prediction_correct: boolean | null;
}

export interface HeadToHead {
  date: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
}

export interface TeamStats {
  team: Team;
  league_position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  goal_diff: number;
  avg_goals_per_match: number;
  home_record: string;
  away_record: string;
  last_5: string[];
}

export interface MatchDetail {
  match: Match;
  home_stats: TeamStats;
  away_stats: TeamStats;
  head_to_head: HeadToHead[];
  standings_snapshot: StandingRow[];
}

export interface CountryLeagues {
  country: string;
  flag_emoji: string;
  leagues: League[];
}

export interface LeaguesResponse {
  total: number;
  countries: CountryLeagues[];
}

export interface Cup {
  id: string;
  name: string;
  season: string;
  host: string;
  data_source: "simulated" | "live";
  snapshot_note: string | null;
}

export interface GroupStanding {
  position: number;
  team_name: string;
  qualified: boolean;
  result_note: string;
}

export interface CupGroup {
  name: string;
  standings: GroupStanding[];
}

export interface KnockoutMatch {
  id: string;
  round: string;
  home_team: string | null;
  away_team: string | null;
  home_placeholder: string | null;
  away_placeholder: string | null;
  kickoff: string;
  venue: string | null;
  status: MatchStatus;
  penalty_home: number | null;
  penalty_away: number | null;
  prediction: Prediction | null;
  slot: number;
}

export interface CupDetail {
  cup: Cup;
  groups: CupGroup[];
  knockout: KnockoutMatch[];
}

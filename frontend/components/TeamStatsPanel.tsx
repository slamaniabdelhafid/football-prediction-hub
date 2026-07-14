import type { TeamStats } from "@/lib/types";
import FormDots from "./FormDots";

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-line last:border-b-0">
      <span className="text-text-dim text-sm">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

export default function TeamStatsPanel({ stats }: { stats: TeamStats }) {
  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <h3 className="font-display font-bold text-lg mb-3 truncate">{stats.team.name}</h3>
      <Row label="League Position" value={stats.league_position} />
      <Row label="Matches Played" value={stats.played} />
      <Row label="Wins" value={stats.wins} />
      <Row label="Draws" value={stats.draws} />
      <Row label="Losses" value={stats.losses} />
      <Row label="Goals Scored" value={stats.goals_scored} />
      <Row label="Goals Conceded" value={stats.goals_conceded} />
      <Row label="Goal Difference" value={stats.goal_diff > 0 ? `+${stats.goal_diff}` : stats.goal_diff} />
      <Row label="Avg Goals / Match" value={stats.avg_goals_per_match} />
      <Row label="Home Record (W-D-L)" value={stats.home_record} />
      <Row label="Away Record (W-D-L)" value={stats.away_record} />
      <div className="flex items-center justify-between pt-3">
        <span className="text-text-dim text-sm">Last 5</span>
        <FormDots form={stats.last_5} />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <p className="text-[11px] font-mono text-text-dim uppercase tracking-wide mb-2">{label}</p>
      <p className="font-display font-extrabold text-3xl">{value}</p>
    </div>
  );
}

export default function StatsGrid({
  stats,
}: {
  stats: {
    total_leagues: number; total_teams: number; total_matches: number;
    matches_today: number; api_status: string; last_sync: string;
  } | null;
}) {
  if (!stats) {
    return (
      <p className="text-text-dim text-sm font-mono py-6">Loading dashboard stats…</p>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card label="Total Leagues" value={stats.total_leagues} />
      <Card label="Total Teams" value={stats.total_teams} />
      <Card label="Total Matches" value={stats.total_matches} />
      <Card label="Matches Today" value={stats.matches_today} />
      <Card label="API Status" value={stats.api_status} />
      <Card
        label="Last Sync"
        value={new Date(stats.last_sync).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      />
    </div>
  );
}

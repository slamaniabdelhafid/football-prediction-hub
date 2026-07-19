import Link from "next/link";
import type { League } from "@/lib/types";
import { getLeagueColor } from "@/lib/leagueColors";
import DataSourceBadge from "./DataSourceBadge";

export default function LeagueCard({ league }: { league: League }) {
  const { primary, accent } = getLeagueColor(league.id);
  return (
    <Link
      href={`/leagues/${league.id}`}
      className="flex items-center gap-3 rounded-card border border-line bg-surface hover:bg-surface-2 transition-colors p-4"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <span
        className="flex items-center justify-center w-10 h-10 rounded-full text-xl leading-none shrink-0"
        style={{ background: `${primary}22` }}
      >
        {league.country.flag_emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold text-base truncate">{league.name}</p>
        <p className="text-xs text-text-dim font-mono truncate">
          {league.country.name} · {league.num_teams} clubs
        </p>
      </div>
      <DataSourceBadge source={league.data_source} />
    </Link>
  );
}

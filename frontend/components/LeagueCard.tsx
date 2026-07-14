import Link from "next/link";
import type { League } from "@/lib/types";
import DataSourceBadge from "./DataSourceBadge";

export default function LeagueCard({ league }: { league: League }) {
  return (
    <Link
      href={`/leagues/${league.id}`}
      className="flex items-center gap-3 rounded-card border border-line bg-surface hover:border-turf/50 hover:bg-surface-2 transition-colors p-4"
    >
      <span className="text-2xl leading-none">{league.country.flag_emoji}</span>
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

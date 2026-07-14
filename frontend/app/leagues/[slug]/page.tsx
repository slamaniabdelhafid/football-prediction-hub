import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import LeagueTabs from "@/components/LeagueTabs";
import DataSourceBadge from "@/components/DataSourceBadge";

export default async function LeagueDetailPage({ params }: { params: { slug: string } }) {
  let league;
  try {
    league = await api.league(params.slug);
  } catch {
    notFound();
  }

  const [standings, fixtures, results] = await Promise.all([
    api.standings(params.slug).catch(() => []),
    api.fixtures(params.slug).catch(() => []),
    api.results(params.slug).catch(() => []),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-4xl leading-none">{league.country.flag_emoji}</span>
        <div className="flex-1">
          <p className="text-[11px] font-mono text-turf uppercase tracking-widest">
            {league.country.name}
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight">
            {league.name}
          </h1>
        </div>
        <DataSourceBadge source={league.data_source} />
      </div>
      <p className="text-text-dim font-mono text-sm mb-8">
        Season {league.season} · {league.num_teams} clubs
        {league.data_source === "simulated" && (
          <> — generated fixtures, not a real provider's data. See docs/API_INTEGRATION.md.</>
        )}
      </p>

      <LeagueTabs standings={standings} fixtures={fixtures} results={results} />
    </div>
  );
}

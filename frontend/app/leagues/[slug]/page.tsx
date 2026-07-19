import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getLeagueColor } from "@/lib/leagueColors";
import LeagueTabs from "@/components/LeagueTabs";
import DataSourceBadge from "@/components/DataSourceBadge";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const league = await api.league(params.slug);
    const title = `${league.name} — Standings & Fixtures`;
    const description = `Real ${league.name} table, upcoming fixtures, and results for the ${league.season} season, with statistical match predictions.`;
    return { title, description, openGraph: { title, description }, twitter: { title, description } };
  } catch {
    return { title: "League" };
  }
}

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

  const { primary, accent } = getLeagueColor(league.id);

  return (
    <div>
      <div
        className="border-b border-line"
        style={{
          background: `linear-gradient(135deg, ${primary}33 0%, transparent 70%)`,
          borderBottomColor: `${accent}40`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-4 mb-2">
            <span
              className="flex items-center justify-center w-14 h-14 rounded-full text-3xl leading-none shrink-0"
              style={{ background: `${primary}26`, border: `1.5px solid ${accent}80` }}
            >
              {league.country.flag_emoji}
            </span>
            <div className="flex-1">
              <p
                className="text-[11px] font-mono uppercase tracking-widest"
                style={{ color: accent }}
              >
                {league.country.name}
              </p>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight">
                {league.name}
              </h1>
            </div>
            <DataSourceBadge source={league.data_source} />
          </div>
          <p className="text-text-dim font-mono text-sm">
            Season {league.season} · {league.num_teams} clubs
            {league.data_source === "simulated" && (
              <> — generated fixtures, not a real provider's data. See docs/API_INTEGRATION.md.</>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <LeagueTabs standings={standings} fixtures={fixtures} results={results} />
      </div>
    </div>
  );
}

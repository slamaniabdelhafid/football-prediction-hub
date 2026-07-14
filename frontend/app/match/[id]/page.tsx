import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import PredictionBar from "@/components/PredictionBar";
import AdditionalPredictions from "@/components/AdditionalPredictions";
import TeamStatsPanel from "@/components/TeamStatsPanel";
import HeadToHeadList from "@/components/HeadToHeadList";
import StandingsTable from "@/components/StandingsTable";

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString([], {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  let detail;
  try {
    detail = await api.matchDetail(params.id);
  } catch {
    notFound();
  }

  const { match, home_stats, away_stats, head_to_head, standings_snapshot } = detail;
  const { status } = match;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Match header */}
      <div className="text-center mb-10">
        <p className="text-[11px] font-mono text-turf uppercase tracking-widest mb-2">
          {match.league_id.replace(/-/g, " ")} · {formatKickoff(match.kickoff)}
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-right truncate">
            {match.home_team.name}
          </h1>
          <div className="font-mono text-2xl sm:text-3xl text-text-dim shrink-0">
            {status.kind === "scheduled" ? (
              "VS"
            ) : (
              <span className="text-text font-semibold">
                {status.home_score} – {status.away_score}
              </span>
            )}
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-left truncate">
            {match.away_team.name}
          </h1>
        </div>
        <p className="text-text-dim text-sm mt-3 font-mono">
          {match.stadium}
          {status.kind === "live" && (
            <span className="ml-3 text-red">
              <span className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-red mr-1" />
              LIVE — {status.minute}&apos;
            </span>
          )}
          {status.kind === "finished" && <span className="ml-3">Full Time</span>}
        </p>
      </div>

      {/* Prediction section */}
      <section className="mb-10">
        <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-4">
          Match Prediction
        </h2>
        <div className="rounded-card border border-line bg-surface p-6 mb-5">
          <PredictionBar prediction={match.prediction} />
        </div>
        <AdditionalPredictions prediction={match.prediction} />
      </section>

      {/* Team statistics */}
      <section className="mb-10">
        <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-4">
          Team Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TeamStatsPanel stats={home_stats} />
          <TeamStatsPanel stats={away_stats} />
        </div>
      </section>

      {/* Head to head */}
      <section className="mb-10">
        <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-4">
          Head-to-Head
        </h2>
        <HeadToHeadList meetings={head_to_head} />
      </section>

      {/* League table */}
      <section>
        <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-4">
          League Table
        </h2>
        <StandingsTable rows={standings_snapshot} />
      </section>
    </div>
  );
}

import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import PredictionBar from "@/components/PredictionBar";
import AdditionalPredictions from "@/components/AdditionalPredictions";

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString([], {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function CupMatchPage({
  params,
}: {
  params: { id: string; matchId: string };
}) {
  let detail;
  try {
    detail = await api.cupDetail(params.id);
  } catch {
    notFound();
  }

  const match = detail.knockout.find((m) => m.id === params.matchId);
  if (!match) notFound();

  const home = match.home_team ?? match.home_placeholder ?? "TBD";
  const away = match.away_team ?? match.away_placeholder ?? "TBD";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <p className="text-[11px] font-mono text-gold uppercase tracking-widest mb-2">
          {detail.cup.name} · {match.round} · {formatKickoff(match.kickoff)}
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-right truncate">
            {home}
          </h1>
          <div className="font-mono text-2xl sm:text-3xl text-text-dim shrink-0">VS</div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-left truncate">
            {away}
          </h1>
        </div>
        {match.venue && <p className="text-text-dim text-sm mt-3 font-mono">{match.venue}</p>}
      </div>

      {match.prediction ? (
        <section>
          <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-4">
            Match Prediction
          </h2>
          <div className="rounded-card border border-gold/25 bg-surface p-6 mb-3">
            <PredictionBar prediction={match.prediction} />
          </div>
          {match.prediction.note && (
            <p className="text-xs font-mono text-text-dim mb-5">{match.prediction.note}</p>
          )}
          <AdditionalPredictions prediction={match.prediction} />
        </section>
      ) : (
        <p className="text-text-dim text-sm font-mono py-10 text-center border border-dashed border-line rounded-card">
          Prediction not available yet — teams for this match aren&apos;t decided.
        </p>
      )}
    </div>
  );
}

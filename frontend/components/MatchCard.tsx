import Link from "next/link";
import type { Match } from "@/lib/types";
import { getLeagueColor } from "@/lib/leagueColors";
import PredictionBar from "./PredictionBar";

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MatchCard({ match, featured = false }: { match: Match; featured?: boolean }) {
  const { status } = match;
  const { accent } = getLeagueColor(match.league_id);

  return (
    <Link
      href={`/match/${match.id}`}
      className={`block rounded-card border border-line bg-surface hover:bg-surface-2 hover:border-turf/50 transition-colors p-4 ${
        featured ? "sm:p-6" : ""
      }`}
      style={{ borderTopWidth: 2, borderTopColor: `${accent}80` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[11px] font-mono uppercase tracking-wide truncate font-semibold"
          style={{ color: accent }}
        >
          {match.league_id.replace(/-/g, " ")}
        </span>
        {status.kind === "live" ? (
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-red uppercase">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-red inline-block" />
            Live {status.minute}&apos;
          </span>
        ) : status.kind === "finished" ? (
          <span className="text-[11px] font-mono text-text-dim uppercase">Full Time</span>
        ) : (
          <span className="text-[11px] font-mono text-text-dim">{formatKickoff(match.kickoff)}</span>
        )}
      </div>

      <div className={`flex items-center justify-between gap-3 mb-4 ${featured ? "text-xl" : "text-base"}`}>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold truncate">{match.home_team.name}</p>
        </div>
        <div className="font-mono text-text-dim shrink-0">
          {status.kind === "scheduled" ? (
            "vs"
          ) : (
            <span className="text-text font-semibold">
              {status.home_score} – {status.away_score}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 text-right">
          <p className="font-display font-bold truncate">{match.away_team.name}</p>
        </div>
      </div>

      <PredictionBar prediction={match.prediction} />
    </Link>
  );
}

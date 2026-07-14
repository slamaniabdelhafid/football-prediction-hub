import Link from "next/link";
import type { KnockoutMatch } from "@/lib/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function BracketMatchCard({ match, cupId }: { match: KnockoutMatch; cupId: string }) {
  const home = match.home_team ?? match.home_placeholder ?? "TBD";
  const away = match.away_team ?? match.away_placeholder ?? "TBD";
  const decided = match.status.kind === "finished";
  const homeWon =
    decided &&
    ((match.status.home_score ?? 0) > (match.status.away_score ?? 0) ||
      (match.penalty_home !== null && match.penalty_home! > (match.penalty_away ?? 0)));
  const awayWon =
    decided &&
    ((match.status.away_score ?? 0) > (match.status.home_score ?? 0) ||
      (match.penalty_away !== null && match.penalty_away! > (match.penalty_home ?? 0)));

  const content = (
    <div className="w-56 shrink-0 rounded-card border border-gold/25 bg-surface overflow-hidden">
      <div className={`flex items-center justify-between px-3 py-2 ${homeWon ? "bg-gold/10" : ""}`}>
        <span className={`truncate text-sm ${homeWon ? "text-gold font-semibold" : "text-text"}`}>
          {home}
        </span>
        <span className="font-mono text-sm shrink-0 pl-2">
          {decided ? match.status.home_score : ""}
        </span>
      </div>
      <div className="h-px bg-line" />
      <div className={`flex items-center justify-between px-3 py-2 ${awayWon ? "bg-gold/10" : ""}`}>
        <span className={`truncate text-sm ${awayWon ? "text-gold font-semibold" : "text-text"}`}>
          {away}
        </span>
        <span className="font-mono text-sm shrink-0 pl-2">
          {decided ? match.status.away_score : ""}
        </span>
      </div>
      {match.penalty_home !== null && (
        <p className="text-[10px] font-mono text-text-dim text-center py-1 border-t border-line">
          Pens {match.penalty_home}–{match.penalty_away}
        </p>
      )}
      {!decided && (
        <p className="text-[10px] font-mono text-text-dim text-center py-1 border-t border-line">
          {formatDate(match.kickoff)}
          {match.venue ? ` · ${match.venue.split(",")[0]}` : ""}
        </p>
      )}
    </div>
  );

  if (match.status.kind === "scheduled" && match.home_team && match.away_team) {
    return (
      <Link href={`/cups/${cupId}/match/${match.id}`} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }
  return content;
}

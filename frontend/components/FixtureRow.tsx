import Link from "next/link";
import type { Match } from "@/lib/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function FixtureRow({ match }: { match: Match }) {
  const { status } = match;
  return (
    <Link
      href={`/match/${match.id}`}
      className="flex items-center gap-4 px-4 py-3 rounded-card border border-line bg-surface hover:border-turf/50 hover:bg-surface-2 transition-colors"
    >
      <div className="w-24 shrink-0 text-[11px] font-mono text-text-dim">
        {formatDate(match.kickoff)}
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
        <span className="truncate font-medium text-right flex-1">{match.home_team.name}</span>
        <span className="shrink-0 font-mono text-sm px-2">
          {status.kind === "finished"
            ? `${status.home_score} – ${status.away_score}`
            : status.kind === "live"
              ? `${status.home_score} – ${status.away_score}`
              : "vs"}
        </span>
        <span className="truncate font-medium flex-1">{match.away_team.name}</span>
      </div>
      <div className="w-16 shrink-0 text-right text-[11px] font-mono text-text-dim">
        {status.kind === "scheduled" ? formatTime(match.kickoff) : status.kind === "live" ? (
          <span className="text-red">{status.minute}&apos;</span>
        ) : (
          "FT"
        )}
      </div>
    </Link>
  );
}

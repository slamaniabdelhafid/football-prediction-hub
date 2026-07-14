import type { HeadToHead } from "@/lib/types";

export default function HeadToHeadList({ meetings }: { meetings: HeadToHead[] }) {
  if (meetings.length === 0) {
    return (
      <p className="text-text-dim text-sm font-mono py-6 text-center border border-dashed border-line rounded-card">
        No previous meetings on record.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {meetings.map((m, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-3 rounded-card border border-line bg-surface"
        >
          <span className="text-[11px] font-mono text-text-dim w-24 shrink-0">
            {new Date(m.date).toLocaleDateString([], { year: "numeric", month: "short" })}
          </span>
          <div className="flex-1 flex items-center justify-between gap-3">
            <span className="truncate font-medium text-right flex-1">{m.home_team}</span>
            <span className="font-mono text-sm px-2 shrink-0">
              {m.home_score} – {m.away_score}
            </span>
            <span className="truncate font-medium flex-1">{m.away_team}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

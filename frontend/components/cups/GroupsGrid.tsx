import type { CupGroup } from "@/lib/types";

const NOTE_COLOR: Record<string, string> = {
  Winner: "text-gold",
  "Runner-up": "text-gold",
  "Best Third": "text-turf",
};

export default function GroupsGrid({ groups }: { groups: CupGroup[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((g) => (
        <div key={g.name} className="rounded-card border border-line bg-surface p-4">
          <p className="font-display font-bold text-sm uppercase tracking-wide text-gold mb-3">
            {g.name}
          </p>
          <div className="flex flex-col gap-1.5">
            {g.standings.map((s) => (
              <div key={s.team_name} className="flex items-center justify-between gap-2">
                <span className={`text-sm truncate ${s.qualified ? "text-text font-medium" : "text-text-dim"}`}>
                  {s.team_name}
                </span>
                <span
                  className={`text-[10px] font-mono uppercase shrink-0 ${
                    NOTE_COLOR[s.result_note] ?? "text-text-dim"
                  }`}
                >
                  {s.result_note}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

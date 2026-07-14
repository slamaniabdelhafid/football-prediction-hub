import Link from "next/link";
import type { StandingRow } from "@/lib/types";

const FORM_COLOR: Record<string, string> = {
  W: "bg-turf",
  D: "bg-amber",
  L: "bg-red",
};

export default function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="overflow-x-auto rounded-card border border-line">
      <table className="w-full text-sm border-collapse min-w-[640px]">
        <thead>
          <tr className="text-left text-text-dim font-mono text-[11px] uppercase tracking-wide border-b border-line">
            <th className="px-3 py-3 w-8">#</th>
            <th className="px-3 py-3">Club</th>
            <th className="px-3 py-3 text-center">P</th>
            <th className="px-3 py-3 text-center">W</th>
            <th className="px-3 py-3 text-center">D</th>
            <th className="px-3 py-3 text-center">L</th>
            <th className="px-3 py-3 text-center">GF</th>
            <th className="px-3 py-3 text-center">GA</th>
            <th className="px-3 py-3 text-center">GD</th>
            <th className="px-3 py-3 text-center">Pts</th>
            <th className="px-3 py-3">Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.team.id}
              className={`border-b border-line last:border-b-0 hover:bg-surface-2 transition-colors ${
                i < 4 ? "border-l-2 border-l-turf" : ""
              }`}
            >
              <td className="px-3 py-2.5 font-mono text-text-dim">{r.position}</td>
              <td className="px-3 py-2.5 font-medium truncate max-w-[180px]">{r.team.name}</td>
              <td className="px-3 py-2.5 text-center font-mono">{r.played}</td>
              <td className="px-3 py-2.5 text-center font-mono">{r.wins}</td>
              <td className="px-3 py-2.5 text-center font-mono">{r.draws}</td>
              <td className="px-3 py-2.5 text-center font-mono">{r.losses}</td>
              <td className="px-3 py-2.5 text-center font-mono">{r.goals_for}</td>
              <td className="px-3 py-2.5 text-center font-mono">{r.goals_against}</td>
              <td className="px-3 py-2.5 text-center font-mono">
                {r.goal_diff > 0 ? `+${r.goal_diff}` : r.goal_diff}
              </td>
              <td className="px-3 py-2.5 text-center font-mono font-semibold text-text">
                {r.points}
              </td>
              <td className="px-3 py-2.5">
                <div className="flex gap-1">
                  {r.form.map((f, idx) => (
                    <span
                      key={idx}
                      className={`w-4 h-4 rounded-full text-[9px] font-mono flex items-center justify-center text-bg font-bold ${FORM_COLOR[f]}`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

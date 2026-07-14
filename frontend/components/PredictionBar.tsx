import type { Prediction } from "@/lib/types";

export default function PredictionBar({ prediction }: { prediction: Prediction }) {
  const { home_win_pct, draw_pct, away_win_pct, confidence_pct } = prediction;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-mono text-text-dim uppercase tracking-wide">
          Confidence
        </span>
        <span className="text-[11px] font-mono text-amber font-semibold">
          {Math.min(confidence_pct, 99)}%
        </span>
      </div>

      <div className="flex h-2 w-full rounded-full overflow-hidden bg-surface-2">
        <div
          className="pred-bar-segment bg-turf"
          style={{ width: `${home_win_pct}%` }}
          title={`Home Win ${home_win_pct}%`}
        />
        <div
          className="pred-bar-segment bg-amber"
          style={{ width: `${draw_pct}%` }}
          title={`Draw ${draw_pct}%`}
        />
        <div
          className="pred-bar-segment bg-red"
          style={{ width: `${away_win_pct}%` }}
          title={`Away Win ${away_win_pct}%`}
        />
      </div>

      <div className="flex justify-between mt-1.5 text-[11px] font-mono">
        <span className="text-turf">{home_win_pct}%</span>
        <span className="text-amber">{draw_pct}%</span>
        <span className="text-red">{away_win_pct}%</span>
      </div>
      <div className="flex justify-between text-[10px] text-text-dim uppercase tracking-wide">
        <span>Home</span>
        <span>Draw</span>
        <span>Away</span>
      </div>
    </div>
  );
}

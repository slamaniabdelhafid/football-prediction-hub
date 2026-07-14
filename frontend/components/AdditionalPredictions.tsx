import type { Prediction } from "@/lib/types";

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3 text-center">
      <p className="text-[10px] font-mono text-text-dim uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display font-extrabold text-xl text-amber">{value}</p>
    </div>
  );
}

export default function AdditionalPredictions({ prediction }: { prediction: Prediction }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <StatChip label="Both Teams To Score" value={`${prediction.btts_pct}%`} />
      <StatChip label="Over 1.5 Goals" value={`${prediction.over_1_5_pct}%`} />
      <StatChip label="Over 2.5 Goals" value={`${prediction.over_2_5_pct}%`} />
      <StatChip label="Under 2.5 Goals" value={`${prediction.under_2_5_pct}%`} />
      <StatChip label="Double Chance" value={prediction.double_chance} />
      <StatChip label="Confidence" value={`${Math.min(prediction.confidence_pct, 99)}%`} />
    </div>
  );
}

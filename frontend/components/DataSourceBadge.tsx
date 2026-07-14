export default function DataSourceBadge({ source }: { source: "live" | "simulated" }) {
  if (source === "live") {
    return (
      <span className="text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-turf/15 text-turf shrink-0">
        Live
      </span>
    );
  }
  return (
    <span className="text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-surface-2 text-text-dim shrink-0">
      Simulated
    </span>
  );
}

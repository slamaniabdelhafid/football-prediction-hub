import type { Match } from "@/lib/types";
import PredictionBar from "./PredictionBar";

export default function Hero({ marquee }: { marquee: Match | null }) {
  return (
    <section className="border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
        <div>
          <p className="text-[11px] font-mono text-turf uppercase tracking-widest mb-3">
            Daily fixtures · Live standings · Match probabilities
          </p>
          <h1 className="font-display font-extrabold uppercase leading-[0.95] text-5xl sm:text-6xl lg:text-7xl tracking-tight">
            Know the odds
            <br />
            before kickoff.
          </h1>
          <p className="text-text-dim mt-5 max-w-lg text-base sm:text-lg">
            Fixtures, results, standings, and statistical match predictions across{" "}
            <span className="text-text font-medium">every major league in the world</span> 
            updated every day.
          </p>
        </div>

        {marquee && (
          <div className="rounded-card border border-line bg-surface p-6">
            <p className="text-[11px] font-mono text-amber uppercase tracking-widest mb-4">
              Today&apos;s marquee match
            </p>
            <div className="flex items-center justify-between text-2xl font-display font-bold mb-6">
              <span className="truncate">{marquee.home_team.name}</span>
              <span className="text-text-dim font-mono text-base shrink-0 px-3">vs</span>
              <span className="truncate text-right">{marquee.away_team.name}</span>
            </div>
            <PredictionBar prediction={marquee.prediction} />
          </div>
        )}
      </div>
    </section>
  );
}

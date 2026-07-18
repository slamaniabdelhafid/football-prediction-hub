import type { Metadata } from "next";
import { api } from "@/lib/api";
import CupCard from "@/components/cups/CupCard";

export const metadata: Metadata = {
  title: "Cup Competitions — World Cup Bracket & Predictions",
  description:
    "Live knockout bracket, group standings, and match predictions for the FIFA World Cup 2026.",
};

export default async function CupsPage() {
  const cups = await api.cups().catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-[11px] font-mono text-gold uppercase tracking-widest mb-1">
        International tournaments
      </p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight mb-8">
        Cup Competitions
      </h1>

      {cups.length === 0 ? (
        <p className="text-text-dim text-sm font-mono py-10 text-center border border-dashed border-line rounded-card">
          Can&apos;t reach the backend API right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cups.map((c) => (
            <CupCard key={c.id} cup={c} />
          ))}
        </div>
      )}
    </div>
  );
}

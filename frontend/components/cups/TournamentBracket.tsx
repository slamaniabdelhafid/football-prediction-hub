import type { KnockoutMatch } from "@/lib/types";
import BracketMatchCard from "./BracketMatchCard";

const ROUND_ORDER = ["Round of 32", "Round of 16", "Quarterfinal", "Semifinal", "Final"];

export default function TournamentBracket({
  matches,
  cupId,
}: {
  matches: KnockoutMatch[];
  cupId: string;
}) {
  const rounds = ROUND_ORDER.filter((r) => matches.some((m) => m.round === r));
  const thirdPlace = matches.find((m) => m.round === "Third Place");

  return (
    <div>
      <div className="flex gap-8 overflow-x-auto pb-6">
        {rounds.map((round, roundIdx) => {
          const roundMatches = matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.slot - b.slot);
          // Gap scales with round depth to visually approximate bracket merging
          const gapClass = ["gap-4", "gap-10", "gap-24", "gap-40"][roundIdx] ?? "gap-4";

          return (
            <div key={round} className="flex flex-col shrink-0">
              <p className="text-[11px] font-mono text-gold uppercase tracking-widest mb-4 text-center">
                {round}
              </p>
              <div className={`flex flex-col justify-around flex-1 ${gapClass}`}>
                {roundMatches.map((m) => (
                  <BracketMatchCard key={m.id} match={m} cupId={cupId} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {thirdPlace && (
        <div className="mt-4 pt-6 border-t border-line max-w-xs">
          <p className="text-[11px] font-mono text-gold uppercase tracking-widest mb-3">
            Third Place
          </p>
          <BracketMatchCard match={thirdPlace} cupId={cupId} />
        </div>
      )}
    </div>
  );
}

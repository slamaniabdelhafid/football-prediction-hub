import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import TournamentBracket from "@/components/cups/TournamentBracket";
import GroupsGrid from "@/components/cups/GroupsGrid";

export default async function CupDetailPage({ params }: { params: { id: string } }) {
  let detail;
  try {
    detail = await api.cupDetail(params.id);
  } catch {
    notFound();
  }

  const { cup, groups, knockout } = detail;

  return (
    <div>
      {/* Gold-toned header, distinct from the league scoreboard motif */}
      <div className="border-b border-gold/20 bg-gradient-to-b from-gold/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-[11px] font-mono text-gold uppercase tracking-widest mb-2">
            {cup.season} · {cup.host}
          </p>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl uppercase tracking-tight mb-3">
            🏆 {cup.name}
          </h1>
          {cup.snapshot_note && (
            <p className="text-text-dim font-mono text-xs">{cup.snapshot_note}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <section className="mb-12">
          <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-5">
            Knockout Bracket
          </h2>
          <TournamentBracket matches={knockout} cupId={cup.id} />
        </section>

        <section>
          <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-5">
            Group Stage
          </h2>
          <GroupsGrid groups={groups} />
        </section>
      </div>
    </div>
  );
}

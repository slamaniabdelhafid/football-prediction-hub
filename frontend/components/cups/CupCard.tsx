import Link from "next/link";
import type { Cup } from "@/lib/types";

export default function CupCard({ cup }: { cup: Cup }) {
  return (
    <Link
      href={`/cups/${cup.id}`}
      className="block rounded-card border border-gold/30 bg-gradient-to-br from-surface to-surface-2 p-6 hover:border-gold/60 transition-colors relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 text-8xl opacity-10 select-none">🏆</div>
      <p className="text-[11px] font-mono text-gold uppercase tracking-widest mb-2">
        {cup.season} · {cup.host}
      </p>
      <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight mb-3">
        {cup.name}
      </h3>
      {cup.snapshot_note && (
        <p className="text-xs text-text-dim font-mono">{cup.snapshot_note}</p>
      )}
    </Link>
  );
}

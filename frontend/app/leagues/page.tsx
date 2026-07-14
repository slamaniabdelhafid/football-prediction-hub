import { api } from "@/lib/api";
import LeagueCard from "@/components/LeagueCard";

export default async function LeaguesPage() {
  const data = await api.leagues().catch(() => ({ total: 0, countries: [] }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-[11px] font-mono text-turf uppercase tracking-widest mb-1">
        {data.total} competitions worldwide
      </p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight mb-8">
        Leagues
      </h1>

      {data.countries.length === 0 ? (
        <p className="text-text-dim text-sm font-mono py-10 text-center border border-dashed border-line rounded-card">
          Can&apos;t reach the backend API right now.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {data.countries.map((c) => (
            <div key={c.country}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl leading-none">{c.flag_emoji}</span>
                <h2 className="font-display font-bold text-xl uppercase tracking-tight">
                  {c.country}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {c.leagues.map((l) => (
                  <LeagueCard key={l.id} league={l} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

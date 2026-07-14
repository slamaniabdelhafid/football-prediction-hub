import { api } from "@/lib/api";
import type { Match, League } from "@/lib/types";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import MatchCard from "@/components/MatchCard";
import MatchesTabs from "@/components/MatchesTabs";
import LeagueCard from "@/components/LeagueCard";
import CupCard from "@/components/cups/CupCard";

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [featured, today, tomorrow, yesterday, topPredictions, leaguesRes, cups] = await Promise.all([
    safe<Match[]>(api.featured(), []),
    safe<Match[]>(api.today(), []),
    safe<Match[]>(api.tomorrow(), []),
    safe<Match[]>(api.yesterday(), []),
    safe<Match[]>(api.topPredictions(85), []),
    safe(api.leagues({ popularOnly: true }), { total: 0, countries: [] }),
    safe(api.cups(), []),
  ]);

  const popularLeagues: League[] = leaguesRes.countries.flatMap((c) => c.leagues);
  const marquee = featured[0] ?? today[0] ?? null;
  const apiUnreachable = !marquee && today.length === 0 && popularLeagues.length === 0;

  return (
    <>
      <Hero marquee={marquee} />

      {apiUnreachable && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
          <div className="rounded-card border border-amber/40 bg-amber/10 text-amber text-sm font-mono px-4 py-3">
            Can&apos;t reach the backend API at NEXT_PUBLIC_API_BASE. Run{" "}
            <code>uvicorn main:app --reload</code> in <code>backend/</code>, then reload.
          </div>
        </div>
      )}

      {cups.length > 0 && (
        <Section eyebrow="Happening now" title="Cup Competitions" viewAllHref="/cups">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {cups.map((c) => (
              <CupCard key={c.id} cup={c} />
            ))}
          </div>
        </Section>
      )}

      {featured.length > 0 && (
        <Section eyebrow="Don't miss" title="Featured Matches">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {featured.slice(0, 4).map((m) => (
              <MatchCard key={m.id} match={m} featured />
            ))}
          </div>
        </Section>
      )}

      <Section title="Fixtures &amp; Results">
        <MatchesTabs today={today} tomorrow={tomorrow} yesterday={yesterday} />
      </Section>

      {topPredictions.length > 0 && (
        <Section id="top-predictions" eyebrow="85%+ confidence" title="Top Predictions Today">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPredictions.slice(0, 6).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </Section>
      )}

      {popularLeagues.length > 0 && (
        <Section eyebrow="Browse by competition" title="Popular Leagues" viewAllHref="/leagues">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {popularLeagues.slice(0, 12).map((l) => (
              <LeagueCard key={l.id} league={l} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

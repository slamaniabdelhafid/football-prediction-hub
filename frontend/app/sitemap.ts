import type { MetadataRoute } from "next";
import { api } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/leagues`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/matches`, changeFrequency: "hourly", priority: 0.9 },
  ];

  // Only include pages backed by real data — a mock/simulated league or
  // match page isn't something we want Google indexing and sending
  // searchers to, since it wouldn't show real content.
  let leagueRoutes: MetadataRoute.Sitemap = [];
  let matchRoutes: MetadataRoute.Sitemap = [];

  try {
    const leaguesData = await api.leagues({ liveOnly: true });
    leagueRoutes = leaguesData.countries
      .flatMap((c) => c.leagues)
      .map((l) => ({
        url: `${SITE_URL}/leagues/${l.id}`,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));
  } catch {
    // backend unreachable at build time — sitemap just skips these, not fatal
  }

  try {
    const matches = await api.matchesFiltered({ liveOnly: true });
    matchRoutes = matches.map((m) => ({
      url: `${SITE_URL}/match/${m.id}`,
      changeFrequency: "hourly" as const,
      priority: 0.6,
      lastModified: m.kickoff,
    }));
  } catch {
    // same as above
  }

  return [...staticRoutes, ...leagueRoutes, ...matchRoutes];
}

import type { Metadata } from "next";
import MatchesClient from "@/components/MatchesClient";

export const metadata: Metadata = {
  title: "All Matches — Fixtures, Live Scores & Predictions",
  description:
    "Browse today's, tomorrow's, and yesterday's real football matches with statistical predictions, filterable by confidence, BTTS, and over 2.5 goals.",
};

export default function MatchesPage() {
  return <MatchesClient />;
}

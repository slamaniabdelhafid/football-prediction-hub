import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Set NEXT_PUBLIC_SITE_URL on Netlify once you have a real domain (or the
// netlify.app URL) — used to build absolute URLs for OG images, canonical
// links, and the sitemap. Falls back to localhost so local dev still works.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Football Prediction Hub — Real Fixtures, Standings & Match Predictions",
    template: "%s | Football Prediction Hub",
  },
  description:
    "Daily fixtures, standings, stats, and statistical match prediction probabilities across the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and more.",
  openGraph: {
    type: "website",
    siteName: "Football Prediction Hub",
    title: "Football Prediction Hub — Real Fixtures, Standings & Match Predictions",
    description:
      "Daily fixtures, standings, stats, and statistical match prediction probabilities across major football leagues.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Football Prediction Hub",
    description: "Real fixtures, standings, and statistical match predictions.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-bg text-text min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

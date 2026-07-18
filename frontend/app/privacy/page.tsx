import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 prose-sm">
      <h1 className="font-display font-extrabold text-3xl uppercase tracking-tight mb-6">
        Privacy Policy
      </h1>
      <p className="text-text-dim text-sm font-mono mb-8">Last updated: [DATE]</p>

      <div className="space-y-6 text-text-dim text-sm leading-relaxed">
        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">What this site is</h2>
          <p>
            Football Prediction Hub ("we", "the site") publishes football fixtures, standings,
            and statistically generated match prediction probabilities. It is not a betting site
            and does not accept wagers.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">Information we collect</h2>
          <p>
            We do not require an account to use this site and do not collect names, emails, or
            other personal information directly. Like most websites, our hosting providers
            (Netlify for the frontend, Render for the backend) automatically log standard
            technical data such as IP address, browser type, and pages visited, for security and
            operational purposes.
          </p>
          <p className="mt-2">
            [If you add Google Analytics, AdSense, or any other third-party script, describe it
            here — what it collects, and link to that provider's own privacy policy. Each of
            those services sets its own cookies and is a separate data controller.]
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">Cookies</h2>
          <p>
            [Update this section to match reality once ads/analytics are added. If none are
            active yet, it's fine to state that plainly: "This site does not currently use
            tracking or advertising cookies."]
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">Third-party data</h2>
          <p>
            Match, standings, and fixture data is sourced from{" "}
            <a href="https://www.football-data.org" className="text-turf underline">football-data.org</a>{" "}
            under their terms of use. Prediction probabilities are calculated by us from that
            data using a statistical model — they are not sourced from or endorsed by any
            football league, club, or data provider.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">Children's privacy</h2>
          <p>This site is not directed at children under 13 and does not knowingly collect data from them.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">Changes to this policy</h2>
          <p>We may update this page as the site changes. Continued use of the site after changes means you accept the current version.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">Contact</h2>
          <p>[Add a contact email here.]</p>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 prose-sm">
      <h1 className="font-display font-extrabold text-3xl uppercase tracking-tight mb-6">
        Terms of Use
      </h1>
      <p className="text-text-dim text-sm font-mono mb-8">Last updated: [DATE]</p>

      <div className="space-y-6 text-text-dim text-sm leading-relaxed">
        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">Not a betting service</h2>
          <p>
            Football Prediction Hub provides statistically generated match prediction
            probabilities for informational and entertainment purposes only. We do not accept
            bets, are not a bookmaker, and are not affiliated with any betting operator. Nothing
            on this site is betting or financial advice.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">No guarantee of accuracy</h2>
          <p>
            Predictions are statistical estimates based on current form, standings, and goal
            data — not guarantees of any match outcome. Match data is sourced from third-party
            providers and, while we aim for accuracy, we don't guarantee fixtures, scores, or
            standings are error-free or fully up to date at every moment.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">Acceptable use</h2>
          <p>
            Don't use this site to scrape, resell, or redistribute data in violation of our
            upstream data provider's terms, attempt to disrupt the service, or use it for any
            unlawful purpose.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">Third-party links and content</h2>
          <p>
            This site may link to or rely on third-party services (data providers, hosting,
            analytics, advertising). We aren't responsible for the content, accuracy, or
            practices of those third parties.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">Changes</h2>
          <p>We may update these terms as the site changes. Continued use after changes means you accept the current version.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">Contact</h2>
          <p>[Add a contact email here.]</p>
        </section>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-line mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-display font-extrabold text-lg uppercase tracking-tight">
            Football<span className="text-turf">Prediction</span>Hub
          </div>
          <p className="text-text-dim text-sm mt-1 max-w-md">
            Fixtures, standings, stats, and prediction probabilities — not a betting site.
          </p>
          <div className="flex gap-4 mt-3">
            <a href="/privacy" className="text-text-dim text-xs font-mono hover:text-text underline">
              Privacy Policy
            </a>
            <a href="/terms" className="text-text-dim text-xs font-mono hover:text-text underline">
              Terms of Use
            </a>
          </div>
        </div>
        <p className="text-text-dim text-xs font-mono">
          Data refreshes daily · Predictions are statistical estimates, not guarantees
        </p>
      </div>
    </footer>
  );
}

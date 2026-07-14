import Link from "next/link";

export default function Section({
  id,
  eyebrow,
  title,
  viewAllHref,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  viewAllHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="max-w-7xl mx-auto px-4 sm:px-6 py-10 scroll-mt-20">
      <div className="flex items-end justify-between mb-5">
        <div>
          {eyebrow && (
            <p className="text-[11px] font-mono text-turf uppercase tracking-widest mb-1">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight">
            {title}
          </h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-mono text-text-dim hover:text-turf transition-colors shrink-0"
          >
            View all →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

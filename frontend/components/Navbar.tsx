"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import SearchBox from "./SearchBox";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/leagues", label: "Leagues" },
  { href: "/matches", label: "Matches" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-turf" />
          <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight uppercase">
            Football<span className="text-turf">Prediction</span>Hub
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-mono text-sm">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`pb-1 border-b-2 transition-colors ${
                  active
                    ? "border-turf text-text"
                    : "border-transparent text-text-dim hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block flex-1 max-w-xs">
          <SearchBox />
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-line text-text-dim hover:text-text hover:border-turf transition-colors"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-bg px-4 sm:px-6 py-4 flex flex-col gap-4">
          <SearchBox />
          <nav className="flex flex-col gap-1 font-mono text-sm">
            {LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`py-2 border-b border-line last:border-b-0 ${
                    active ? "text-turf" : "text-text-dim"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Match } from "@/lib/types";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Match[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const r = await api.search(query.trim());
        setResults(r);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={boxRef} className="relative w-full max-w-xs">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search team, league, match…"
        className="w-full bg-surface-2 border border-line rounded-full px-4 py-1.5 text-sm placeholder:text-text-dim focus:outline-none focus:border-turf transition-colors"
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-card border border-line bg-surface shadow-xl z-50">
          {loading ? (
            <p className="text-text-dim text-xs font-mono p-4">Searching…</p>
          ) : results.length === 0 ? (
            <p className="text-text-dim text-xs font-mono p-4">No matches found for &quot;{query}&quot;.</p>
          ) : (
            results.map((m) => (
              <Link
                key={m.id}
                href={`/match/${m.id}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 border-b border-line last:border-b-0 hover:bg-surface-2 transition-colors"
              >
                <p className="text-sm font-medium truncate">
                  {m.home_team.name} vs {m.away_team.name}
                </p>
                <p className="text-[11px] font-mono text-text-dim truncate">
                  {m.league_id.replace(/-/g, " ")}
                </p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const PUNS = [
  "Warming up the pitch…",
  "Lacing up the boots…",
  "Checking the offside line…",
  "Passing the data down the wing…",
  "Waiting on VAR…",
  "Taking a hydration break…",
];

export default function LoadingScreen({ coldStartNote = false }: { coldStartNote?: boolean }) {
  const [punIndex, setPunIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPunIndex((i) => (i + 1) % PUNS.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center px-4">
      <div className="relative w-16 h-20">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-10 h-10 animate-fph-bounce">
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <circle cx="20" cy="20" r="18" fill="var(--surface-2)" stroke="var(--text-dim)" strokeWidth="1.5" />
            <path d="M20 8 L27 13 L24 21 L16 21 L13 13 Z" fill="var(--turf)" />
            <path
              d="M20 8 L20 2 M27 13 L34 10 M24 21 L28 28 M16 21 L12 28 M13 13 L6 10"
              stroke="var(--text-dim)" strokeWidth="1.2" fill="none" strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-9 h-2.5 rounded-full bg-black animate-fph-shadow" />
      </div>

      <p className="font-mono text-sm text-text-dim min-h-[1.25rem]">{PUNS[punIndex]}</p>

      {coldStartNote && (
        <p className="font-mono text-xs text-text-dim max-w-xs">
          First visit in a while can take up to a minute — the free server is waking up.
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("fph-theme");
    const isLight = saved === "light";
    setLight(isLight);
    document.documentElement.classList.toggle("light", isLight);
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    window.localStorage.setItem("fph-theme", next ? "light" : "dark");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light and dark mode"
      className="text-xs font-mono px-3 py-1.5 rounded-full border border-line text-text-dim hover:text-text hover:border-turf transition-colors"
    >
      {light ? "DARK" : "LIGHT"}
    </button>
  );
}

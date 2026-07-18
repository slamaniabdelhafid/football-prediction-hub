"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import AdminDashboard from "./AdminDashboard";

const STORAGE_KEY = "fph_admin_key";

export default function AdminGate() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setChecking(false);
      return;
    }
    api.adminCheckKey(stored).then((res) => {
      if (res.ok) {
        setAdminKey(stored);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.adminCheckKey(input);
      if (res.ok) {
        sessionStorage.setItem(STORAGE_KEY, input);
        setAdminKey(input);
      } else {
        setError("Incorrect password.");
      }
    } catch {
      setError("Can't reach the backend API right now.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return <p className="font-mono text-sm text-text-dim">Checking…</p>;
  }

  if (adminKey) {
    return <AdminDashboard adminKey={adminKey} />;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <label className="block font-mono text-sm text-text-dim mb-2">
        Admin password
      </label>
      <input
        type="password"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
        className="w-full rounded-card border border-line bg-bg-2 px-4 py-2.5 font-mono text-sm mb-3 focus:outline-none focus:border-turf"
      />
      {error && <p className="text-red text-sm font-mono mb-3">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !input}
        className="px-4 py-1.5 rounded-full text-sm font-mono uppercase tracking-wide border border-turf text-turf hover:bg-turf/15 transition-colors disabled:opacity-50"
      >
        {submitting ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}

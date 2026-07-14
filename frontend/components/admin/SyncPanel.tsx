"use client";

type LogEntry = { time: string; status: string; detail: string };

export default function SyncPanel({
  logs,
  syncing,
  onSync,
}: {
  logs: LogEntry[];
  syncing: boolean;
  onSync: () => void;
}) {
  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg uppercase tracking-tight">
          Data Synchronization
        </h3>
        <button
          onClick={onSync}
          disabled={syncing}
          className="text-xs font-mono px-4 py-2 rounded-full bg-turf/15 border border-turf text-turf hover:bg-turf/25 transition-colors disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Trigger Manual Sync"}
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-text-dim text-sm font-mono">No sync logs yet.</p>
        ) : (
          logs.map((l, i) => (
            <div
              key={i}
              className="flex items-start gap-3 text-sm border-b border-line last:border-b-0 py-2"
            >
              <span
                className={`text-[10px] font-mono uppercase mt-0.5 px-2 py-0.5 rounded-full shrink-0 ${
                  l.status === "ok"
                    ? "bg-turf/15 text-turf"
                    : "bg-red/15 text-red"
                }`}
              >
                {l.status}
              </span>
              <div className="min-w-0">
                <p className="text-text-dim text-[11px] font-mono">
                  {new Date(l.time).toLocaleString()}
                </p>
                <p className="truncate">{l.detail}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

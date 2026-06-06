// Simple CSS bar chart of listing views (no chart library).
export function PerformanceChart({ data }: { data: { id: string; title: string; views: number }[] }) {
  const rows = data.filter((d) => d.views > 0);
  const max = Math.max(1, ...rows.map((d) => d.views));

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted">
        No views yet. Share your listings to start tracking performance.
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
      {rows.map((d) => (
        <div key={d.id} className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 truncate text-muted sm:w-44">{d.title}</span>
          <div className="h-3 flex-1 rounded-full bg-surface">
            <div className="h-3 rounded-full bg-brand" style={{ width: `${(d.views / max) * 100}%` }} />
          </div>
          <span className="w-10 shrink-0 text-right font-semibold">{d.views}</span>
        </div>
      ))}
    </div>
  );
}

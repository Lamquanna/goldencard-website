interface Kpi {
  metric: string;
  value: string;
}

interface KpiGridProps {
  items: Kpi[];
}

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((kpi) => (
        <div key={kpi.metric} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            {kpi.metric}
          </dt>
          <dd className="mt-2 text-lg font-semibold text-primary">{kpi.value}</dd>
        </div>
      ))}
    </dl>
  );
}

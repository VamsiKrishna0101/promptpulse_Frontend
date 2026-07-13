export function MetricCards({ metrics }: { metrics: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
          <p className="mt-2 text-[26px] font-black leading-none text-slate-950">{metric.value}</p>
        </div>
      ))}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: number
  tone: "blue" | "amber" | "red" | "emerald"
}

function MetricCard({ label, value, tone }: MetricCardProps) {
  const tones = {
    blue: "from-blue-50 to-white text-blue-700",
    amber: "from-amber-50 to-white text-amber-700",
    red: "from-red-50 to-white text-red-700",
    emerald: "from-emerald-50 to-white text-emerald-700",
  }
  return (
    <div className={`rounded-2xl border border-zinc-200 bg-gradient-to-br ${tones[tone]} p-5`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

interface ActionQueueMetricsProps {
  open: number
  inProgress: number
  high: number
  done: number
}

export function ActionQueueMetrics({ open, inProgress, high, done }: ActionQueueMetricsProps) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      <MetricCard label="Open" value={open} tone="blue" />
      <MetricCard label="In progress" value={inProgress} tone="amber" />
      <MetricCard label="High priority" value={high} tone="red" />
      <MetricCard label="Done" value={done} tone="emerald" />
    </section>
  )
}

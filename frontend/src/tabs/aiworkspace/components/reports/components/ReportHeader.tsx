import type { ReportViewModel } from "../utils/reportMapper"

export function ReportHeader({ vm }: { vm: ReportViewModel }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-amber-700">AI visibility report</span>
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-zinc-950">{vm.brandName}</h1>
          <p className="mt-1 text-[13.5px] text-zinc-500">{vm.headline}</p>
        </div>

        <div className="flex items-center gap-8">
          {vm.metrics.map((metric, i) => {
            const colorClass =
              i === 3 && String(metric.value).startsWith("+")
                ? "text-emerald-700"
                : i === 3 && String(metric.value).startsWith("-")
                  ? "text-red-700"
                  : "text-zinc-950"

            return (
              <div key={metric.label} className="text-center">
                <p className={`text-[22px] font-bold tracking-tight tabular-nums ${colorClass}`}>{metric.value}</p>
                <p className="mt-1 text-[11px] font-medium text-zinc-500">{metric.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
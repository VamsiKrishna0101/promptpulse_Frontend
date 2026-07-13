import type { ReportViewModel } from "../utils/reportMapper"

export function ReportHeader({ vm }: { vm: ReportViewModel }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0f172a]">{vm.brandName} - AI Visibility Report</h1>
          <p className="mt-1 text-[14px] text-slate-500">{vm.headline}</p>
        </div>
        <div className="flex items-center gap-12">
          {vm.metrics.map((metric, i) => {
            const colorClass =
              i === 3 && String(metric.value).startsWith("+") ? "text-emerald-700" :
                i === 3 && String(metric.value).startsWith("-") ? "text-red-700" :
                  "text-[#18181b]"

            return (
              <div key={metric.label} className="text-center">
                <p className={`text-[24px] font-semibold tracking-tight ${colorClass}`}>{metric.value}</p>
                <p className="mt-1 text-[12px] font-medium text-slate-500">{metric.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

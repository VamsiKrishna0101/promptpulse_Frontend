import { useState } from "react"
import { Sparkles, X, Clock, CheckCircle2 } from "lucide-react"
import type { ReportPeriod } from "@/lib/aiReportsApi"

const PERIODS: { label: string; value: ReportPeriod; description: string }[] = [
  { label: "7 Days", value: "7d", description: "Quick pulse check on recent visibility" },
  { label: "14 Days", value: "14d", description: "Short-term trend across two weeks" },
  { label: "30 Days", value: "30d", description: "Full month, best for broader shifts" },
]

export function GenerateReportModal({
  open,
  onClose,
  onGenerate,
}: {
  open: boolean
  onClose: () => void
  onGenerate: (period: ReportPeriod) => void
}) {
  const [period, setPeriod] = useState<ReportPeriod>("7d")
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-zinc-900" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
        >
          <X size={16} />
        </button>

        <div className="p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <Sparkles size={11} className="text-amber-500" />
            Generate report
          </span>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-950">Select report period</h2>
          <p className="mt-1.5 text-[13px] leading-5 text-zinc-500">
            Choose how far back Sara should analyze AI visibility signals.
          </p>

          <div className="mt-6 space-y-2.5">
            {PERIODS.map((option) => {
              const isSelected = period === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPeriod(option.value)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${isSelected
                      ? "border-zinc-900 bg-zinc-50 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.25)]"
                      : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60"
                    }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
                      }`}
                  >
                    <Clock size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-zinc-900">{option.label}</p>
                    <p className="text-[12px] text-zinc-500">{option.description}</p>
                  </div>
                  {isSelected && <CheckCircle2 size={18} className="shrink-0 text-zinc-900" />}
                </button>
              )
            })}
          </div>

          <div className="mt-7 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-[13px] font-semibold text-zinc-600 transition hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onGenerate(period)}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] transition hover:bg-zinc-800"
            >
              <Sparkles size={14} className="text-amber-400" />
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
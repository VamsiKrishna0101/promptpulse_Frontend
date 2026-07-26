import { scoreBar, scoreColor } from "../lib/seoUi"

export function SeoMetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3.5">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-[26px] font-black tracking-[-0.04em] text-slate-900">{value}</p>
    </div>
  )
}

export function SeoScoreCard({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_1px_8px_-2px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-500">
          {icon}
        </span>
      </div>
      <div className="mt-3 flex items-end gap-1">
        <span className={`text-[32px] font-black leading-none tracking-[-0.05em] ${scoreColor(score)}`}>{score}</span>
        <span className="mb-1 text-[12px] font-bold text-slate-300">/100</span>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${scoreBar(score)}`}
          style={{ width: `${Math.max(3, score)}%` }}
        />
      </div>
    </div>
  )
}

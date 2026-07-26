import { Clock, FileBarChart2, Globe } from "lucide-react"
import type { SeoAuditSummary } from "@/hooks/useSeoAudit"
import { timeAgo } from "@/tabs/overview/overview"
import { scoreColor, shortUrl } from "../lib/seoUi"

function ScorePill({ score }: { score: number }) {
  return (
    <span className={`text-[14px] font-black tracking-[-0.03em] ${scoreColor(score)}`}>
      {score}<span className="text-[10px] font-bold text-slate-300">/100</span>
    </span>
  )
}

export function SeoReportHistory({
  history,
  onSelect,
}: {
  history: SeoAuditSummary[]
  onSelect: (id: string) => void
}) {
  if (history.length === 0) return null

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_8px_-2px_rgba(15,23,42,0.06)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-50 bg-slate-50/50 px-5 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400">
          <FileBarChart2 size={13} />
        </span>
        <div>
          <h2 className="text-[13.5px] font-black tracking-[-0.025em] text-slate-900">Past reports</h2>
          <p className="text-[11px] font-medium text-slate-400">Last {history.length} audit{history.length > 1 ? "s" : ""} for this project</p>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-50">
        {history.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="group w-full px-5 py-3.5 text-left transition hover:bg-slate-50/80"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left: domain + meta */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.1em] text-blue-500">
                      Latest
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-[12.5px] font-black text-slate-800 group-hover:text-blue-700">
                    <Globe size={11} className="flex-shrink-0 text-slate-300" />
                    <span className="truncate">{shortUrl(item.url)}</span>
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 pl-4 text-[11px] font-medium text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {timeAgo(item.created_at)}
                  </span>
                  <span>{item._count.pages} pages</span>
                  <span>{item._count.issues} issues</span>
                  <span>{item.credits_spent} credit{item.credits_spent !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Right: score pills */}
              <div className="hidden flex-shrink-0 items-center gap-4 xl:flex">
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-300">Overall</p>
                  <ScorePill score={item.overall_score} />
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-300">Technical</p>
                  <ScorePill score={item.technical_score} />
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-300">AI</p>
                  <ScorePill score={item.ai_readiness_score} />
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-300">Local</p>
                  <ScorePill score={item.local_score} />
                </div>
              </div>

              {/* Mobile: just overall */}
              <div className="xl:hidden">
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-300">Score</p>
                  <ScorePill score={item.overall_score} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

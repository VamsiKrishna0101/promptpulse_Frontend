import { ArrowUpRight, RefreshCw, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import type { OpportunitiesResponse } from "@/hooks/useOpportunities"

export function OpportunityHero({
  brandName,
  summary,
  onRefresh,
}: {
  brandName: string
  summary: OpportunitiesResponse["summary"]
  onRefresh: () => void
}) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#D8E5F2] bg-white shadow-[0_22px_60px_-42px_rgba(15,23,42,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(125,211,252,0.28),transparent_36%),linear-gradient(115deg,#ffffff_0%,#ffffff_58%,#f0f9ff_100%)]" />
      <div className="relative flex flex-col gap-6 px-6 py-6 xl:flex-row xl:items-end xl:justify-between xl:px-7">
        <div className="max-w-[760px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700 shadow-sm">
            <Sparkles size={12} />
            AI growth intelligence
          </span>
          <h1 className="mt-4 text-[26px] font-semibold leading-[1.12] tracking-[-0.035em] text-[#071225] md:text-[30px]">
            Turn AI visibility gaps into work your team can execute.
          </h1>
          <p className="mt-3 max-w-[690px] text-[13px] leading-6 text-[#526174]">
            PromptPulse connects buyer intent, competitor outcomes, cited evidence, the best target page, and a measurable next step for {brandName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/ai-workspace/actions"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#CFD8E3] bg-white px-4 text-[12px] font-semibold text-[#243247] shadow-sm transition hover:border-sky-300 hover:text-sky-700"
          >
            Open action center
            <ArrowUpRight size={14} />
          </Link>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#071225] px-4 text-[12px] font-semibold text-white shadow-[0_12px_28px_-16px_rgba(7,18,37,0.8)] transition hover:bg-[#102342]"
          >
            <RefreshCw size={14} />
            Refresh evidence
          </button>
        </div>
      </div>

      <div className="relative grid border-t border-[#E7EEF5] bg-white/75 backdrop-blur md:grid-cols-4">
        {[
          ["Open opportunities", summary.total],
          ["High business impact", summary.high_impact],
          ["New pages", summary.create_pages],
          ["Pages to improve", summary.refresh_pages],
        ].map(([label, value], index) => (
          <div key={label} className={`px-6 py-4 ${index ? "border-t border-[#E7EEF5] md:border-l md:border-t-0" : ""}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8A98AA]">{label}</p>
            <p className="mt-1.5 text-[24px] font-semibold tracking-[-0.03em] text-[#071225]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}


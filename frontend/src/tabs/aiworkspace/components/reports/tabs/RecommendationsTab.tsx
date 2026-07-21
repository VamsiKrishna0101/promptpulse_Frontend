import type { ReportViewModel } from "../utils/reportMapper"
import { InsightCard } from "../components/InsightCard"
import { TimelineCard } from "../components/TimelineCard"
import { AlertCircle, Target, TrendingUp, Zap, BarChart2, Lightbulb, Route } from "lucide-react"
import { ComparisonBarChart, InsightPanel } from "../components/ReportVisuals"

const STRATEGY_CARDS = [
  { key: "priority" as const, title: "Priority actions", description: "Fix the issues most likely to hold visibility back.", icon: AlertCircle, tone: "risk" as const, shell: "border-red-200 bg-red-50/45", chip: "bg-white text-red-700 ring-red-200" },
  { key: "quickWins" as const, title: "Quick wins", description: "Low-friction moves that can improve the next report.", icon: Zap, tone: "good" as const, shell: "border-emerald-200 bg-emerald-50/45", chip: "bg-white text-emerald-700 ring-emerald-200" },
  { key: "sourceActions" as const, title: "Source actions", description: "Citation and authority work for AI answer engines.", icon: Target, tone: "neutral" as const, shell: "border-zinc-200 bg-white", chip: "bg-zinc-50 text-zinc-700 ring-zinc-200" },
  { key: "longTerm" as const, title: "Long-term strategy", description: "Positioning and messaging work that compounds.", icon: TrendingUp, tone: "neutral" as const, shell: "border-zinc-200 bg-white", chip: "bg-zinc-50 text-zinc-700 ring-zinc-200" },
]

export function RecommendationsTab({ report }: { report: ReportViewModel }) {
  const actionBars = [
    { label: "Priority fixes", value: report.recommendations.priority.length, tone: "risk" as const },
    { label: "Quick wins", value: report.recommendations.quickWins.length, tone: "good" as const },
    { label: "Source actions", value: report.recommendations.sourceActions.length, tone: "watch" as const },
    { label: "Long-term moves", value: report.recommendations.longTerm.length, tone: "neutral" as const },
  ].filter((item) => item.value > 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-[#fafafa] p-5 shadow-sm">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 0% 0%, rgba(161,161,170,0.15), transparent 40%), linear-gradient(to right, rgba(161,161,170,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(161,161,170,0.08) 1px, transparent 1px)",
              backgroundSize: "auto, 32px 32px, 32px 32px",
            }}
          />
          <div className="relative">
            <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Recommended sequence</p>
            <h3 className="max-w-2xl text-[22px] font-semibold leading-tight tracking-[-0.03em] text-zinc-900">
              Turn this report into the next optimization sprint.
            </h3>
            <p className="mt-2 max-w-3xl text-[13px] font-medium leading-6 text-zinc-600">
              Start with fixes that protect visibility, then use quick wins and source actions to build authority before the next refresh cycle.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-4">
              {[
                { label: "Priority", value: report.recommendations.priority.length },
                { label: "Quick wins", value: report.recommendations.quickWins.length },
                { label: "Sources", value: report.recommendations.sourceActions.length },
                { label: "Content", value: report.recommendations.contentSequence.length },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{item.label}</p>
                  <p className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-zinc-950 tabular-nums">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <InsightPanel icon={Route} eyebrow="Action mix" title="Recommended work distribution">
          {actionBars.length > 0 ? (
            <ComparisonBarChart items={actionBars.map((a) => ({ ...a, label: a.label }))} valueSuffix="" height={180} />
          ) : (
            <p className="text-[12.5px] font-medium text-zinc-500">No recommendation mix available.</p>
          )}
        </InsightPanel>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {STRATEGY_CARDS.map(({ key, title, description, icon: Icon, tone, shell, chip }) => {
          const items = report.recommendations[key]
          if (!items || items.length === 0) return null
          return (
            <section key={key} className={`rounded-2xl border p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] ${shell}`}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${chip}`}>
                    <Icon size={14} />
                  </div>
                  <div>
                    <h3 className="text-[13.5px] font-bold text-zinc-950">{title}</h3>
                    <p className="mt-0.5 text-[11.5px] font-medium leading-[1.45] text-zinc-500">{description}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-white/70 bg-white/80 px-2 py-0.5 text-[10.5px] font-bold text-zinc-500 shadow-sm">
                  {items.length}
                </span>
              </div>
              <TimelineCard items={items} tone={tone} />
            </section>
          )
        })}
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div className="mb-4 flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
            <BarChart2 size={14} />
          </div>
          <div>
            <h3 className="text-[13.5px] font-bold text-zinc-950">Content and analytics</h3>
            <p className="mt-0.5 text-[11.5px] font-medium leading-[1.45] text-zinc-500">What the report recommends building, testing, and measuring next.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: "Content strategy", value: report.recommendations.content },
            { label: "Opportunity theme", value: report.recommendations.opportunityTheme },
            { label: "Web analytics action", value: report.recommendations.analytics },
          ]
            .filter((x) => x.value)
            .map(({ label, value }) => (
              <div key={label} className="flex min-h-[118px] flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">{label}</p>
                <p className="line-clamp-4 text-[12.5px] font-medium leading-[1.55] text-zinc-700">{value}</p>
              </div>
            ))}
        </div>
      </section>

      {report.recommendations.contentSequence?.length > 0 && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          <div className="mb-4 flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-amber-100 bg-amber-50 text-amber-700">
              <Lightbulb size={14} />
            </div>
            <div>
              <h3 className="text-[13.5px] font-bold text-zinc-950">Content sequence</h3>
              <p className="mt-0.5 text-[11.5px] font-medium leading-[1.45] text-zinc-500">Specific assets to create from the opportunity gaps.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.recommendations.contentSequence.map((item, i) => (
              <InsightCard key={i} insight={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

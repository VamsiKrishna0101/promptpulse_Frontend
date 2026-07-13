import type { ReportViewModel } from "../utils/reportMapper"
import { InsightCard } from "../components/InsightCard"
import { TimelineCard } from "../components/TimelineCard"
import { AlertCircle, Target, TrendingUp, Zap, BarChart2, Lightbulb } from "lucide-react"

const STRATEGY_CARDS = [
  { 
    key: "priority" as const,      
    title: "Priority Actions",    
    description: "Fix the issues most likely to hold visibility back.",
    icon: AlertCircle, 
    tone: "risk" as const,
    shell: "border-red-200 bg-red-50/45",
    chip: "bg-white text-red-700 ring-red-200",
  },
  { 
    key: "quickWins" as const,     
    title: "Quick Wins",          
    description: "Low-friction moves that can improve the next report.",
    icon: Zap, 
    tone: "good" as const,
    shell: "border-emerald-200 bg-emerald-50/45",
    chip: "bg-white text-emerald-700 ring-emerald-200",
  },
  { 
    key: "sourceActions" as const, 
    title: "Source Actions",      
    description: "Citation and authority work for AI answer engines.",
    icon: Target, 
    tone: "neutral" as const,
    shell: "border-zinc-200 bg-white",
    chip: "bg-zinc-50 text-[#17404b] ring-zinc-200",
  },
  { 
    key: "longTerm" as const,      
    title: "Long-Term Strategy",  
    description: "Positioning and messaging work that compounds.",
    icon: TrendingUp, 
    tone: "neutral" as const,
    shell: "border-zinc-200 bg-white",
    chip: "bg-zinc-50 text-[#17404b] ring-zinc-200",
  },
]

export function RecommendationsTab({ report }: { report: ReportViewModel }) {
  return (
    <div className="flex flex-col gap-4">
      
      {/* Strategy Grid */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {STRATEGY_CARDS.map(({ key, title, description, icon: Icon, tone, shell, chip }) => {
          const items = report.recommendations[key]
          if (!items || items.length === 0) return null
          
          return (
            <section 
              key={key} 
              className={`rounded-2xl border p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] ${shell}`}
            >
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

      {/* Content & Analytics */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div className="mb-4 flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0b2f3a] text-white shadow-sm">
            <BarChart2 size={14} />
          </div>
          <div>
            <h3 className="text-[13.5px] font-bold text-zinc-950">Content & Analytics</h3>
            <p className="mt-0.5 text-[11.5px] font-medium leading-[1.45] text-zinc-500">What the report recommends building, testing, and measuring next.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: "Content Strategy",    value: report.recommendations.content },
            { label: "Opportunity Theme",   value: report.recommendations.opportunityTheme },
            { label: "Web Analytics Action",value: report.recommendations.analytics },
          ].filter(x => x.value).map(({ label, value }) => (
            <div key={label} className="flex min-h-[118px] flex-col justify-between rounded-xl border border-zinc-200 bg-[#f8faf9] p-3.5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
              <p className="line-clamp-4 text-[12.5px] font-medium leading-[1.55] text-zinc-700">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Content Sequence */}
      {report.recommendations.contentSequence?.length > 0 && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          <div className="mb-4 flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Lightbulb size={14} />
            </div>
            <div>
              <h3 className="text-[13.5px] font-bold text-zinc-950">Content Sequence</h3>
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

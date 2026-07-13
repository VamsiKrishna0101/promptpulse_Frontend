import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Crosshair, FileText, Filter, Gauge, Lightbulb, RefreshCw, Search, Target, TrendingUp } from "lucide-react"
import { useFilters } from "@/hooks/useFilters"
import { useOpportunities, type OpportunityImpact, type OpportunityItem, type OpportunityType } from "@/hooks/useOpportunities"
import { useProjects } from "@/hooks/useProjects"
import { Fav, Sk } from "@/tabs/overview/overview"

type Segment = "ALL" | OpportunityType

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "MISSING", label: "Create" },
  { key: "OUTRANKED", label: "Outranked" },
  { key: "SOURCE_GAP", label: "Sources" },
  { key: "SENTIMENT_GAP", label: "Sentiment" },
]

const PAGE_SIZE = 6

function typeMeta(type: OpportunityType) {
  if (type === "MISSING") return { label: "Missing", cls: "bg-[#FEF3F2] text-[#B42318] ring-[#FDA29B]/40", icon: <Target size={12} /> }
  if (type === "OUTRANKED") return { label: "Outranked", cls: "bg-[#FFFAEB] text-[#B54708] ring-[#FEDF89]/60", icon: <TrendingUp size={12} /> }
  if (type === "SOURCE_GAP") return { label: "Source gap", cls: "bg-[#EFF6FF] text-[#1D4ED8] ring-[#DCE8FD]", icon: <Crosshair size={12} /> }
  return { label: "Sentiment", cls: "bg-[#ECFDF3] text-[#047857] ring-[#B7EFCF]", icon: <Gauge size={12} /> }
}

function impactClass(impact: OpportunityImpact) {
  if (impact === "HIGH") return "bg-[#2563EB] text-white"
  if (impact === "MEDIUM") return "bg-[#EFF6FF] text-[#1D4ED8] ring-1 ring-[#DCE8FD]"
  return "bg-[#F1F3F6] text-[#667085] ring-1 ring-[#E2E5EA]"
}

function scoreBar(score: number) {
  if (score >= 72) return "bg-[#12B76A]"
  if (score >= 42) return "bg-[#2563EB]"
  return "bg-[#CBD0D9]"
}

function StatCard({
  label,
  value,
  detail,
  tone,
  icon,
}: {
  label: string
  value: string | number
  detail: string
  tone: "blue" | "emerald" | "amber" | "slate"
  icon: React.ReactNode
}) {
  const toneClass = {
    blue: "bg-[#EFF6FF] text-[#1D4ED8] ring-[#DCE8FD]",
    emerald: "bg-[#ECFDF3] text-[#047857] ring-[#B7EFCF]",
    amber: "bg-[#FFFAEB] text-[#B54708] ring-[#FEDF89]/60",
    slate: "bg-[#F1F3F6] text-[#475467] ring-[#E2E5EA]",
  }[tone]

  return (
    <div className="rounded-xl border border-[#E2E5EA] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-[#D0D5DD]">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ${toneClass}`}>
          {icon}
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-[22px] font-semibold leading-none tracking-[-0.01em] text-[#0F172A]">{value}</span>
        <span className="max-w-[150px] text-right text-[11px] font-medium leading-snug text-[#667085]">{detail}</span>
      </div>
    </div>
  )
}

function SegmentButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-8 rounded-md px-2.5 text-[12px] font-semibold transition-all",
        active ? "bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(16,24,40,0.08)]" : "text-[#667085] hover:text-[#344054]",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function OpportunityCard({ item }: { item: OpportunityItem }) {
  const meta = typeMeta(item.type)
  const actionClass = item.content_gap.action === "CREATE"
    ? "bg-black text-white"
    : item.content_gap.action === "REFRESH"
      ? "bg-[#EFF6FF] text-[#1D4ED8] ring-1 ring-[#DCE8FD]"
      : "bg-[#F1F3F6] text-[#475467] ring-1 ring-[#E2E5EA]"

  return (
    <article className="group rounded-2xl border border-[#E2E5EA] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition duration-150 hover:-translate-y-[1px] hover:border-[#BFD4FB] hover:shadow-[0_16px_36px_-28px_rgba(37,99,235,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1 ${meta.cls}`}>
              {meta.icon}
              {meta.label}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${impactClass(item.impact)}`}>
              {item.impact} impact
            </span>
            <span className="rounded-full bg-[#F1F3F6] px-2 py-0.5 text-[10.5px] font-medium text-[#667085]">
              {item.effort} effort
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${actionClass}`}>
              {item.content_gap.action}
            </span>
          </div>
          <h3 className="mt-2.5 text-[14px] font-semibold leading-tight tracking-[-0.01em] text-[#0F172A]">{item.title}</h3>
          <p className="mt-1.5 text-[12px] leading-relaxed text-[#667085]">{item.description}</p>
        </div>

        <div className="w-[80px] flex-shrink-0 text-right">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">Score</p>
          <p className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.01em] text-[#0F172A]">{item.impact_score}</p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EEF1F5]">
            <div className={`h-full rounded-full transition-all duration-300 ${scoreBar(item.impact_score)}`} style={{ width: `${Math.max(8, item.impact_score)}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-3.5 rounded-xl border border-[#E2E5EA] bg-white p-3">
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-black text-white">
            <FileText size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">Content gap recommendation</p>
              <span className="rounded-md border border-[#E2E5EA] bg-[#F7F8FA] px-1.5 py-0.5 text-[10.5px] font-medium text-[#475467]">
                {item.content_gap.recommended_content_type}
              </span>
            </div>
            <p className="mt-1 text-[13px] font-semibold leading-snug text-[#0F172A]">{item.content_gap.suggested_title}</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#667085]">{item.content_gap.gap_reason}</p>
          </div>
        </div>
      </div>

      <div className="mt-3.5 rounded-xl border border-[#E2E5EA] bg-[#F7F8FA] p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">Prompt intent</p>
        <p className="mt-1 text-[12.5px] font-medium leading-snug text-[#344054]">{item.prompt_text}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10.5px] font-medium text-[#667085]">
          {item.topic && <span className="rounded-md border border-[#E2E5EA] bg-white px-1.5 py-1">{item.topic}</span>}
          <span className="rounded-md border border-[#E2E5EA] bg-white px-1.5 py-1">{item.evidence_count} answers</span>
          <span className="rounded-md border border-[#E2E5EA] bg-white px-1.5 py-1">{item.competitor_name}</span>
        </div>
      </div>

      <div className="mt-3.5 grid gap-2.5 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-xl border border-[#E2E5EA] bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">Gap</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[#E2E5EA] bg-white px-2.5 py-2">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#98A2B3]">You</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#0F172A]">{item.own_visibility}%</p>
              <p className="text-[10.5px] font-medium text-[#98A2B3]">{item.own_position ? `#${item.own_position}` : "No rank"}</p>
            </div>
            <div className="rounded-lg border border-[#DCE8FD] bg-[#EFF6FF] px-2.5 py-2">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#7DA2E8]">Competitor</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#1D4ED8]">{item.competitor_visibility}%</p>
              <p className="text-[10.5px] font-medium text-[#7DA2E8]">{item.competitor_position ? `#${item.competitor_position}` : "No rank"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E5EA] bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">Source evidence</p>
          {item.top_sources.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.top_sources.map((source) => (
                <span key={source.domain} className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E5EA] bg-white px-2 py-1 text-[10.5px] font-medium text-[#344054]">
                  <Fav domain={source.domain} />
                  {source.domain}
                  <span className="text-[#98A2B3]">{source.mentions}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[11.5px] text-[#98A2B3]">No dominant source pattern yet.</p>
          )}
        </div>
      </div>

      <div className="mt-3.5 grid gap-2.5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E2E5EA] bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">Missing angles</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {item.content_gap.missing_angles.map((angle) => (
              <span key={angle} className="flex items-start gap-1.5 text-[11.5px] font-medium leading-snug text-[#344054]">
                <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0 text-[#12B76A]" />
                {angle}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[#E2E5EA] bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">Optimization focus</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.content_gap.optimization_focus.map((focus) => (
              <span key={focus} className="rounded-full border border-[#E2E5EA] bg-[#F7F8FA] px-2 py-1 text-[10.5px] font-medium text-[#475467]">
                {focus}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#98A2B3]">{item.content_gap.priority_reason}</p>
        </div>
      </div>

      <div className="mt-3.5 rounded-xl border border-[#B7EFCF] bg-[#ECFDF3] px-3 py-2.5">
        <div className="flex items-start gap-2">
          <Lightbulb size={13} className="mt-0.5 flex-shrink-0 text-[#047857]" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#047857]">Recommended next step</p>
            <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-[#065F46]">{item.next_step}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="line-clamp-1 max-w-[70%] text-[11px] text-[#98A2B3]">{item.sample_response ?? "Evidence comes from matching AI responses for this prompt."}</p>
        <Link to={`/prompts/${item.prompt_id}`} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]">
          Open prompt
          <ArrowUpRight size={11} />
        </Link>
      </div>
    </article>
  )
}

export function OpportunitiesTab() {
  const { selectedProject } = useProjects()
  const { queryString } = useFilters()
  const projectId = selectedProject?.id ?? null
  const { summary, opportunities, isLoading, error, refresh } = useOpportunities(projectId, queryString)
  const [segment, setSegment] = useState<Segment>("ALL")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return opportunities.filter((item) => {
      const segmentMatch = segment === "ALL" || item.type === segment
      const searchMatch = !needle ||
        item.title.toLowerCase().includes(needle) ||
        item.prompt_text.toLowerCase().includes(needle) ||
        item.competitor_name.toLowerCase().includes(needle) ||
        item.content_gap.suggested_title.toLowerCase().includes(needle) ||
        item.content_gap.recommended_content_type.toLowerCase().includes(needle) ||
        item.content_gap.missing_angles.some((angle) => angle.toLowerCase().includes(needle)) ||
        item.top_sources.some((source) => source.domain.toLowerCase().includes(needle))
      return segmentMatch && searchMatch
    })
  }, [opportunities, search, segment])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const paged = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  function setSegmentAndReset(nextSegment: Segment) {
    setSegment(nextSegment)
    setPage(1)
  }

  function setSearchAndReset(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <div data-product-tour-id="opportunities-shell" className="flex flex-col gap-4 pb-10">
      <section className="overflow-hidden rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="relative flex min-h-[110px] items-center justify-between gap-5 px-5 py-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,0,0,0.025),transparent_60%)]" />
          <div className="relative min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-zinc-600">
              Content gap analysis
            </span>
            <h1 className="mt-3 text-[20px] font-semibold leading-tight tracking-[-0.01em] text-[#0F172A]">
              Find the pages and angles AI answers are missing.
            </h1>
            <p className="mt-1.5 max-w-[700px] text-[12.5px] leading-relaxed text-[#667085]">
              Prioritized content gaps from competitor rank, visibility, sentiment, and source evidence. No article generation yet, just what to create or improve first.
            </p>
          </div>
          {/* Was showing summary.total here — same number as the "Open gaps" stat card below.
              Swapped to quick wins so the header teases something distinct and actionable. */}
          <div className="relative hidden items-center gap-2 rounded-xl border border-[#E2E5EA] bg-white p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] xl:flex">
            <div className="rounded-lg bg-zinc-950 px-3 py-2 text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-white/60">Create pages</p>
              <p className="mt-0.5 text-[16px] font-semibold leading-none">{summary.create_pages}</p>
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              className="flex h-[50px] items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-[11.5px] font-semibold text-zinc-700 transition hover:border-zinc-400"
            >
              <RefreshCw size={13} className="text-zinc-500" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-4">
        <StatCard label="Content gaps" value={summary.total} detail="Prompt intents where content can improve AI visibility" tone="blue" icon={<Target size={14} />} />
        <StatCard label="High impact" value={summary.high_impact} detail="Issues likely to move visibility fastest" tone="emerald" icon={<TrendingUp size={14} />} />
        <StatCard label="Create pages" value={summary.create_pages} detail="New content likely needed for missing intents" tone="amber" icon={<FileText size={14} />} />
        <StatCard label="Refresh pages" value={summary.refresh_pages} detail="Existing pages likely need proof or positioning" tone="slate" icon={<Crosshair size={14} />} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex min-h-[58px] items-center justify-between gap-4 border-b border-[#EEF0F3] px-4 py-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Filter size={13} className="text-[#98A2B3]" />
              <h2 className="text-[13px] font-semibold text-[#0F172A]">Prioritized content gaps</h2>
            </div>
            <p className="mt-0.5 text-[11.5px] text-[#98A2B3]">Filtered by the controls above for {selectedProject?.brand_name ?? "your brand"}.</p>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3]"><Search size={13} /></span>
            <input
              value={search}
              onChange={(event) => setSearchAndReset(event.target.value)}
              placeholder="Search content gap, source, competitor..."
              className="h-8 w-[260px] rounded-lg border border-[#E2E5EA] bg-white pl-8 pr-3 text-[11.5px] font-medium text-[#344054] outline-none transition placeholder:text-[#98A2B3] focus:border-[#93B8F8] focus:ring-4 focus:ring-[#2563EB]/10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-[#EEF0F3] bg-[#F7F8FA] px-3 py-2">
          <div className="inline-flex rounded-lg bg-[#EEF1F5] p-1">
            {SEGMENTS.map((option) => (
              <SegmentButton key={option.key} active={segment === option.key} onClick={() => setSegmentAndReset(option.key)}>
                {option.label}
              </SegmentButton>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-2.5 py-1.5 shadow-[0_10px_26px_-20px_rgba(15,23,42,0.55)]">
            <div className="hidden text-right sm:block">
              <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#667085]">Page controls</p>
              <p className="mt-0.5 text-[11px] font-semibold leading-none text-[#0F172A]">
                {filtered.length ? `${pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, filtered.length)} of ${filtered.length} gaps` : "No gaps"}
              </p>
            </div>
            <div className="flex items-center rounded-lg border border-[#111827] bg-[#0F172A] p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage <= 1}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:text-white/30"
                aria-label="Previous opportunities page"
              >
                <ArrowLeft size={13} />
              </button>
              <span className="min-w-[74px] px-2 text-center text-[11px] font-bold text-white">
                Page {currentPage}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:text-white/30"
                aria-label="Next opportunities page"
              >
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-4 rounded-xl border border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-[12.5px] font-medium text-[#B42318]">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-3 p-4 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => <Sk key={index} cls="h-[280px] rounded-2xl" />)}
          </div>
        ) : filtered.length ? (
          <div className="grid gap-3 p-4 xl:grid-cols-2">
            {paged.map((item) => <OpportunityCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECFDF3] text-[#047857]">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="mt-3.5 text-[14.5px] font-semibold text-[#0F172A]">No content gaps found for this view</h3>
            <p className="mx-auto mt-2 max-w-[440px] text-[12.5px] leading-relaxed text-[#667085]">
              Try widening the date range or adding tracked competitors. If this stays empty, your current prompt set is not exposing obvious competitor gaps.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { createActionFromOpportunity, useOpportunities, type OpportunityItem } from "@/hooks/useOpportunities"
import { useFilters } from "@/hooks/useFilters"
import { useProjects } from "@/hooks/useProjects"
import { Sk } from "@/tabs/overview/overview"
import { OpportunityCard } from "./components/OpportunityCard"
import { OpportunityHero } from "./components/OpportunityHero"
import { OpportunityToolbar, type OpportunitySegment } from "./components/OpportunityToolbar"

const PAGE_SIZE = 6

export function OpportunitiesTab() {
  const { selectedProject } = useProjects()
  const { queryString } = useFilters()
  const projectId = selectedProject?.id ?? null
  const { summary, opportunities, isLoading, error, refresh } = useOpportunities(projectId, queryString)
  const [segment, setSegment] = useState<OpportunitySegment>("ALL")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return opportunities.filter(item => {
      const segmentMatches = segment === "ALL" || item.type === segment
      const searchMatches = !needle || [
        item.title,
        item.prompt_text,
        item.competitor_name,
        item.content_gap.suggested_title,
        item.buyer_intent.label,
        item.target_page.label,
        ...item.top_sources.map(source => source.domain),
      ].some(value => value.toLowerCase().includes(needle))
      return segmentMatches && searchMatches
    })
  }, [opportunities, search, segment])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  function updateSegment(next: OpportunitySegment) {
    setSegment(next)
    setPage(1)
  }

  function updateSearch(next: string) {
    setSearch(next)
    setPage(1)
  }

  async function createAction(item: OpportunityItem) {
    if (!projectId) return
    await createActionFromOpportunity(projectId, item.id, queryString)
  }

  return (
    <div data-product-tour-id="opportunities-shell" className="flex flex-col gap-4 pb-12">
      <OpportunityHero
        brandName={selectedProject?.brand_name ?? "your brand"}
        summary={summary}
        onRefresh={() => void refresh()}
      />

      <OpportunityToolbar
        segment={segment}
        search={search}
        count={filtered.length}
        onSegment={updateSegment}
        onSearch={updateSearch}
      />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-medium text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 2xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => <Sk key={index} cls="h-[560px] rounded-[20px]" />)}
        </div>
      ) : pageItems.length ? (
        <>
          <div className="grid items-start gap-4 2xl:grid-cols-2">
            {pageItems.map(item => (
              <OpportunityCard key={item.id} item={item} onCreateAction={createAction} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-[#DDE5EE] bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-medium text-[#728195]">
                Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(value => Math.max(1, value - 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#DDE5EE] text-[#526174] transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Previous page"
                >
                  <ArrowLeft size={13} />
                </button>
                <span className="min-w-[72px] text-center text-[11px] font-semibold text-[#243247]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(value => Math.min(totalPages, value + 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#DDE5EE] text-[#526174] transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Next page"
                >
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <section className="rounded-[20px] border border-[#DDE5EE] bg-white px-6 py-16 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={21} />
          </span>
          <h2 className="mt-4 text-[16px] font-semibold tracking-[-0.02em] text-[#071225]">No evidence-backed gaps in this view</h2>
          <p className="mx-auto mt-2 max-w-[500px] text-[12px] leading-5 text-[#68778A]">
            Widen the reporting period or track more genuine competitors. PromptPulse will only show opportunities supported by matching AI answers.
          </p>
        </section>
      )}
    </div>
  )
}

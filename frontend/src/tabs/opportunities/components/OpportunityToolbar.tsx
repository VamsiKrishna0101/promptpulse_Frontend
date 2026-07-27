import { Search, SlidersHorizontal } from "lucide-react"
import type { OpportunityType } from "@/hooks/useOpportunities"

export type OpportunitySegment = "ALL" | OpportunityType

const SEGMENTS: Array<{ key: OpportunitySegment; label: string }> = [
  { key: "ALL", label: "All opportunities" },
  { key: "MISSING", label: "Missing" },
  { key: "OUTRANKED", label: "Outranked" },
  { key: "SOURCE_GAP", label: "Source gaps" },
  { key: "SENTIMENT_GAP", label: "Reputation" },
]

export function OpportunityToolbar({
  segment,
  search,
  count,
  onSegment,
  onSearch,
}: {
  segment: OpportunitySegment
  search: string
  count: number
  onSegment: (segment: OpportunitySegment) => void
  onSearch: (search: string) => void
}) {
  return (
    <section className="rounded-2xl border border-[#DDE5EE] bg-white p-3 shadow-[0_12px_36px_-34px_rgba(15,23,42,0.45)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-[#F3F6F9] p-1">
          {SEGMENTS.map(option => (
            <button
              key={option.key}
              type="button"
              onClick={() => onSegment(option.key)}
              className={[
                "h-8 whitespace-nowrap rounded-lg px-3 text-[11.5px] font-semibold transition",
                segment === option.key
                  ? "bg-white text-[#071225] shadow-[0_1px_3px_rgba(15,23,42,0.12)]"
                  : "text-[#68778A] hover:text-[#243247]",
              ].join(" ")}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-[11px] font-semibold text-[#7C8A9C] sm:inline-flex">
            <SlidersHorizontal size={13} />
            {count} matching
          </span>
          <label className="relative block min-w-0 flex-1 xl:w-[290px]">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A98AA]" />
            <input
              value={search}
              onChange={event => onSearch(event.target.value)}
              placeholder="Search prompt, competitor, source..."
              className="h-9 w-full rounded-xl border border-[#DDE5EE] bg-white pl-9 pr-3 text-[11.5px] font-medium text-[#243247] outline-none transition placeholder:text-[#9AA7B7] focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            />
          </label>
        </div>
      </div>
    </section>
  )
}


import { useMemo, useState } from "react"
import { ListChecks, ChevronLeft, ChevronRight } from "lucide-react"
import type { ActionQueueItem } from "@/lib/actionQueueApi"
import { STATUS_FILTERS, PAGE_SIZE, type StatusFilter } from "./constants"
import { sortItems } from "./utils"
import { ActionQueueListItem } from "./ActionQueueListItem"

interface ActionQueueListProps {
  items: ActionQueueItem[]
  isLoading: boolean
  onSelectItem: (item: ActionQueueItem) => void
}

export function ActionQueueList({ items, isLoading, onSelectItem }: ActionQueueListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const base = statusFilter === "ALL" ? items : items.filter((i) => i.status === statusFilter)
    return sortItems(base)
  }, [items, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE)

  function handleFilter(value: StatusFilter) {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-6 py-4">
        <div>
          <h2 className="text-[15px] font-bold text-zinc-950">Execution queue</h2>
          <p className="mt-0.5 text-[12px] text-zinc-500">
            {filtered.length === 0 ? "No actions" : `Showing ${startIdx + 1}–${Math.min(startIdx + PAGE_SIZE, filtered.length)} of ${filtered.length} actions`}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleFilter(filter.value)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                statusFilter === filter.value
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* List body */}
      <div className="divide-y divide-zinc-100">
        {isLoading && (
          <div className="p-8 text-center">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
            <p className="mt-3 text-[13px] text-zinc-400">Loading action queue…</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
              <ListChecks size={20} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-zinc-950">No actions yet</h3>
            <p className="mx-auto mt-1 max-w-md text-[13px] leading-6 text-zinc-500">
              Generate the queue after a scrape run. PromptPulse will turn fresh AI answers and sources into execution tasks.
            </p>
          </div>
        )}

        {!isLoading &&
          pageItems.map((item) => (
            <ActionQueueListItem
              key={item.id}
              item={item}
              onClick={() => onSelectItem(item)}
            />
          ))}
      </div>

      {/* Pagination */}
      {!isLoading && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3">
          <p className="text-[12px] text-zinc-500">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-30"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-30"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

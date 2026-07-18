import type { SourceInsight } from "../utils/reportMapper"
import { Globe, TrendingUp, TrendingDown, ChevronRight } from "lucide-react"
import { DataTable } from "./ReportVisuals"

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`
}

function sourceBadge(source: SourceInsight) {
  const domain = source.domain.toLowerCase()
  if (domain.includes("refract")) return { label: "Owned", cls: "bg-amber-50 text-amber-700 border-amber-200" }
  if (source.mentioned_competitors?.length) return { label: "Competitive", cls: "bg-red-50 text-red-700 border-red-200" }
  return { label: source.url_type || "Domain", cls: "bg-zinc-100 text-zinc-600 border-zinc-200" }
}

export function SourcesTable({ sources }: { sources: SourceInsight[] }) {
  if (!sources || !sources.length) {
    return <p className="text-[13px] font-medium text-zinc-500">No source signals available.</p>
  }

  return (
    <DataTable
      columns={[
        { label: "Source" },
        { label: "Type" },
        { label: "Citations", align: "right" },
        { label: "Delta", align: "right" },
        { label: "Competitors", align: "right" },
      ]}
    >
      {sources.map((source, index) => {
        const badge = sourceBadge(source)
        const deltaPositive = source.delta > 0
        const hasDelta = source.delta !== undefined && source.delta !== 0

        return (
          <div
            key={index}
            className="grid items-center gap-3 px-4 py-3 transition hover:bg-zinc-50"
            style={{ gridTemplateColumns: "minmax(160px,1.6fr) repeat(4, minmax(70px,1fr))" }}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100">
                {source.domain ? (
                  <img src={faviconUrl(source.domain)} alt="" className="h-4 w-4" />
                ) : (
                  <Globe size={14} className="text-zinc-400" />
                )}
              </div>
              <p className="truncate text-[12.5px] font-semibold text-zinc-950">{source.domain}</p>
            </div>

            <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] ${badge.cls}`}>
              {badge.label}
            </span>

            <span className="text-right text-[13px] font-semibold tabular-nums text-zinc-950">{source.citations}</span>

            <span className="flex items-center justify-end gap-1 text-right text-[12.5px] font-semibold tabular-nums">
              {hasDelta ? (
                <span className={deltaPositive ? "flex items-center gap-1 text-emerald-700" : "flex items-center gap-1 text-red-700"}>
                  {deltaPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {deltaPositive ? "+" : ""}
                  {source.delta}
                </span>
              ) : (
                <span className="text-zinc-400">0</span>
              )}
            </span>

            <span className="flex items-center justify-end gap-1 text-right">
              {source.mentioned_competitors?.length ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10.5px] font-semibold text-red-700">
                  {source.mentioned_competitors.length} <ChevronRight size={10} />
                </span>
              ) : (
                <span className="text-[11px] text-zinc-300">—</span>
              )}
            </span>
          </div>
        )
      })}
    </DataTable>
  )
}
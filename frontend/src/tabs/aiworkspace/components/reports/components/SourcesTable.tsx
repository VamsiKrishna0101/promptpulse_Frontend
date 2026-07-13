import type { SourceInsight } from "../utils/reportMapper"
import {
  Globe,
  ArrowUpRight,
  Link2,
  TrendingUp,
  TrendingDown,
  Users,
} from "lucide-react"

function sourceTone(source: SourceInsight) {
  const domain = source.domain.toLowerCase()
  if (domain.includes("refract")) {
    return {
      card: "border-emerald-200 bg-gradient-to-br from-emerald-50/85 to-white",
      icon: "border-emerald-200 bg-white text-emerald-700",
      badge: "border-emerald-200 bg-white text-emerald-700",
      label: "Owned",
    }
  }

  if (source.mentioned_competitors?.length) {
    return {
      card: "border-amber-200 bg-gradient-to-br from-amber-50/70 to-white",
      icon: "border-amber-200 bg-white text-amber-700",
      badge: "border-amber-200 bg-white text-amber-700",
      label: "Competitive",
    }
  }

  return {
    card: "border-[#e4e4e7] bg-white",
    icon: "border-[#e4e4e7] bg-[#fafafa] text-[#71717a]",
    badge: "border-[#e4e4e7] bg-[#fafafa] text-[#71717a]",
    label: "Source",
  }
}

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`
}

export function SourcesTable({ sources }: { sources: SourceInsight[] }) {
  if (!sources || !sources.length) {
    return (
      <p className="text-[13px] font-medium text-[#71717a]">
        No source signals available.
      </p>
    )
  }

  return (
    <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
      {sources.map((source, index) => (
        <SourceCard key={index} index={index} source={source} />
      ))}
    </div>
  )
}

function SourceCard({ source, index }: { source: SourceInsight; index: number }) {
  const tone = sourceTone(source)
  const deltaPositive = source.delta > 0
  const hasDelta = source.delta !== undefined && source.delta !== 0

  return (
    <div
      className={`group flex flex-col rounded-xl border p-3.5 shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-22px_rgba(9,9,11,0.35)] ${tone.card}`}
    >
          {/* Header */}
          <div className="mb-2.5 flex items-center justify-between">
            <span className={`rounded-full border px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] ${tone.badge}`}>
              #{index + 1} · {tone.label}
            </span>

            <div className="flex items-center gap-1.5 rounded-full border border-white/80 bg-white/80 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#71717a]">
              <Link2 size={10} />
              {source.url_type || "Domain"}
            </div>
          </div>

          <div className="mb-2.5 flex items-center gap-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border ${tone.icon}`}>
              {source.domain ? (
                <img src={faviconUrl(source.domain)} alt="" className="h-4 w-4" />
              ) : (
                <Globe size={15} />
              )}
            </div>

            <p className="truncate text-[13px] font-semibold leading-[1.45] text-[#18181b]">
              {source.domain}
            </p>
          </div>

          {/* Metrics */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/80 bg-white/75 px-3 py-2">
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#a1a1aa]">
                Citations
              </span>

              <span className="mt-0.5 block text-[18px] font-semibold leading-none text-[#18181b]">
                {source.citations}
              </span>
            </div>

            {hasDelta ? (
              <div className={`rounded-lg border px-3 py-2 ${deltaPositive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#a1a1aa]">
                  Delta
                </span>

                <span
                  className="mt-0.5 flex items-center gap-1 text-[15px] font-semibold leading-none"
                >
                  {deltaPositive ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}

                  {deltaPositive ? "+" : ""}
                  {source.delta}
                </span>
              </div>
            ) : (
              <div className="rounded-lg border border-white/80 bg-white/75 px-3 py-2">
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#a1a1aa]">
                  Delta
                </span>
                <span className="mt-0.5 block text-[15px] font-semibold leading-none text-[#71717a]">0</span>
              </div>
            )}
          </div>

          {/* Competitors */}
          {source.mentioned_competitors &&
            source.mentioned_competitors.length > 0 ? (
            <div className="mt-auto border-t border-black/5 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
                  <Users size={12} /> Competitors Here
                </div>

                <span className="rounded-full border border-[#e4e4e7] bg-[#fafafa] px-1.5 py-0.5 text-[10px] font-semibold text-[#52525b]">
                  {source.mentioned_competitors.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {source.mentioned_competitors.map((comp, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-white/90 bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-[#52525b]"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-auto flex items-center gap-1.5 border-t border-black/5 pt-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#18181b]">
              <ArrowUpRight size={13} />
              Citation Target
            </div>
          )}
    </div>
  )
}

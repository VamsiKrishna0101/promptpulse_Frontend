import { ExternalLink, Info, Search, Target, Zap } from "lucide-react"
import type { SeoIntelligence } from "@/hooks/useSeoAudit"
import { coverageClass, shortUrl } from "../lib/seoUi"

export function SeoKeywordIntelligence({ intelligence }: { intelligence: SeoIntelligence | null }) {
  const keywords = intelligence?.keywords ?? []
  const gaps = keywords.filter(keyword => keyword.seo_coverage === "GAP").length
  const weak = keywords.filter(keyword => keyword.seo_coverage === "WEAK").length
  const covered = keywords.filter(keyword => keyword.seo_coverage === "COVERED").length

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_8px_-2px_rgba(15,23,42,0.06)]">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-50 bg-slate-50/50 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
            <Search size={14} />
          </span>
          <div>
            <h2 className="text-[14px] font-black tracking-[-0.025em] text-slate-900">SEO keyword intelligence</h2>
            <p className="mt-0.5 text-[12px] font-medium text-slate-500">
              Buyer queries from your prompt library, mapped to website pages and AI visibility.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-[11px] font-black text-rose-600">
            {gaps} page gaps
          </span>
          <span className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-black text-amber-600">
            {weak} weak pages
          </span>
          {covered > 0 && (
            <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-600">
              {covered} covered
            </span>
          )}
          <span className={`rounded-lg border px-3 py-1.5 text-[11px] font-black ${intelligence?.rank_tracking.google_enabled ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-slate-100 bg-slate-50 text-slate-500"}`}>
            {intelligence?.rank_tracking.google_enabled ? `${intelligence.rank_tracking.checked_keywords} Google queries · top 20` : "Google rank not connected"}
          </span>
        </div>
      </div>

      {/* Why these keywords appear — explanation */}
      <div className="flex items-start gap-3 border-b border-slate-50 bg-slate-50/30 px-5 py-3.5">
        <Info size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
        <p className="text-[12px] font-medium leading-5 text-slate-500">
          <strong className="font-black text-slate-700">Why do these keywords appear?</strong>{" "}
          These are pulled directly from your <strong className="font-bold text-slate-600">Prompts library</strong> — the buyer queries you're already tracking for AI visibility. We map each one to your crawled pages to check if you have a page that ranks for it.{" "}
          <strong className="font-bold text-slate-600">GAP</strong> = no matching page found,{" "}
          <strong className="font-bold text-slate-600">WEAK</strong> = page exists but thin content,{" "}
          <strong className="font-bold text-slate-600">COVERED</strong> = you have a strong matching page.
        </p>
      </div>

      {/* SERP provider banner */}
      {intelligence?.rank_tracking && (
        <div className="flex items-start gap-3 border-b border-slate-100 bg-white px-5 py-3.5">
          <Zap size={13} className="mt-0.5 flex-shrink-0 text-amber-400" />
          <p className="text-[12px] font-medium leading-5 text-slate-600">
            <strong className="font-black text-slate-800">{intelligence.rank_tracking.google_enabled ? "Google rank tracking." : "Google rank not connected."}</strong>{" "}
            {intelligence.rank_tracking.message}{" "}
            {!intelligence.rank_tracking.google_enabled && "Connect Bright Data SERP in the backend environment to see real Google positions for these queries."}
          </p>
        </div>
      )}

      <div className="grid gap-2.5 p-4">
        {keywords.slice(0, 12).map(keyword => (
          <div key={keyword.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-lg border px-2 py-1 text-[10.5px] font-black ${coverageClass(keyword.seo_coverage)}`}>
                    {keyword.seo_coverage}
                  </span>
                  <span className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[10.5px] font-black text-slate-500">
                    {keyword.intent}
                  </span>
                  <span className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[10.5px] font-bold text-slate-500">
                    Priority {keyword.priority_score}
                  </span>
                </div>
                <h3 className="mt-2 text-[13.5px] font-black leading-5 text-slate-900">{keyword.keyword}</h3>
                <p className="mt-1.5 text-[12px] font-medium leading-5 text-slate-500">{keyword.recommendation}</p>
              </div>

              <div className="grid min-w-[240px] gap-1.5">
                <MiniMetric label="AI visibility" value={keyword.ai_visibility === null ? "No runs yet" : `${keyword.ai_visibility}%`} />
                <MiniMetric label="AI avg rank" value={keyword.ai_avg_position === null ? "—" : `#${keyword.ai_avg_position}`} />
          <MiniMetric label="Google rank" value={keyword.google_rank === null ? (keyword.google_rank_status === "NOT_FOUND" ? "Not in top 20" : "Not checked") : `#${keyword.google_rank}`} muted={keyword.google_rank === null} />
              </div>
            </div>

            {keyword.google_ranking_url && (
              <a href={keyword.google_ranking_url} target="_blank" rel="noreferrer" className="mt-2 block truncate text-[11px] font-bold text-sky-600 hover:text-sky-700">
                Ranking page: {keyword.google_ranking_title || keyword.google_ranking_url}
              </a>
            )}

            {/* Page mapping */}
            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              {keyword.mapped_page_url ? (
                <a
                  href={keyword.mapped_page_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-2 text-[12px] font-bold text-slate-700 hover:text-blue-600"
                >
                  <Target size={12} className="flex-shrink-0 text-slate-400" />
                  <span className="truncate">{keyword.mapped_page_title || shortUrl(keyword.mapped_page_url)}</span>
                  <ExternalLink size={11} className="flex-shrink-0 text-slate-300" />
                </a>
              ) : (
                <div className="flex items-center gap-2 text-[12px] font-bold text-rose-500">
                  <Target size={12} className="flex-shrink-0" />
                  No matching page found — create a page targeting this query
                </div>
              )}
            </div>
          </div>
        ))}

        {keywords.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-[13px] font-semibold text-slate-400">No SEO keywords yet.</p>
            <p className="mt-1 text-[12px] font-medium text-slate-400">Add prompts to your library first — we pull buyer queries from there.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function MiniMetric({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
      <span className="text-[11px] font-semibold text-slate-400">{label}</span>
      <span className={`text-[11.5px] font-black ${muted ? "text-slate-300" : "text-slate-700"}`}>{value}</span>
    </div>
  )
}

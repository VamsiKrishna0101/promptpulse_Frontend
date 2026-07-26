import type { SeoAudit } from "@/hooks/useSeoAudit"
import { pageStatusLabel, shortUrl } from "../lib/seoUi"

export function SeoPagesPanel({ audit }: { audit: SeoAudit }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_8px_-2px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-50 bg-slate-50/50 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[14px] font-black tracking-[-0.025em] text-slate-900">Scanned URLs</h2>
          <p className="mt-0.5 text-[12px] font-medium text-slate-500">Exact pages checked by the crawler, with HTTP/load status.</p>
        </div>
        <span className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-[11px] font-black text-slate-500">
          {audit.pages.length} URLs
        </span>
      </div>
      <div className="grid gap-2 p-4">
        {audit.pages.slice(0, 18).map(page => {
          const loaded = Boolean(page.status_code && page.status_code >= 200 && page.status_code < 400)
          return (
            <a
              key={page.id}
              href={page.url}
              target="_blank"
              rel="noreferrer"
              className="grid gap-3 rounded-xl border border-slate-100 bg-white p-3 transition hover:border-slate-200 hover:bg-slate-50 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={loaded ? "h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" : "h-2 w-2 flex-shrink-0 rounded-full bg-rose-400"} />
                  <p className="truncate text-[12.5px] font-black text-slate-900">{page.title || page.h1 || shortUrl(page.url)}</p>
                </div>
                <p className="mt-1 truncate pl-4 text-[11px] font-medium text-slate-400">{shortUrl(page.url)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={
                    loaded
                      ? "rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10.5px] font-black text-emerald-600"
                      : "rounded-lg border border-rose-100 bg-rose-50 px-2 py-1 text-[10.5px] font-black text-rose-600"
                  }
                >
                  {pageStatusLabel(page.status_code)}
                </span>
                <span className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[10.5px] font-black text-slate-500">
                  {page.page_type}
                </span>
                <span className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[10.5px] font-bold text-slate-500">
                  {page.word_count} words
                </span>
                {page.has_schema && (
                  <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10.5px] font-black text-emerald-600">
                    Schema
                  </span>
                )}
                {page.has_faq && (
                  <span className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[10.5px] font-black text-blue-600">
                    FAQ
                  </span>
                )}
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}

import { ExternalLink } from "lucide-react"
import type { SeoAudit } from "@/hooks/useSeoAudit"
import { SeoMetricCard } from "./SeoMetricCard"
import { shortUrl } from "../lib/seoUi"

export function SeoScanSummary({ audit }: { audit: SeoAudit }) {
  const healthyPages = audit.pages.filter(page => page.status_code && page.status_code >= 200 && page.status_code < 400).length
  const schemaPages = audit.pages.filter(page => page.has_schema).length
  const faqPages = audit.pages.filter(page => page.has_faq).length

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_8px_-2px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 px-5 py-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">What we scanned</p>
          <h2 className="mt-1.5 text-[17px] font-black tracking-[-0.03em] text-slate-900">{shortUrl(audit.url)}</h2>
          <p className="mt-1.5 max-w-[680px] text-[12.5px] font-medium leading-5 text-slate-500">
            URLs discovered from the project website, sitemap, and same-domain internal links. Failed pages usually indicate HTTP 404/5xx, bot protection, or crawler-blocking rules.
          </p>
        </div>
        <a
          href={audit.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 flex-shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[11.5px] font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          Open site <ExternalLink size={12} />
        </a>
      </div>
      <div className="grid gap-3 border-t border-slate-50 bg-slate-50/50 px-5 py-4 md:grid-cols-4">
        <SeoMetricCard label="Pages checked" value={audit.pages.length} />
        <SeoMetricCard label="Loaded pages" value={healthyPages} />
        <SeoMetricCard label="Schema pages" value={schemaPages} />
        <SeoMetricCard label="FAQ pages" value={faqPages} />
      </div>
    </section>
  )
}

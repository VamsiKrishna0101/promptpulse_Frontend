import { ExternalLink, Link2 } from "lucide-react"
import type { SeoAudit } from "@/hooks/useSeoAudit"
import { pageStatusLabel, severityClass, shortUrl } from "../lib/seoUi"

function groupedIssues(audit: SeoAudit) {
  const map = new Map<string, {
    key: string
    title: string
    category: string
    severity: "HIGH" | "MEDIUM" | "LOW"
    recommendation: string
    priority_score: number
    pages: { url: string; title: string | null; page_type: string; status_code: number | null }[]
    count: number
  }>()

  for (const issue of audit.issues) {
    const key = `${issue.category}:${issue.severity}:${issue.title}`
    const existing = map.get(key)
    const page = issue.page ? { url: issue.page.url, title: issue.page.title, page_type: issue.page.page_type, status_code: issue.page.status_code } : null
    if (existing) {
      existing.count += 1
      existing.priority_score = Math.max(existing.priority_score, issue.priority_score)
      if (page && !existing.pages.some(item => item.url === page.url)) existing.pages.push(page)
      continue
    }
    map.set(key, { key, title: issue.title, category: issue.category, severity: issue.severity, recommendation: issue.recommendation, priority_score: issue.priority_score, pages: page ? [page] : [], count: 1 })
  }

  return [...map.values()].sort((a, b) => b.priority_score - a.priority_score)
}

export function SeoIssuesPanel({ audit }: { audit: SeoAudit }) {
  const issues = groupedIssues(audit).slice(0, 8)
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_8px_-2px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-50 bg-slate-50/50 px-5 py-4">
        <h2 className="text-[14px] font-black tracking-[-0.025em] text-slate-900">Top technical and page fixes</h2>
        <p className="mt-0.5 text-[12px] font-medium text-slate-500">Grouped by issue, with exact affected URLs and status where available.</p>
      </div>
      <div className="grid gap-2.5 p-4">
        {issues.map(issue => (
          <div key={issue.key} className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`rounded-lg border px-2 py-1 text-[10.5px] font-black ${severityClass(issue.severity)}`}>
                {issue.severity}
              </span>
              <span className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[10.5px] font-black text-slate-500">
                {issue.category.replace("_", " ")}
              </span>
              <span className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[10.5px] font-bold text-slate-500">
                {issue.count} affected
              </span>
            </div>
            <h3 className="mt-2 text-[13px] font-black text-slate-900">{issue.title}</h3>
            <p className="mt-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[12px] font-medium leading-5 text-slate-600">
              {issue.recommendation}
            </p>
            {issue.pages.length > 0 && (
              <div className="mt-3 grid gap-1.5">
                {issue.pages.slice(0, 5).map(page => (
                  <a
                    key={page.url}
                    href={page.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 transition hover:border-blue-100 hover:bg-blue-50/50"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-[11.5px] font-bold text-slate-600">
                      <Link2 size={11} className="flex-shrink-0 text-blue-400" />
                      <span className="truncate">{page.title || shortUrl(page.url)}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[10.5px] font-black text-slate-400">
                      {pageStatusLabel(page.status_code)} <ExternalLink size={10} />
                    </span>
                  </a>
                ))}
                {issue.pages.length > 5 && (
                  <span className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-center text-[11px] font-black text-slate-500">
                    +{issue.pages.length - 5} more affected pages
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        {issues.length === 0 && (
          <div className="py-8 text-center text-[13px] font-semibold text-slate-400">No major SEO issues found.</div>
        )}
      </div>
    </section>
  )
}

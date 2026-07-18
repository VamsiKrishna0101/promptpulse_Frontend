import type { ContentInsight } from "../utils/reportMapper"
import { FileText, Type } from "lucide-react"

export function InsightCard({ insight }: { insight: ContentInsight }) {
  const title = insight.suggested_title || insight.title
  const body = insight.priority_reason || insight.body
  const theme = insight.theme
  const type = insight.content_type

  return (
    <article className="group flex min-h-[178px] flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.02)] transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_10px_24px_-16px_rgba(15,23,42,0.35)]">
      <div>
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <FileText size={14} className="text-zinc-700" />
          </div>
          <div className="flex-1">
            <h4 className="line-clamp-2 text-[12.8px] font-bold leading-[1.35] text-zinc-950">{title}</h4>
            {theme && (
              <span className="mt-2 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-amber-700">
                {theme}
              </span>
            )}
          </div>
        </div>
        {body && <p className="mt-3 line-clamp-4 text-[12.5px] font-medium leading-[1.5] text-zinc-600">{body}</p>}
      </div>
      {type && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-zinc-200 pt-2.5">
          <Type size={12} className="text-zinc-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">{type.replace(/_/g, " ")}</p>
        </div>
      )}
    </article>
  )
}
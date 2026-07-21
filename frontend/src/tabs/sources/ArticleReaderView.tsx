import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Fav, Sk } from "@/tabs/overview/overview"

export type ArticleContent = {
  title?: string | null
  content?: string | null
  snippet?: string | null
  content_length?: number
  source_type?: string | null
  url_type?: string | null
  platform?: string | null
  subreddit?: string | null
  mentioned_brands?: unknown
  fetch_status?: string | null
  error_reason?: string | null
  content_updated_at?: string | null
}

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

function cleanUrl(url: string) {
  try {
    const parsed = new URL(url)
    return `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, "")
  } catch {
    return url
  }
}

export function ArticleReaderView({
  url,
  domain,
  title,
  projectId,
  onClose,
}: {
  url: string
  domain: string
  title?: string | null
  projectId: string | null
  onClose: () => void
}) {
  const [content, setContent] = useState<ArticleContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId || !url) return

    let cancelled = false
    setLoading(true)

    api.get<ArticleContent>(`/sources/${projectId}/url-content`, { params: { url } })
      .then((response) => {
        if (!cancelled) {
          setContent(response.data)
        }
      })
      .catch(() => {
        // Silently handle error, content will be null
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectId, url])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  const displayTitle = content?.title || title || cleanUrl(url)
  const bodyText = content?.content || content?.snippet

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white" onClick={onClose}>
      <header
        className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/90 px-6 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-sm">
            <Fav domain={domain} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-semibold text-zinc-900">{displayTitle}</h2>
            <p className="truncate text-[12px] font-medium text-zinc-400">{cleanUrl(url)}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 text-[13px] font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            Open Original <ExternalIcon />
          </a>
          <div className="h-6 w-px bg-zinc-200" />
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-800"
            aria-label="Close reader"
          >
            <CloseIcon />
          </button>
        </div>
      </header>

      <main
        className="flex-1 overflow-y-auto bg-[#f8fafc] px-6 py-12"
        onClick={(e) => e.stopPropagation()}
      >
        <article className="mx-auto max-w-[680px] rounded-2xl border border-zinc-200/60 bg-white p-8 shadow-sm sm:p-12 md:p-14">
          <header className="mb-10 border-b border-zinc-100 pb-8">
            <h1 className="mb-5 text-[28px] font-bold leading-[1.3] tracking-tight text-zinc-900 md:text-[32px]">
              {displayTitle}
            </h1>
            <div className="flex items-center gap-3 text-[13px] font-medium text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Fav domain={domain} />
                {domain}
              </span>
              {content?.content_updated_at && (
                <>
                  <span className="h-1 w-1 rounded-full bg-zinc-300" />
                  <span>
                    {new Date(content.content_updated_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </>
              )}
            </div>
          </header>

          <div className="text-[16px] leading-[1.9] text-zinc-700">
            {loading ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Sk cls="h-4 w-full" />
                  <Sk cls="h-4 w-[90%]" />
                  <Sk cls="h-4 w-[95%]" />
                  <Sk cls="h-4 w-[85%]" />
                </div>
                <div className="space-y-3">
                  <Sk cls="h-4 w-[92%]" />
                  <Sk cls="h-4 w-full" />
                  <Sk cls="h-4 w-[88%]" />
                </div>
                <div className="space-y-3">
                  <Sk cls="h-4 w-[95%]" />
                  <Sk cls="h-4 w-[90%]" />
                  <Sk cls="h-4 w-full" />
                  <Sk cls="h-4 w-[80%]" />
                </div>
              </div>
            ) : bodyText ? (
              <div>
                {(() => {
                  const raw = bodyText as string
                  const hasParagraphs = /\n\n/.test(raw)
                  const paragraphs = hasParagraphs
                    ? raw.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
                    : raw
                        .split(/(?<=[\.\!\?])\s+(?=[A-Z])/)
                        .reduce<string[]>((acc, sentence, i) => {
                          if (i % 3 === 0) acc.push(sentence)
                          else acc[acc.length - 1] += " " + sentence
                          return acc
                        }, [])

                  return paragraphs.map((para, i) => {
                    if (para.startsWith("•") || para.startsWith("-")) {
                      const items = para.split("\n").filter(Boolean)
                      return (
                        <ul key={i} className="my-6 ml-6 list-outside list-disc space-y-2 text-zinc-700 marker:text-zinc-400">
                          {items.map((item, j) => (
                            <li key={j} className="pl-1">
                              {item.replace(/^[•-]\s*/, "")}
                            </li>
                          ))}
                        </ul>
                      )
                    }
                    const lines = para.split("\n")
                    return (
                      <p key={i} className="mb-7">
                        {lines.map((line, j) => (
                          <span key={j}>
                            {line}
                            {j < lines.length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    )
                  })
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <p className="text-[16px] font-semibold text-zinc-900">Content Not Available</p>
                <p className="mt-2 max-w-sm text-[15px] text-zinc-500">
                  {content?.error_reason || "We couldn't extract the main article content for this page."}
                </p>
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  )
}

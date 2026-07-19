import { useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  Loader2,
  Search,
} from "lucide-react"
import type { GeoArticleItem } from "@/hooks/useGeoArticle"
import { Fav } from "@/tabs/overview/overview"
import { downloadGeoArticlePdf } from "@/lib/exportDownload"

function cleanDemoText(text: string, brandName: string) {
  return text
    .replace(/PromptPulse/gi, brandName)
    .replace(/PromptPulse/gi, brandName)
    .replace(/promptpulse\.com/gi, "yourbrand.com")
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1400)
        })
      }}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-3 text-[12px] font-semibold text-[#52525b] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-[#d4d4d8] hover:text-[#18181b]"
    >
      {copied ? <CheckCircle2 size={13} className="text-[#09090b]" /> : <Clipboard size={13} className="text-[#a1a1aa]" />}
      {copied ? "Copied" : "Copy article"}
    </button>
  )
}

function Markdown({ text }: { text: string }) {
  const nodes: React.ReactNode[] = []
  let listBuf: string[] = []
  let k = 0

  function inline(value: string) {
    return value
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, '<code class="rounded-md border border-[#e4e4e7] bg-[#f4f4f5] px-1.5 py-0.5 font-mono text-[14px] text-[#52525b]">$1</code>')
  }

  function flushList() {
    if (!listBuf.length) return
    nodes.push(
      <ul key={k++} className="my-6 space-y-3">
        {listBuf.map((item, index) => (
          <li key={index} className="flex gap-3.5 text-[17px] leading-8 text-[#3f3f46]">
            <span className="mt-3 h-2 w-2 flex-shrink-0 rounded-full bg-[#09090b]" />
            <span dangerouslySetInnerHTML={{ __html: inline(item) }} />
          </li>
        ))}
      </ul>,
    )
    listBuf = []
  }

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim()

    if (/^[-*] /.test(line)) {
      listBuf.push(line.replace(/^[-*] /, ""))
      continue
    }

    flushList()

    if (!line) nodes.push(<div key={k++} className="h-4" />)
    else if (line.startsWith("# ")) nodes.push(<h1 key={k++} className="mt-2 text-[34px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#18181b]">{line.slice(2)}</h1>)
    else if (line.startsWith("## ")) nodes.push(<h2 key={k++} className="mt-10 border-t border-[#e4e4e7] pt-7 text-[25px] font-semibold leading-tight tracking-[-0.04em] text-[#18181b]">{line.slice(3)}</h2>)
    else if (line.startsWith("### ")) nodes.push(<h3 key={k++} className="mt-7 text-[19px] font-semibold tracking-[-0.025em] text-[#18181b]">{line.slice(4)}</h3>)
    else if (!line.startsWith("|")) nodes.push(<p key={k++} className="text-[17px] leading-8 text-[#3f3f46]" dangerouslySetInnerHTML={{ __html: inline(line) }} />)
  }

  flushList()
  return <>{nodes}</>
}

function ArticleReader({
  item,
  brandName,
  projectId,
  onBack,
}: {
  item: GeoArticleItem
  brandName: string
  projectId: string
  onBack: () => void
}) {
  const article = item.article
  if (!article) return null

  const articleText = cleanDemoText(article.article_markdown, brandName)
  const articleTitle = cleanDemoText(article.title, brandName)
  const description = cleanDemoText(article.meta_description || item.brief.recommended_article.priority_reason, brandName)
  const [isExporting, setIsExporting] = useState(false)

  async function handleExportPdf() {
    setIsExporting(true)
    try {
      await downloadGeoArticlePdf(projectId, item.brief, { ...article, article_markdown: articleText, title: articleTitle })
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to export PDF.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="sticky top-0 z-20 rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-3 shadow-[0_1px_3px_rgba(9,9,11,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-3 text-[12px] font-semibold text-[#52525b] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-[#d4d4d8] hover:text-[#18181b]"
          >
            <ArrowLeft size={14} />
            Back to my articles
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <CopyButton value={articleText} />
            <button
              type="button"
              onClick={() => void handleExportPdf()}
              disabled={isExporting}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-3 text-[12px] font-semibold text-[#52525b] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-[#d4d4d8] hover:text-[#18181b]"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <div className="border-b border-[#e4e4e7] pb-5">
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
              Saved article
            </span>
            <span className="rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
              {item.brief.recommended_article.content_type}
            </span>
          </div>
          <h1 className="max-w-4xl text-[34px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#18181b] sm:text-[44px]">
            {articleTitle}
          </h1>
          <p className="mt-4 max-w-3xl text-[16px] font-medium leading-8 text-[#52525b]">
            {description}
          </p>
        </div>

        <article className="mx-auto max-w-4xl py-8">
          <Markdown text={articleText} />

          {article.faq.length > 0 && (
            <section className="mt-10 rounded-xl border border-[#e4e4e7] bg-white p-5">
              <h2 className="text-[22px] font-semibold tracking-[-0.04em] text-[#18181b]">
                Questions this draft answers
              </h2>
              <div className="mt-4 space-y-3">
                {article.faq.map((faq) => (
                  <div key={faq.question} className="rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-4">
                    <p className="text-[16px] font-semibold text-[#18181b]">{cleanDemoText(faq.question, brandName)}</p>
                    <p className="mt-2 text-[15px] leading-7 text-[#52525b]">{cleanDemoText(faq.answer, brandName)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  )
}

export function MyArticlesView({
  items,
  brandName,
  projectId,
  onBack,
}: {
  items: GeoArticleItem[]
  brandName: string
  projectId: string
  onBack: () => void
}) {
  const articles = items.filter((item) => item.article)
  const [activeId, setActiveId] = useState<string | number | null>(null)
  const activeArticle = activeId === null
    ? null
    : articles.find((item) => (item.id ?? item.offset) === activeId) ?? null

  if (activeArticle) {
    return (
      <ArticleReader
        item={activeArticle}
        brandName={brandName}
        projectId={projectId}
        onBack={() => setActiveId(null)}
      />
    )
  }

  return (
    <div className="space-y-2.5">
      <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="mb-3 inline-flex items-center gap-2 text-[12px] font-semibold text-[#71717a] transition hover:text-[#18181b]"
            >
              <ArrowLeft size={13} />
              Back to briefs
            </button>
            <h1 className="text-[28px] font-semibold leading-none tracking-[-0.045em] text-[#18181b]">
              My Articles
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#52525b]">
              All generated article drafts saved from Content Briefs. Open any article to review, copy, or export.
            </p>
          </div>

          <div className="rounded-xl border border-[#e4e4e7] bg-white px-4 py-3 text-right shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
            <p className="font-mono text-[24px] font-semibold tracking-[-0.04em] text-[#18181b]">{articles.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa]">Generated</p>
          </div>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#d4d4d8] bg-[#fafafa] px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#71717a] shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
            <FileText size={18} />
          </div>
          <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[#18181b]">No generated articles yet</h2>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-[#52525b]">
            Generate an article from a brief first. Once it is written, it will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {articles.map((item) => {
            const article = item.article!
            return (
              <button
                key={item.id ?? item.offset}
                type="button"
                onClick={() => setActiveId(item.id ?? item.offset)}
                className="group rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-4 text-left shadow-[0_1px_3px_rgba(9,9,11,0.05)] transition hover:border-[#d4d4d8] hover:bg-white"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
                        Article
                      </span>
                      <span className="rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
                        {item.brief.topic}
                      </span>
                    </div>
                    <h3 className="text-[18px] font-semibold leading-tight tracking-[-0.035em] text-[#18181b] group-hover:text-[#09090b]">
                      {cleanDemoText(article.title, brandName)}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-[#52525b]">
                      {cleanDemoText(article.meta_description || item.brief.recommended_article.priority_reason, brandName)}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#71717a]">
                      <span>{item.brief.metrics.evidence_count} evidence points</span>
                      <span>{item.brief.metrics.own_visibility}% visibility</span>
                      {item.updated_at && <span>Updated {new Date(item.updated_at).toLocaleDateString()}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Search size={16} className="text-[#a1a1aa] transition group-hover:text-[#18181b]" />
                    <div className="flex -space-x-1">
                      {item.brief.sources_to_reference.slice(0, 3).map((source) => (
                        <span key={source.domain} className="rounded-full border border-white bg-white p-0.5">
                          <Fav domain={source.domain} />
                        </span>
                      ))}
                      {item.brief.sources_to_reference.length > 3 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#f4f4f5] text-[9px] font-semibold text-[#71717a]">
                          +{item.brief.sources_to_reference.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useState } from "react"
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clipboard,
  Download,
  ExternalLink,
  FileText,
  Layers3,
  Loader2,
  Plus,
  Presentation,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react"
import { useSearchParams } from "react-router-dom"
import {
  useGeoArticles,
  type GeoArticleBrief,
  type GeoArticleItem,
} from "@/hooks/useGeoArticle"
import { useProjects } from "@/hooks/useProjects"
import { Fav, Sk } from "@/tabs/overview/overview"
import { generateGeoArticlePdf } from "@/lib/geoArticlePdf"
import { MyArticlesView } from "./MyArticlesView"

type Action = GeoArticleBrief["recommended_article"]["action"]
type PageMode = "brief" | "article" | "myArticles"

const ACTION_COPY: Record<Action, string> = {
  CREATE: "New page",
  REFRESH: "Refresh",
  OPTIMIZE: "Optimize",
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function displayBrandName(name?: string | null) {
  if (!name || /refract/i.test(name)) return "Your Brand"
  return name
}

function cleanDemoText(text: string, brandName: string) {
  return text
    .replace(/RefractOne/gi, brandName)
    .replace(/Refractone/gi, brandName)
    .replace(/refractone\.com/gi, "yourbrand.com")
}

function ActionBadge({ action }: { action: Action }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#52525b]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#09090b]" />
      {ACTION_COPY[action]}
    </span>
  )
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
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
      {copied ? (
        <CheckCircle2 size={13} className="text-[#09090b]" />
      ) : (
        <Clipboard size={13} className="text-[#a1a1aa]" />
      )}
      {copied ? "Copied" : label}
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
      .replace(
        /`(.+?)`/g,
        '<code class="rounded-md border border-[#e4e4e7] bg-[#f4f4f5] px-1.5 py-0.5 font-mono text-[14px] text-[#52525b]">$1</code>',
      )
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

    if (!line) {
      nodes.push(<div key={k++} className="h-4" />)
    } else if (line.startsWith("# ")) {
      nodes.push(
        <h1
          key={k++}
          className="mt-2 text-[34px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#18181b]"
        >
          {line.slice(2)}
        </h1>,
      )
    } else if (line.startsWith("## ")) {
      nodes.push(
        <h2
          key={k++}
          className="mt-10 border-t border-[#e4e4e7] pt-7 text-[25px] font-semibold leading-tight tracking-[-0.04em] text-[#18181b]"
        >
          {line.slice(3)}
        </h2>,
      )
    } else if (line.startsWith("### ")) {
      nodes.push(
        <h3
          key={k++}
          className="mt-7 text-[19px] font-semibold tracking-[-0.025em] text-[#18181b]"
        >
          {line.slice(4)}
        </h3>,
      )
    } else if (line.startsWith("|")) {
      continue
    } else {
      nodes.push(
        <p
          key={k++}
          className="text-[17px] leading-8 text-[#3f3f46]"
          dangerouslySetInnerHTML={{ __html: inline(line) }}
        />,
      )
    }
  }

  flushList()
  return <>{nodes}</>
}

function BriefNavigator({
  items,
  activeOffset,
  onSelect,
  onGenerate,
  isLoading,
  canGenerateMore,
}: {
  items: GeoArticleItem[]
  activeOffset: number | null
  onSelect: (item: GeoArticleItem) => void
  onGenerate: () => void
  isLoading: boolean
  canGenerateMore: boolean
}) {
  return (
    <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-1.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {items.map((item, index) => {
          const isActive = item.offset === activeOffset

          return (
            <button
              key={item.offset}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition",
                isActive
                  ? "border-[#e4e4e7] bg-white text-[#18181b] shadow-[0_1px_2px_rgba(9,9,11,0.06)]"
                  : "border-transparent text-[#52525b] hover:bg-white hover:text-[#18181b]",
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  isActive ? "text-[#09090b]" : "text-[#a1a1aa]",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="max-w-[220px] truncate">
                {item.article?.title ?? item.brief.recommended_article.title}
              </span>

              {item.article && (
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isActive ? "bg-[#09090b]" : "bg-[#a1a1aa]",
                  )}
                />
              )}
            </button>
          )
        })}

        {canGenerateMore && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading}
            className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-dashed border-[#d4d4d8] px-3 py-1.5 text-[12px] font-semibold text-[#52525b] transition hover:border-[#a1a1aa] hover:text-[#18181b] disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Find next gap
          </button>
        )}
      </div>
    </div>
  )
}

function ProofSections({ item }: { item: GeoArticleItem }) {
  const { brief, article } = item

  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-3.5 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
          Evidence
        </p>

        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {[
            ["Visibility", `${brief.metrics.own_visibility}%`],
            ["Position", brief.metrics.own_avg_position ? `#${brief.metrics.own_avg_position}` : "-"],
            ["Sentiment", brief.metrics.own_avg_sentiment ?? "-"],
            ["Answers", brief.metrics.evidence_count],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#e4e4e7] bg-white p-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a1a1aa]">
                {label}
              </p>
              <p className="mt-0.5 font-mono text-[15px] font-semibold tracking-[-0.02em] text-[#18181b]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-3.5 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
        <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
          <BookOpen size={12} /> Sources to cite
        </p>

        <div className="mt-2.5 space-y-1.5">
          {brief.sources_to_reference.slice(0, 4).map((source) => (
            <a
              key={source.domain}
              href={source.url ?? `https://${source.domain}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-2.5 py-2 transition hover:border-[#d4d4d8]"
            >
              <Fav domain={source.domain} />
              <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-[#52525b]">
                {source.title ?? source.domain}
              </span>
              <ExternalLink size={11} className="text-[#a1a1aa]" />
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-3.5 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
        <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
          <ShieldCheck size={12} /> Review
        </p>

        <div className="mt-2.5 space-y-1.5">
          {(article?.needs_data.length
            ? article.needs_data
            : [
              "Fact-check all claims",
              "Add source links before publish",
              "Re-measure citations after publishing",
            ]
          ).map((item) => (
            <div
              key={item}
              className="flex gap-2 rounded-lg border border-[#e4e4e7] bg-white px-2.5 py-2 text-[11.5px] font-medium leading-5 text-[#52525b]"
            >
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#a1a1aa]" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ArticleLoadingPage({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] px-6 py-16 text-center shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#09090b] text-white shadow-sm">
          <Loader2 size={22} className="animate-spin" />
        </div>

        <p className="mt-5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#71717a]">
          Generating article
        </p>

        <h2 className="mt-2 text-[25px] font-semibold leading-tight tracking-[-0.04em] text-[#18181b]">
          Writing your article draft...
        </h2>

        <p className="mt-3 max-w-lg text-[13px] leading-6 text-[#52525b]">
          We are turning this content gap into a complete article with structure,
          source context, FAQs, and publishing notes.
        </p>

        <div className="mt-5 rounded-xl border border-[#e4e4e7] bg-white px-4 py-3 text-left shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa]">
            Current brief
          </p>
          <p className="mt-1 text-[13px] font-semibold leading-5 text-[#18181b]">
            {title}
          </p>
        </div>
      </div>
    </div>
  )
}

function ArticlePreviewPage({
  item,
  brandName,
  projectId,
  onBack,
  onRewrite,
  isLoading,
}: {
  item: GeoArticleItem
  brandName: string
  projectId: string
  onBack: () => void
  onRewrite: () => void
  isLoading: boolean
}) {
  const { brief, article } = item
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [isExportingPpt, setIsExportingPpt] = useState(false)

  if (!article) {
    return (
      <ArticleLoadingPage
        title={cleanDemoText(brief.recommended_article.title, brandName)}
      />
    )
  }

  const articleText = cleanDemoText(article.article_markdown, brandName)
  const articleTitle = cleanDemoText(article.title, brandName)
  const description = cleanDemoText(
    article.meta_description || brief.recommended_article.priority_reason,
    brandName,
  )

  const handleExportPdf = () => {
    setIsExportingPdf(true)

    try {
      generateGeoArticlePdf(projectId, brief, {
        ...article,
        article_markdown: articleText,
        title: articleTitle,
      })
    } catch (error) {
      console.error(error)
      alert("Failed to export PDF.")
    } finally {
      setIsExportingPdf(false)
    }
  }

  const handleExportPpt = () => {
    setIsExportingPpt(true)

    try {
      // Connect your real PPT helper here later:
      // generateGeoArticlePpt(projectId, brief, {
      //   ...article,
      //   article_markdown: articleText,
      //   title: articleTitle,
      // })

      alert("PPT export UI is ready. Connect this button to generateGeoArticlePpt().")
    } catch (error) {
      console.error(error)
      alert("Failed to export PPT.")
    } finally {
      setIsExportingPpt(false)
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="sticky top-0 z-20 rounded-xl border border-[#e4e4e7] bg-[#fafafa]/95 p-3 shadow-[0_1px_3px_rgba(9,9,11,0.06)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-3 text-[12px] font-semibold text-[#52525b] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-[#d4d4d8] hover:text-[#18181b]"
          >
            <ChevronLeft size={14} />
            Back to brief
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <CopyButton value={articleText} label="Copy article" />

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-3 text-[12px] font-semibold text-[#52525b] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-[#d4d4d8] hover:text-[#18181b] disabled:opacity-60"
            >
              {isExportingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Export PDF
            </button>

            <button
              type="button"
              onClick={handleExportPpt}
              disabled={isExportingPpt}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-3 text-[12px] font-semibold text-[#52525b] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-[#d4d4d8] hover:text-[#18181b] disabled:opacity-60"
            >
              {isExportingPpt ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Presentation size={14} />
              )}
              Export PPT
            </button>

            <button
              type="button"
              onClick={onRewrite}
              disabled={isLoading}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#09090b] px-3 text-[12px] font-semibold text-white transition hover:bg-[#27272a] disabled:opacity-60"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Rewrite
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#e4e4e7] pb-5">
          <div className="max-w-4xl">
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
              <ActionBadge action={brief.recommended_article.action} />

              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
                Article generated
              </span>

              <span className="rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
                {brief.recommended_article.content_type}
              </span>
            </div>

            <h1 className="text-[34px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#18181b] sm:text-[44px]">
              {articleTitle}
            </h1>

            <p className="mt-4 max-w-3xl text-[16px] font-medium leading-8 text-[#52525b]">
              {description}
            </p>
          </div>

          <div className="grid min-w-[260px] grid-cols-3 gap-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                Visibility
              </p>
              <p className="mt-0.5 text-[18px] font-semibold text-emerald-900">
                {brief.metrics.own_visibility}%
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-red-700">
                Gap
              </p>
              <p className="mt-0.5 text-[18px] font-semibold text-red-900">
                {100 - brief.metrics.own_visibility}%
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-amber-700">
                Evidence
              </p>
              <p className="mt-0.5 text-[18px] font-semibold text-amber-900">
                {brief.metrics.evidence_count}
              </p>
            </div>
          </div>
        </div>

        <article className="mx-auto max-w-4xl py-8">
          <Markdown text={articleText} />

          {article.faq.length > 0 && (
            <section className="mt-10 rounded-xl border border-[#e4e4e7] bg-white p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090b] text-white">
                  <Sparkles size={15} />
                </div>
                <h2 className="text-[22px] font-semibold tracking-[-0.04em] text-[#18181b]">
                  Questions this draft answers
                </h2>
              </div>

              <div className="space-y-3">
                {article.faq.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-4"
                  >
                    <p className="text-[16px] font-semibold text-[#18181b]">
                      {cleanDemoText(faq.question, brandName)}
                    </p>
                    <p className="mt-2 text-[15px] leading-7 text-[#52525b]">
                      {cleanDemoText(faq.answer, brandName)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>

      <ProofSections item={item} />
    </div>
  )
}

function BriefWorkspace({
  item,
  brandName,
  onGenerateArticle,
  isLoading,
}: {
  item: GeoArticleItem
  brandName: string
  onGenerateArticle: () => void
  isLoading: boolean
}) {
  const { brief, status, generation_error } = item

  return (
    <div className="space-y-2.5">
      <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-3xl">
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
              <ActionBadge action={brief.recommended_article.action} />

              <span className="rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
                {brief.recommended_article.content_type}
              </span>

              <span className="rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
                {status === "GENERATED" ? "Article generated" : "Brief ready"}
              </span>
            </div>

            <h1 className="text-[22px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#18181b] sm:text-[24px]">
              {cleanDemoText(brief.recommended_article.title, brandName)}
            </h1>

            <p className="mt-2 max-w-2xl text-[12.5px] font-medium leading-6 text-[#52525b]">
              {cleanDemoText(brief.recommended_article.priority_reason, brandName)}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800">
                Evidence {brief.metrics.evidence_count}
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-800">
                Gap {100 - brief.metrics.own_visibility}%
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800">
                Visibility {brief.metrics.own_visibility}%
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onGenerateArticle}
            disabled={isLoading}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#09090b] px-3 text-[12px] font-semibold text-white transition hover:bg-[#27272a] disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {status === "GENERATED" ? "Open article" : "Write article"}
          </button>
        </div>
      </div>

      {generation_error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[11.5px] font-semibold text-red-800 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
          Article generation failed once. The brief is still usable — retry when ready.
        </div>
      )}

      <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)] sm:p-5">
        <div className="mx-auto max-w-3xl space-y-4">
          <section>
            <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
              <Target size={12} /> Target query
            </p>

            <h2 className="mt-2.5 text-[20px] font-semibold leading-tight tracking-[-0.035em] text-[#18181b]">
              {cleanDemoText(brief.target_prompt.text, brandName)}
            </h2>

            <p className="mt-2.5 text-[13px] leading-6 text-[#52525b]">
              This is not a blank article generator. This brief starts from a real AI-answer gap,
              then turns that gap into a citation-ready page plan.
            </p>
          </section>

          <section className="border-t border-[#e4e4e7] pt-4">
            <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
              <Layers3 size={12} /> Outline
            </p>

            <div className="mt-2.5 space-y-2">
              {brief.outline.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex gap-2.5 rounded-lg border border-[#e4e4e7] bg-white p-2.5"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#09090b] text-[10.5px] font-semibold text-white">
                    {index + 1}
                  </span>

                  <p className="text-[12.5px] font-medium leading-5 text-[#52525b]">
                    {cleanDemoText(item, brandName)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <ProofSections item={item} />
    </div>
  )
}

function EmptyState({ onGenerate, isLoading }: { onGenerate: () => void; isLoading: boolean }) {
  return (
    <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] px-6 py-10 text-center shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
      <div className="mx-auto max-w-2xl">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#09090b] text-white">
          <FileText size={18} />
        </div>

        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#71717a]">
          Content Briefs
        </p>

        <h2 className="mt-2.5 text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#18181b]">
          Turn answer gaps into publish-ready drafts.
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-[13px] leading-6 text-[#52525b]">
          Generate a brief from real AI visibility gaps, review the evidence, then write a draft your team can edit and export.
        </p>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#09090b] px-4 text-[12px] font-semibold text-white transition hover:bg-[#27272a] disabled:opacity-60"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <WandSparkles size={14} />}
          Generate first brief
        </button>
      </div>
    </div>
  )
}

export function GeoArticlesTab() {
  const { selectedProject } = useProjects()
  const [searchParams] = useSearchParams()
  const [activeOffset, setActiveOffset] = useState<number | null>(null)
  const [pageMode, setPageMode] = useState<PageMode>("brief")
  const [articleLoadingOffset, setArticleLoadingOffset] = useState<number | null>(null)

  const days = searchParams.get("days") ?? "14"
  const topic = searchParams.get("topic") ?? ""
  const model = searchParams.get("model") ?? ""
  const qs = `?days=${days}${topic ? `&topic=${topic}` : ""}${model ? `&model=${model}` : ""}`
  const brandName = displayBrandName(selectedProject?.brand_name)

  const { items, savedItems, total, isLoading, error, generate, generateArticle, canGenerateMore } =
    useGeoArticles(selectedProject?.id ?? null, qs)

  const activeItem = items.find((item) => item.offset === activeOffset) ?? items[0] ?? null

  const handleGenerate = async (withArticle = false) => {
    const previousCount = items.length
    await generate({ withArticle })

    if (activeOffset === null && previousCount === 0) {
      setActiveOffset(0)
    }
  }

  const handleOpenArticle = async (item: GeoArticleItem) => {
    setActiveOffset(item.offset)
    setPageMode("article")

    if (item.article) return

    setArticleLoadingOffset(item.offset)

    try {
      await generateArticle(item.offset)
    } finally {
      setArticleLoadingOffset(null)
    }
  }

  const handleRewriteArticle = async (item: GeoArticleItem) => {
    setArticleLoadingOffset(item.offset)

    try {
      await generateArticle(item.offset)
      setPageMode("article")
    } finally {
      setArticleLoadingOffset(null)
    }
  }

  const showArticleLoader =
    pageMode === "article" &&
    activeItem &&
    articleLoadingOffset === activeItem.offset &&
    !activeItem.article

  const allArticles = [...items, ...savedItems].reduce<GeoArticleItem[]>((acc, item) => {
    const key = item.id ?? `offset-${item.offset}`
    if (!acc.some(existing => (existing.id ?? `offset-${existing.offset}`) === key)) {
      acc.push(item)
    }
    return acc
  }, [])
  const myArticleCount = allArticles.filter((item) => item.article).length

  return (
    <div className="space-y-2.5 pb-8">
      {pageMode === "brief" && (
        <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
                <Sparkles size={12} /> AI Workspace Agent
              </div>

              <h1 className="text-[25px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#18181b]">
                Content briefs that start from the gap, not a blank page.
              </h1>

              <p className="mt-2.5 text-[13px] leading-6 text-[#52525b]">
                Find the prompt competitors are winning, build the evidence-backed brief,
                then generate an editable article draft.
              </p>
            </div>

            <div className="flex flex-shrink-0 flex-col items-start gap-2.5 sm:items-end">
              <div className="flex gap-4 text-right">
                {[
                  ["Briefs", items.length],
                  ["Gaps found", total || "-"],
                  ["Window", `${days}d`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="font-mono text-[18px] font-semibold tracking-[-0.02em] text-[#18181b]">
                      {value}
                    </p>
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#a1a1aa]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPageMode("myArticles")}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-4 text-[12px] font-semibold text-[#52525b] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-[#d4d4d8] hover:text-[#18181b]"
                >
                  <FileText size={14} />
                  My Articles
                  {myArticleCount > 0 && (
                    <span className="rounded-full bg-[#09090b] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {myArticleCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => void handleGenerate(false)}
                  disabled={isLoading}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#09090b] px-4 text-[12px] font-semibold text-white transition hover:bg-[#27272a] disabled:opacity-60"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Find content gap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] font-semibold text-red-800 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
          {error}
        </div>
      )}

      {pageMode === "myArticles" ? (
        <MyArticlesView
          items={allArticles}
          brandName={brandName}
          projectId={brandName}
          onBack={() => setPageMode("brief")}
        />
      ) : isLoading && items.length === 0 ? (
        <Sk cls="h-[360px] rounded-xl" />
      ) : items.length === 0 ? (
        <EmptyState onGenerate={() => void handleGenerate(false)} isLoading={isLoading} />
      ) : pageMode === "article" && activeItem ? (
        showArticleLoader ? (
          <ArticleLoadingPage
            title={cleanDemoText(activeItem.brief.recommended_article.title, brandName)}
          />
        ) : (
          <ArticlePreviewPage
            item={activeItem}
            brandName={brandName}
            projectId={brandName}
            isLoading={isLoading || articleLoadingOffset === activeItem.offset}
            onBack={() => setPageMode("brief")}
            onRewrite={() => void handleRewriteArticle(activeItem)}
          />
        )
      ) : (
        <div className="space-y-2.5">
          <BriefNavigator
            items={items}
            activeOffset={activeItem?.offset ?? null}
            onSelect={(item) => {
              setActiveOffset(item.offset)
              setPageMode("brief")
            }}
            onGenerate={() => void handleGenerate(false)}
            isLoading={isLoading}
            canGenerateMore={canGenerateMore}
          />

          {activeItem && (
            <BriefWorkspace
              item={activeItem}
              brandName={brandName}
              isLoading={isLoading || articleLoadingOffset === activeItem.offset}
              onGenerateArticle={() => void handleOpenArticle(activeItem)}
            />
          )}
        </div>
      )}
    </div>
  )
}

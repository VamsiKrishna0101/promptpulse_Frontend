import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import {
    ArrowUpRight,
    BookOpen,
    Building2,
    ExternalLink,
    Globe2,
    MapPin,
    MessageSquareText,
    UserRound,
    X,
} from "lucide-react"
import { api } from "@/lib/api"
import type { AnswerBlock, RecentChat } from "@/hooks/useRecentChats"
import { Avatar, EngIcon, Fav, timeAgo } from "@/tabs/overview/overview"
import { formatModelName } from "@/lib/aiModels"

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ")
}

function getSentimentColor(score: number | null) {
    if (score === null) return "bg-[#a1a1aa]"
    if (score >= 60) return "bg-emerald-500"
    if (score >= 40) return "bg-amber-500"
    return "bg-red-500"
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

import { createPortal } from "react-dom"

const HIGHLIGHT_STYLES = [
    "border-amber-200 bg-amber-100/85 text-amber-950",
    "border-slate-200 bg-slate-100/85 text-slate-800",
    "border-emerald-200 bg-emerald-100/85 text-emerald-950",
    "border-fuchsia-200 bg-fuchsia-100/85 text-fuchsia-950",
    "border-violet-200 bg-violet-100/85 text-violet-950",
    "border-rose-200 bg-rose-100/85 text-rose-950",
]

function stableIndex(value: string, modulo: number) {
    let hash = 0
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) >>> 0
    }
    return hash % modulo
}

function brandDomain(name: string, savedDomain?: string | null) {
    // Use the persisted domain from DB first (e.g. peec.ai, profound.ai)
    if (savedDomain) return savedDomain

    const known: Record<string, string> = {
        "peec ai": "peec.ai",
        peec: "peec.ai",
        peecai: "peec.ai",
        profound: "profound.ai",
        airops: "airops.com",
        "air ops": "airops.com",
        "otterly ai": "otterly.ai",
        otterly: "otterly.ai",
        "scrunch ai": "scrunch.com",
        scrunch: "scrunch.com",
        "se ranking": "seranking.com",
        seranking: "seranking.com",
        "brand24": "brand24.com",
        evertune: "evertune.ai",
        "6sense": "6sense.com",
        apollo: "apollo.io",
        "apollo.io": "apollo.io",
        demandbase: "demandbase.com",
        zoominfo: "zoominfo.com",
        rollworks: "rollworks.com",
        lusha: "lusha.com",
        clay: "clay.com",
        clearbit: "clearbit.com",
        bombora: "bombora.com",
        "linkedin sales navigator": "linkedin.com",
        linkedin: "linkedin.com",
    }
    const key = name.toLowerCase().trim()
    return known[key] ?? `${key.replace(/[^a-z0-9]/g, "")}.com`
}

function cleanRawResponse(value: string) {
    let text = value
        .replace(/\n[A-Z][A-Za-z0-9 ._-]{2,40}\n\+1\n/g, "\n")
        .replace(/\n\+1\n/g, "\n")
        .replace(/^\s*[-*_]{3,}\s*$/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim()

    return text
}

function isDividerOnly(value: string) {
    const compact = value.replace(/\s/g, "")
    return compact.length >= 3 && /^[-*_]+$/.test(compact)
}

function normalizeInlineMarkdown(value: string) {
    let text = value
        .replace(/\\([+*_`[\]()])/g, "$1")
        .replace(/^\s*[-*]\s+/, "")
        .replace(/\s+\+\s*\d+\s*$/g, "")
        .trim()

    // Bright Data sometimes returns list labels as "*Label: text" instead of real markdown.
    text = text.replace(/(^|\s)\*([^*\n]{2,80}:)\s*/g, "$1**$2** ")

    return text
}

function extractMarkdownTables(markdown: string) {
    const blocks: Array<
        | { type: "markdown"; content: string }
        | { type: "table"; headers: string[]; rows: string[][] }
    > = []

    const lines = markdown.split("\n")
    let buffer: string[] = []
    let i = 0

    function flushMarkdown() {
        const content = buffer.join("\n").trim()
        if (content) blocks.push({ type: "markdown", content })
        buffer = []
    }

    while (i < lines.length) {
        const line = lines[i]
        const next = lines[i + 1]

        const looksLikeTable =
            line?.trim().startsWith("|") &&
            next?.trim().startsWith("|") &&
            /^(\|\s*:?-{3,}:?\s*)+\|?$/.test(next.trim())

        if (!looksLikeTable) {
            buffer.push(line)
            i++
            continue
        }

        flushMarkdown()

        const tableLines = [line, next]
        i += 2

        while (i < lines.length && lines[i].trim().startsWith("|")) {
            tableLines.push(lines[i])
            i++
        }

        const parseRow = (row: string) =>
            row
                .trim()
                .replace(/^\|/, "")
                .replace(/\|$/, "")
                .split("|")
                .map((cell) => cell.trim())

        const headers = parseRow(tableLines[0])
        const rows = tableLines.slice(2).map(parseRow).filter((row) => row.length > 0)

        blocks.push({ type: "table", headers, rows })
    }

    flushMarkdown()
    return blocks
}

function BrandMentionBadge({ name, domain }: { name: string; domain?: string | null }) {
    const style = HIGHLIGHT_STYLES[stableIndex(name.toLowerCase(), HIGHLIGHT_STYLES.length)]
    const resolvedDomain = brandDomain(name, domain)

    return (
        <span className={cn("mx-0.5 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 align-middle font-semibold shadow-[0_1px_0_rgba(9,9,11,0.04)]", style)}>
            <span className="inline-flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-white/80">
                <img
                    src={`https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=32`}
                    alt=""
                    className="h-3 w-3 object-contain"
                    onError={event => { (event.target as HTMLImageElement).style.display = "none" }}
                />
            </span>
            {name}
        </span>
    )
}

function highlightBrandNames(text: string, brandNames: string[]): React.ReactNode {
    if (brandNames.length === 0 || !text) return text

    const pattern = new RegExp(`(${brandNames.map(escapeRegExp).join("|")})`, "gi")
    const parts = text.split(pattern)

    if (parts.length === 1) return text

    return parts.map((part, i) => {
        const isMatch = brandNames.some(
            (brand) => brand.toLowerCase() === part.toLowerCase(),
        )

        return isMatch ? (
            <BrandMentionBadge key={i} name={part} />
        ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
        )
    })
}

function highlightNode(node: React.ReactNode, brandNames: string[]): React.ReactNode {
    if (typeof node === "string") return highlightBrandNames(node, brandNames)

    if (Array.isArray(node)) {
        return node.map((child, i) => (
            <React.Fragment key={i}>{highlightNode(child, brandNames)}</React.Fragment>
        ))
    }

    return node
}

function CitationChip({
    href,
    children,
}: {
    href?: string
    children?: React.ReactNode
}) {
    const domain = href ? href.replace(/^https?:\/\//, "").split("/")[0] : ""

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 inline-flex items-center gap-1 rounded-md border border-[#e4e4e7] bg-[#f4f4f5] px-2 py-0.5 align-middle text-[11px] font-semibold text-[#52525b] no-underline shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-[#d4d4d8] hover:bg-white hover:text-[#18181b]"
        >
            <Fav domain={domain} />
            {domain || children}
        </a>
    )
}

function DetailMetric({
    label,
    value,
    tone,
}: {
    label: string
    value: string
    tone: "neutral" | "good" | "risk"
}) {
    return (
        <div
            className={cn(
                "rounded-xl border px-3 py-3 shadow-[0_1px_2px_rgba(9,9,11,0.035)]",
                tone === "neutral" && "border-[#e4e4e7] bg-white",
                tone === "good" && "border-emerald-200 bg-emerald-50",
                tone === "risk" && "border-red-200 bg-red-50",
            )}
        >
            <p
                className={cn(
                    "text-[9.5px] font-semibold uppercase tracking-[0.12em]",
                    tone === "neutral" && "text-[#a1a1aa]",
                    tone === "good" && "text-emerald-700",
                    tone === "risk" && "text-red-700",
                )}
            >
                {label}
            </p>

            <p
                className={cn(
                    "mt-1 text-[22px] font-semibold leading-none tracking-[-0.04em]",
                    tone === "neutral" && "text-[#18181b]",
                    tone === "good" && "text-emerald-900",
                    tone === "risk" && "text-red-900",
                )}
            >
                {value}
            </p>
        </div>
    )
}

function renderFormattedText(text: string, brandNames: string[]): React.ReactNode {
    const normalized = normalizeInlineMarkdown(text)
    if (!normalized) return null

    return (
        <ReactMarkdown
            components={{
                p: ({ children }) => <>{highlightNode(children, brandNames)}</>,
                strong: ({ children }) => (
                    <strong className="font-semibold text-[#18181b]">
                        {highlightNode(children, brandNames)}
                    </strong>
                ),
                em: ({ children }) => (
                    <em className="italic text-[#18181b]">
                        {highlightNode(children, brandNames)}
                    </em>
                ),
                code: ({ children }) => (
                    <code className="rounded-md border border-[#e4e4e7] bg-[#fafafa] px-1 py-0.5 text-[0.9em] font-semibold text-[#18181b]">
                        {children}
                    </code>
                ),
                a: ({ href, children }) => (
                    <CitationChip href={href}>{children}</CitationChip>
                ),
            }}
        >
            {normalized}
        </ReactMarkdown>
    )
}

function ComparisonTable({
    headers,
    rows,
    brandNames,
}: {
    headers: string[]
    rows: string[][]
    brandNames: string[]
}) {
    return (
        <div className="my-5 overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                        <tr className="border-b border-[#e4e4e7] bg-[#fafafa]">
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    className="px-3.5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="border-b border-[#e4e4e7] last:border-b-0 hover:bg-[#fafafa]"
                            >
                                {headers.map((header, cellIndex) => {
                                    const value = row[cellIndex] ?? ""

                                    return (
                                        <td
                                            key={`${rowIndex}-${header}`}
                                            className={cn(
                                                "px-3.5 py-3 align-top text-[12.5px] font-medium leading-5 text-[#52525b]",
                                                cellIndex === 0 && "font-semibold text-[#18181b]",
                                            )}
                                        >
                                            {cellIndex === 0 ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#e4e4e7] bg-[#f4f4f5] text-[10px] font-semibold text-[#18181b]">
                                                        {rowIndex + 1}
                                                    </span>
                                                    <span>{renderFormattedText(value, brandNames)}</span>
                                                </span>
                                            ) : (
                                                renderFormattedText(value, brandNames)
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function MarkdownBlock({
    text,
    brandNames,
}: {
    text: string
    brandNames: string[]
}) {
    return (
        <ReactMarkdown
            components={{
                h1: ({ children }) => (
                    <h1 className="mb-4 mt-5 text-[26px] font-semibold leading-tight tracking-[-0.04em] text-[#18181b] first:mt-0">
                        {highlightNode(children, brandNames)}
                    </h1>
                ),
                h2: ({ children }) => (
                    <h2 className="mb-3 mt-8 border-t border-[#e4e4e7] pt-6 text-[22px] font-semibold leading-tight tracking-[-0.035em] text-[#18181b]">
                        {highlightNode(children, brandNames)}
                    </h2>
                ),
                h3: ({ children }) => (
                    <h3 className="mb-2 mt-6 text-[16px] font-semibold tracking-[-0.02em] text-[#18181b]">
                        {highlightNode(children, brandNames)}
                    </h3>
                ),
                p: ({ children }) => (
                    <p className="mb-4 text-[15px] font-medium leading-7 text-[#27272a] last:mb-0">
                        {highlightNode(children, brandNames)}
                    </p>
                ),
                ul: ({ children }) => (
                    <ul className="mb-5 ml-5 list-disc space-y-2">
                        {children}
                    </ul>
                ),
                ol: ({ children }) => (
                    <ol className="mb-5 ml-5 list-decimal space-y-2">
                        {children}
                    </ol>
                ),
                li: ({ children }) => (
                    <li className="pl-1 text-[15px] font-medium leading-7 text-[#27272a] marker:text-[#09090b]">
                        {highlightNode(children, brandNames)}
                    </li>
                ),
                strong: ({ children }) => (
                    <strong className="font-semibold text-[#18181b]">
                        {highlightNode(children, brandNames)}
                    </strong>
                ),
                a: ({ href, children }) => (
                    <CitationChip href={href}>{children}</CitationChip>
                ),
            }}
        >
            {text}
        </ReactMarkdown>
    )
}

function RichAnswer({
    raw,
    display,
    fallback,
    blocks,
    brandNames,
}: {
    raw?: string | null
    display?: string | null
    fallback: string
    blocks?: AnswerBlock[] | null
    brandNames: string[]
}) {
    // prefer structured blocks → LLM-cleaned display → raw scraper dump → excerpt fallback
    const textToRender = display || raw || fallback || ""

    if (blocks?.length) {
        return (
            <div>
                {blocks.map((block, index) => {
                    if (block.type === "heading") {
                        const text = normalizeInlineMarkdown(block.text)
                        if (!text || isDividerOnly(text)) return null

                        const Tag = block.level === 2 ? "h2" : "h3"
                        return (
                            <Tag
                                key={index}
                                className={cn(
                                    block.level === 2
                                        ? "mb-3 mt-8 border-t border-[#e4e4e7] pt-6 text-[22px] font-semibold leading-tight tracking-[-0.035em] text-[#18181b] first:mt-0 first:border-t-0 first:pt-0"
                                        : "mb-2 mt-6 text-[16px] font-semibold tracking-[-0.02em] text-[#18181b]"
                                )}
                            >
                                {renderFormattedText(text, brandNames)}
                            </Tag>
                        )
                    }

                    if (block.type === "paragraph") {
                        const text = normalizeInlineMarkdown(block.text)
                        if (!text || isDividerOnly(text)) return null

                        return (
                            <p key={index} className="mb-4 text-[15px] font-medium leading-7 text-[#27272a] last:mb-0">
                                {renderFormattedText(text, brandNames)}
                            </p>
                        )
                    }

                    if (block.type === "list") {
                        const items = block.items
                            .map(normalizeInlineMarkdown)
                            .filter((item) => item && !isDividerOnly(item))

                        if (items.length === 0) return null

                        return (
                            <ul key={index} className="mb-5 ml-5 list-disc space-y-2">
                                {items.map((item, itemIndex) => (
                                    <li key={itemIndex} className="pl-1 text-[15px] font-medium leading-7 text-[#27272a] marker:text-[#09090b]">
                                        {renderFormattedText(item, brandNames)}
                                    </li>
                                ))}
                            </ul>
                        )
                    }

                    return (
                        <ComparisonTable
                            key={index}
                            headers={block.headers}
                            rows={block.rows}
                            brandNames={brandNames}
                        />
                    )
                })}
            </div>
        )
    }

    const cleaned = cleanRawResponse(textToRender)
    const fallbackBlocks = extractMarkdownTables(cleaned)

    if (!cleaned) {
        return (
            <p className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] px-4 py-3 text-[13px] font-medium text-[#71717a]">
                No response text captured.
            </p>
        )
    }

    return (
        <div>
            {fallbackBlocks.map((block, index) => {
                if (block.type === "table") {
                    return (
                        <ComparisonTable
                            key={index}
                            headers={block.headers}
                            rows={block.rows}
                            brandNames={brandNames}
                        />
                    )
                }

                return (
                    <MarkdownBlock
                        key={index}
                        text={block.content}
                        brandNames={brandNames}
                    />
                )
            })}
        </div>
    )
}

export function ChatModal({ chat, onClose }: { chat: RecentChat; onClose: () => void }) {
    const [isOpeningScreenshot, setIsOpeningScreenshot] = useState(false)
    const [screenshotError, setScreenshotError] = useState<string | null>(null)

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose()
        }

        window.addEventListener("keydown", handleEsc)
        return () => window.removeEventListener("keydown", handleEsc)
    }, [onClose])

    const brandNames = (chat.brand_details ?? [])
        .map((brand) => brand.brand_name)
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)

    const visibleBrands = (chat.brand_details ?? []).slice(0, 6)
    const visibleSources = (chat.sources ?? []).slice(0, 8)

    const sentiment = chat.sentiment_score !== null ? chat.sentiment_score.toFixed(0) : "-"
    const position = chat.brand_position !== null ? `#${chat.brand_position}` : "-"

    const sentimentTone =
        chat.sentiment_score === null
            ? "neutral"
            : chat.sentiment_score >= 60
                ? "good"
                : chat.sentiment_score < 40
                    ? "risk"
                : "neutral"

    async function openScreenshot() {
        if (!chat.has_screenshot || isOpeningScreenshot) return
        setIsOpeningScreenshot(true)
        setScreenshotError(null)
        try {
            const response = await api.get<{ url: string }>(`/artifacts/chats/${chat.id}/screenshot-url`)
            window.open(response.data.url, "_blank", "noopener,noreferrer")
        } catch {
            setScreenshotError("Screenshot is not available anymore.")
        } finally {
            setIsOpeningScreenshot(false)
        }
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#09090b]/45"
            style={{
                animation: "chatModalBackdropIn 220ms ease-out forwards",
            }}
            onClick={onClose}
        >
            <style>{`
        @keyframes chatModalBackdropIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes chatModalPanelIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

            <div
                className="relative flex overflow-hidden rounded-[18px] border border-[#e4e4e7] bg-white shadow-[0_34px_110px_-38px_rgba(9,9,11,0.78)]"
                style={{
                    width: "min(1280px, calc(100vw - 72px))",
                    height: "min(730px, calc(100vh - 105px))",
                    animation: "chatModalPanelIn 260ms cubic-bezier(0.16,1,0.3,1) 35ms both",
                    willChange: "transform, opacity",
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <section className="flex min-w-0 flex-1 flex-col bg-white">
                    <header className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#e4e4e7] bg-[#fafafa] px-4">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e4e4e7] bg-white text-[#18181b] shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
                                <EngIcon model={chat.ai_model} />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#18181b]">
                                        {formatModelName(chat.ai_model)}
                                    </span>

                                    <span className="inline-flex items-center gap-1 rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[11px] font-medium text-[#52525b]">
                                        <MapPin size={11} />
                                        US
                                    </span>

                                    <span className="text-[11px] font-medium text-[#a1a1aa]">
                                        {timeAgo(chat.ran_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button className="hidden items-center gap-1.5 rounded-lg border border-[#e4e4e7] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[#52525b] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-[#d4d4d8] hover:text-[#18181b] md:flex">
                            View prompt
                            <ExternalLink size={12} />
                        </button>
                    </header>

                    <main className="min-h-0 flex-1 overflow-y-auto bg-white">
                        <div className="mx-auto max-w-[880px] px-8 py-6">
                            <div className="mb-7 flex justify-end gap-2.5">
                                <div className="max-w-[650px] rounded-2xl rounded-tr-md bg-[#f4f4f5] px-4 py-3 text-[14px] font-semibold leading-6 text-[#18181b] shadow-[inset_0_0_0_1px_rgba(228,228,231,0.75)]">
                                    <span>
                                        {chat.prompt_text}
                                    </span>
                                </div>

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[#71717a] shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
                                    <UserRound size={15} />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dbeafe] bg-white text-[#18181b] shadow-[0_2px_8px_rgba(37,99,235,0.10)]">
                                    <EngIcon model={chat.ai_model} />
                                </div>

                                <article className="min-w-0 flex-1 border-t border-[#e4e4e7] pt-4">
                                    <div className="mb-4 flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#e4e4e7] bg-[#fafafa] text-[#71717a]">
                                            <MessageSquareText size={13} />
                                        </span>

                                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa]">
                                            Model answer
                                        </span>
                                    </div>

                                    <RichAnswer
                                        raw={chat.raw_response}
                                        display={chat.display_response}
                                        fallback={chat.excerpt}
                                        blocks={chat.answer_blocks}
                                        brandNames={brandNames}
                                    />
                                </article>
                            </div>
                        </div>
                    </main>
                </section>

                <aside className="flex w-[376px] shrink-0 flex-col border-l border-[#e4e4e7] bg-[#fafafa]">
                    <header className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#e4e4e7] bg-[#fafafa] px-4">
                        <div>
                            <p className="text-[13px] font-semibold text-[#18181b]">Details</p>
                            <p className="mt-0.5 text-[11px] font-medium text-[#a1a1aa]">
                                Brands, sources, sentiment
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e4e4e7] bg-white text-[#71717a] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-[#d4d4d8] hover:bg-[#f4f4f5] hover:text-[#18181b]"
                            aria-label="Close chat details"
                        >
                            <X size={15} />
                        </button>
                    </header>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                        {chat.has_screenshot && (
                            <section className="mb-4 rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3 py-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#1d4ed8]">
                                            Scrape screenshot
                                        </p>
                                        <p className="mt-1 text-[11.5px] font-medium leading-5 text-[#475569]">
                                            Private cloud artifact. Link expires shortly and is cached by PromptPulse.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void openScreenshot()}
                                        disabled={isOpeningScreenshot}
                                        className="shrink-0 rounded-lg bg-[#1d4ed8] px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_8px_20px_-14px_rgba(29,78,216,0.8)] transition hover:bg-[#1e40af] disabled:cursor-wait disabled:opacity-60"
                                    >
                                        {isOpeningScreenshot ? "Opening..." : "View"}
                                    </button>
                                </div>
                                {screenshotError && (
                                    <p className="mt-2 text-[11px] font-semibold text-[#b42318]">{screenshotError}</p>
                                )}
                            </section>
                        )}

                        {visibleSources.length > 0 && (
                            <section>
                                <div className="mb-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
                                        <Globe2 size={13} />
                                        Sources
                                    </div>
                                    <span className="rounded-full border border-[#e4e4e7] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#71717a]">
                                        {visibleSources.length}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    {visibleSources.map((source, index) => (
                                        <a
                                            key={`${source.url}-${index}`}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-start gap-2.5 rounded-lg px-1.5 py-2 transition hover:bg-white hover:shadow-[0_1px_2px_rgba(9,9,11,0.04)]"
                                        >
                                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#e4e4e7] bg-white">
                                                <Fav domain={source.domain} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-1 text-[12px] font-semibold leading-5 text-[#27272a]">
                                                    {source.title || source.domain}
                                                </p>

                                                <p className="line-clamp-2 break-all text-[11px] font-medium leading-4 text-[#a1a1aa]">
                                                    {source.url || source.domain}
                                                </p>
                                            </div>

                                            <ArrowUpRight
                                                size={13}
                                                className="mt-1 shrink-0 text-[#a1a1aa] opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#18181b] group-hover:opacity-100"
                                            />
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {visibleBrands.length > 0 && (
                            <section className="mt-5 border-t border-[#e4e4e7] pt-4">
                                <div className="mb-2.5 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
                                    <Building2 size={13} />
                                    Brands mentioned
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {visibleBrands.map((brand, index) => {
                                        const style = HIGHLIGHT_STYLES[stableIndex(brand.brand_name.toLowerCase(), HIGHLIGHT_STYLES.length)]

                                        return (
                                            <div
                                                key={`${brand.brand_name}-${index}`}
                                                className={cn("inline-flex items-center gap-2 rounded-full border px-2 py-1.5 shadow-[0_1px_0_rgba(9,9,11,0.04)]", style)}
                                            >
                                                <Avatar
                                                    name={brand.brand_name}
                                                    url={`https://${brandDomain(brand.brand_name, brand.domain)}`}
                                                />
                                                <span className="max-w-[130px] truncate text-[12px] font-semibold">
                                                    {brand.brand_name}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        getSentimentColor(brand.sentiment_score),
                                                    )}
                                                />
                                                <span className="text-[11px] font-bold tabular-nums">
                                                    {brand.sentiment_score !== null
                                                        ? brand.sentiment_score.toFixed(0)
                                                        : "-"}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        )}

                        <section className="mt-5 border-t border-[#e4e4e7] pt-4">
                            <div className="mb-2.5 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
                                <BookOpen size={13} />
                                Fanout query
                            </div>

                            <div className="rounded-xl border border-[#e4e4e7] bg-white px-3 py-3 shadow-[0_1px_2px_rgba(9,9,11,0.035)]">
                                <p className="text-[12px] font-medium leading-5 text-[#52525b]">
                                    {chat.prompt_text}
                                </p>
                            </div>
                        </section>

                        <section className="mt-5 border-t border-[#e4e4e7] pt-4">
                            <div className="grid grid-cols-2 gap-2">
                                <DetailMetric label="Sentiment" value={sentiment} tone={sentimentTone} />
                                <DetailMetric label="Position" value={position} tone="neutral" />
                            </div>
                        </section>

                        {visibleBrands.length === 0 && visibleSources.length === 0 && (
                            <div className="mt-8 rounded-xl border border-dashed border-[#d4d4d8] bg-white px-4 py-8 text-center">
                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-[#e4e4e7] bg-[#fafafa] text-[#a1a1aa]">
                                    <BookOpen size={18} />
                                </div>

                                <p className="mt-3 text-[12.5px] font-semibold text-[#18181b]">
                                    No details captured
                                </p>

                                <p className="mt-1 text-[11.5px] leading-5 text-[#71717a]">
                                    Brands and sources will appear here after analysis captures them.
                                </p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>,
        document.body
    )
}

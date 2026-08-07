import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
    ArrowUp,
    Expand,
    FileText,
    MessageSquarePlus,
    Minimize2,
    PanelLeft,
    Sparkles,
    X,
} from "lucide-react"
import { useProjects } from "@/hooks/useProjects"
import { useSara, type SaraMessage } from "@/hooks/useSara"
import saraAvatar from "@/assets/sara-avatar.png"

type SaraChatSurfaceProps = {
    mode: "panel" | "page"
    onClose?: () => void
    onExpand?: () => void
    onMinimize?: () => void
}

const pageLabels: Record<string, string> = {
    "/dashboard": "Overview",
    "/prompts": "Prompts",
    "/sources": "Sources",
    "/competitors": "Competitors",
    "/chat": "Chat",
}

function SaraAvatar({ size = 32 }: { size?: number }) {
    return (
        <span
            className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_14px_30px_-18px_rgba(37,99,235,0.95)] ring-1 ring-white/55"
            style={{ width: size, height: size }}
        >
            <img src={saraAvatar} alt="Sara" className="h-full w-full object-cover" />
        </span>
    )
}

function ReadyBadge() {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-[3px] text-[10px] font-semibold text-emerald-700">
            <span className="relative flex h-[6px] w-[6px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#12B76A] opacity-60" />
                <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-[#12B76A]" />
            </span>
            Ready
        </span>
    )
}

export function SaraChatSurface({ mode, onClose, onExpand, onMinimize }: SaraChatSurfaceProps) {
    const { selectedProjectId, selectedProject } = useProjects()
    const location = useLocation()
    const sara = useSara(selectedProjectId)
    const [input, setInput] = useState("")
    const [historyOpen, setHistoryOpen] = useState(mode === "page")
    const panelBodyRef = useRef<HTMLDivElement | null>(null)
    const pageBodyRef = useRef<HTMLDivElement | null>(null)
    const pageContext = pageLabels[location.pathname] ?? "Dashboard"
    const lastMessage = sara.messages[sara.messages.length - 1]

    useEffect(() => {
        const container = mode === "panel" ? panelBodyRef.current : pageBodyRef.current
        if (!container) return

        container.scrollTo({
            top: container.scrollHeight,
            behavior: sara.isSending ? "auto" : "smooth",
        })
    }, [mode, sara.messages.length, lastMessage?.content, sara.isSending])

    const hasStarted = sara.messages.length > 0
    const recommendations = useMemo(() => {
        if (hasStarted) return []
        return sara.readiness?.recommendations?.length
            ? sara.readiness.recommendations
            : [
                "Summarize visibility movement",
                "Prioritize the next fix",
                "Find competitor pressure",
                "Review source opportunities",
            ]
    }, [hasStarted, sara.readiness?.recommendations])

    async function submit(value = input) {
        const message = value.trim()
        if (!message || sara.isSending || !sara.readiness?.is_ready) return
        setInput("")
        await sara.sendMessage(message, pageContext)
    }

    const shellClass =
        mode === "page"
            ? "sara-surface sara-page flex overflow-hidden"
            : "sara-surface sara-panel flex flex-col overflow-hidden"

    if (mode === "panel") {
        return (
            <div className={shellClass}>
                <SaraHeader
                    pageContext={pageContext}
                    projectName={selectedProject?.brand_name ?? "Project"}
                    onNewChat={sara.startNewConversation}
                    onExpand={onExpand}
                    onClose={onClose}
                />

                {!sara.readiness?.is_ready ? (
                    <LockedState readiness={sara.readiness} compact />
                ) : (
                    <>
                        <div ref={panelBodyRef} className="sara-body flex-1 overflow-y-auto px-4 py-5">
                            <SaraBody
                                isLoading={sara.isLoading}
                                isSending={sara.isSending}
                                messages={sara.messages}
                                recommendations={recommendations}
                                onRecommendation={(item) => void submit(item)}
                                compact
                            />
                        </div>
                        <SaraInput
                            value={input}
                            onChange={setInput}
                            onSubmit={() => void submit()}
                            isSending={sara.isSending}
                            compact
                        />
                    </>
                )}
            </div>
        )
    }

    return (
        <div className={shellClass}>
            {historyOpen && (
                <aside className="sara-history hidden w-[248px] flex-shrink-0 md:block">
                    <div className="border-b border-slate-200 p-3">
                        <button
                            type="button"
                            onClick={sara.startNewConversation}
                            className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-[12.5px] font-bold text-white shadow-[0_10px_20px_-10px_rgba(37,99,235,0.8)] transition hover:bg-blue-500"
                        >
                            <MessageSquarePlus size={14} strokeWidth={2.25} />
                            New chat
                        </button>
                    </div>
                    <div className="sara-history-scroll max-h-full overflow-y-auto p-2">
                        {sara.conversations.length === 0 ? (
                            <p className="px-2 py-3 text-[12px] leading-relaxed text-slate-500">
                                No previous conversations yet.
                            </p>
                        ) : (
                            sara.conversations.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    type="button"
                                    onClick={() => sara.loadMessages(conversation.id)}
                                    className={[
                                        "group relative mb-1 w-full rounded-xl py-2 pl-3 pr-2.5 text-left transition",
                                        sara.activeConversationId === conversation.id
                                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200 font-semibold"
                                            : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900",
                                    ].join(" ")}
                                >
                                    {sara.activeConversationId === conversation.id && (
                                        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    )}
                                    <span className="line-clamp-2 text-[12.5px] font-medium leading-snug">
                                        {conversation.title ?? "Sara conversation"}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </aside>
            )}

            <section className="flex min-w-0 flex-1 flex-col bg-[#f8fafc]">
                <header className="sara-header flex h-[64px] flex-shrink-0 items-center gap-3 px-4">
                    <button
                        type="button"
                        onClick={() => setHistoryOpen((open) => !open)}
                        className="sara-icon-button"
                        title="Conversation history"
                    >
                        <PanelLeft size={15} strokeWidth={2} />
                    </button>
                    <SaraTitle projectName={selectedProject?.brand_name ?? "Project"} pageContext={pageContext} />
                    <button
                        type="button"
                        onClick={onMinimize}
                        className="flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        <Minimize2 size={13} strokeWidth={2} />
                        Minimize
                    </button>
                </header>

                {!sara.readiness?.is_ready ? (
                    <LockedState readiness={sara.readiness} />
                ) : (
                    <>
                        <div ref={pageBodyRef} className="sara-body flex-1 overflow-y-auto px-6 py-6">
                            <SaraBody
                                isLoading={sara.isLoading}
                                isSending={sara.isSending}
                                messages={sara.messages}
                                recommendations={recommendations}
                                onRecommendation={(item) => void submit(item)}
                            />
                        </div>
                        <SaraInput
                            value={input}
                            onChange={setInput}
                            onSubmit={() => void submit()}
                            isSending={sara.isSending}
                        />
                    </>
                )}
            </section>
        </div>
    )
}

function SaraHeader({
    projectName,
    pageContext,
    onNewChat,
    onExpand,
    onClose,
}: {
    projectName: string
    pageContext: string
    onNewChat: () => void
    onExpand?: () => void
    onClose?: () => void
}) {
    return (
        <header className="sara-header flex h-[64px] flex-shrink-0 items-center gap-3 px-4">
            <SaraTitle projectName={projectName} pageContext={pageContext} />
            <button type="button" onClick={onNewChat} className="sara-icon-button" title="New chat">
                <MessageSquarePlus size={16} strokeWidth={2} />
            </button>
            <button type="button" onClick={onExpand} className="sara-icon-button" title="Expand">
                <Expand size={14} strokeWidth={2} />
            </button>
            <button type="button" onClick={onClose} className="sara-icon-button" title="Close">
                <X size={16} strokeWidth={2} />
            </button>
        </header>
    )
}

function SaraTitle({ projectName, pageContext }: { projectName: string; pageContext: string }) {
    return (
        <>
            <SaraAvatar size={32} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-slate-900">Sara</h2>
                    <ReadyBadge />
                </div>
                <p className="truncate text-[11.5px] text-slate-500">
                    {projectName} / {pageContext}
                </p>
            </div>
        </>
    )
}

function LockedState({
    readiness,
    compact = false,
}: {
    readiness: { days_available: number; required_days: number } | null
    compact?: boolean
}) {
    return (
        <div className="sara-body flex flex-1 items-center justify-center p-8 text-center">
            <div className={compact ? "max-w-[280px]" : "max-w-[340px]"}>
                <div className="mx-auto mb-4 flex justify-center">
                    <SaraAvatar size={compact ? 40 : 46} />
                </div>
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#0F172A]">
                    Sara unlocks after 1 day
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-[#667085]">
                    This project has{" "}
                    <span className="font-medium text-[#344054]">
                        {readiness?.days_available ?? 0} of {readiness?.required_days ?? 7}
                    </span>{" "}
                    required days of data.
                </p>
            </div>
        </div>
    )
}

function SaraBody({
    isLoading,
    isSending,
    messages,
    recommendations,
    onRecommendation,
    compact = false,
}: {
    isLoading: boolean
    isSending: boolean
    messages: SaraMessage[]
    recommendations: string[]
    onRecommendation: (item: string) => void
    compact?: boolean
}) {
    if (isLoading) {
        return <p className="pt-12 text-center text-[12.5px] text-[#98A2B3]">Loading conversation...</p>
    }

    if (messages.length === 0) {
        return (
            <div className={compact ? "flex min-h-full flex-col justify-center" : "mx-auto flex min-h-full max-w-[760px] flex-col justify-center"}>
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">
                    <Sparkles size={12} strokeWidth={2.2} />
                    Decision intelligence
                </div>
                <h3 className={compact ? "mb-2 text-[19px] font-black leading-tight tracking-[-0.04em] text-slate-950" : "mb-3 max-w-[520px] text-[28px] font-black leading-[1.04] tracking-[-0.055em] text-slate-950"}>
                    {compact
                        ? "Ask Sara where attention should go next."
                        : "Turn your AI visibility data into the next best move."}
                </h3>
                <p className={compact ? "mb-5 text-[12.5px] leading-5 text-slate-500" : "mb-6 max-w-[560px] text-[13.5px] leading-6 text-slate-500"}>
                    Sara explains what changed, why competitors moved, and which sources or prompts deserve attention first.
                </p>
                <div className={compact ? "grid gap-2.5" : "grid gap-2.5 sm:grid-cols-2"}>
                    {recommendations.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onRecommendation(item)}
                            className="sara-recommendation group flex items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[13px] font-semibold text-slate-700 transition hover:-translate-y-[1px]"
                        >
                            {item}
                            <ArrowUp
                                size={13}
                                strokeWidth={2.25}
                                className="rotate-45 text-[#C4C9D4] transition group-hover:text-[#2563EB]"
                            />
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    const lastMessage = messages[messages.length - 1]
    const shouldShowTypingDots = isSending && (!lastMessage || lastMessage.role !== "ASSISTANT" || !lastMessage.content)

    return (
        <div className={compact ? "space-y-4" : "mx-auto max-w-[880px] space-y-5"}>
            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}
            {shouldShowTypingDots && (
                <div className="flex items-center gap-2 pl-1">
                    <SaraAvatar size={22} />
                    <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C4C9D4] [animation-delay:-0.2s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C4C9D4]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C4C9D4] [animation-delay:0.2s]" />
                    </span>
                </div>
            )}
        </div>
    )
}

function SaraInput({
    value,
    onChange,
    onSubmit,
    isSending,
    compact = false,
}: {
    value: string
    onChange: (value: string) => void
    onSubmit: () => void
    isSending: boolean
    compact?: boolean
}) {
    return (
        <form
            className={compact ? "flex-shrink-0 border-t border-slate-200/80 bg-[#f8fafc] p-3" : "border-t border-slate-200/80 bg-[#f8fafc] p-4"}
            onSubmit={(event) => {
                event.preventDefault()
                onSubmit()
            }}
        >
            <div className={compact ? "sara-input-shell flex items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 transition" : "sara-input-shell mx-auto flex max-w-[980px] items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 transition"}>
                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault()
                            onSubmit()
                        }
                    }}
                    placeholder="Ask Sara what to fix next..."
                    className="min-w-0 flex-1 bg-transparent text-[13px] leading-5 text-[#101828] outline-none placeholder:text-[#98A2B3]"
                />
                <button
                    type="submit"
                    disabled={!value.trim() || isSending}
                    className={compact ? "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white transition hover:bg-[#1D4ED8] disabled:bg-[#E2E5EA] disabled:text-[#98A2B3]" : "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white transition hover:bg-[#1D4ED8] disabled:bg-[#E2E5EA] disabled:text-[#98A2B3]"}
                >
                    <ArrowUp size={compact ? 15 : 16} strokeWidth={2.25} />
                </button>
            </div>
        </form>
    )
}

function MessageBubble({ message }: { message: SaraMessage }) {
    const isUser = message.role === "USER"
    const citations = message.citations ?? []

    if (!isUser && !message.content.trim()) {
        return null
    }

    return (
        <div className={["flex items-start gap-2.5", isUser ? "justify-end" : "justify-start"].join(" ")}>
            {!isUser && <SaraAvatar size={24} />}
            <div
                className={[
                    isUser
                        ? "sara-user-bubble max-w-[76%] rounded-[18px] px-4 py-3 text-[13px] leading-6 text-white"
                        : "sara-assistant-bubble max-w-[82%] rounded-[20px] px-4 py-3.5 text-[13px] leading-6 text-[#1D2939]",
                ].join(" ")}
            >
                {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                    <SaraMarkdown content={message.content} />
                )}
                {!isUser && citations.length > 0 && (
                    <div className="mt-3 grid gap-1.5 border-t border-slate-200/80 pt-3">
                        {citations.slice(0, 3).map((citation) => (
                            <div
                                key={`${citation.evidence_id}-${citation.title}`}
                                className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2"
                            >
                                <FileText size={13} strokeWidth={2.1} className="mt-0.5 flex-shrink-0 text-blue-600" />
                                <div className="min-w-0">
                                    <p className="truncate text-[11.5px] font-bold leading-4 text-slate-800">
                                        {citation.title}
                                    </p>
                                    {citation.reason && (
                                        <p className="line-clamp-2 text-[11px] leading-4 text-slate-500">
                                            {citation.reason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!isUser && message.suggested_actions?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-200/80 pt-3">
                        {message.suggested_actions.slice(0, 3).map((action) => (
                            <span key={action} className="sara-action-pill">
                                {action}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function SaraMarkdown({ content }: { content: string }) {
    const normalized = normalizeSaraMarkdown(content)

    return (
        <div className="sara-markdown">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    table: ({ children }) => (
                        <div className="my-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <table className="w-full border-collapse text-left text-[12px] leading-5">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-slate-50 text-slate-500">{children}</thead>,
                    th: ({ children }) => <th className="border-b border-slate-200 px-3 py-2 font-bold">{children}</th>,
                    td: ({ children }) => <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-700">{children}</td>,
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
                    ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
                    code: ({ children }) => <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px] font-semibold text-slate-800">{children}</code>,
                }}
            >
                {normalized}
            </ReactMarkdown>
        </div>
    )
}

function normalizeSaraMarkdown(content: string) {
    const lines = content.split("\n")
    const normalizedLines = lines.flatMap(line => normalizeCompactMarkdownTableLine(line))
    return normalizedLines.join("\n")
}

function normalizeCompactMarkdownTableLine(line: string) {
    const trimmed = line.trim()
    if (!looksLikeCompactMarkdownTable(trimmed)) return [line]

    const prefix = line.slice(0, line.indexOf("|")).trim()
    const tableText = line.slice(line.indexOf("|")).trim()
    const rows = tableText
        .split(/\s+\|\s+(?=\|)/g)
        .map(row => row.trim())
        .filter(Boolean)
        .map(row => row.startsWith("|") ? row : `| ${row}`)

    if (rows.length < 2) return [line]
    return [prefix, "", ...rows, ""].filter((item, index) => item || index > 0)
}

function looksLikeCompactMarkdownTable(value: string) {
    if (!value.includes("|")) return false
    if (!/\|\s*:?-{3,}:?\s*\|/.test(value)) return false
    const pipeCount = (value.match(/\|/g) ?? []).length
    return pipeCount >= 8
}

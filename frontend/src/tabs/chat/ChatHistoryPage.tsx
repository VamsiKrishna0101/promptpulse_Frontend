import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, MessageSquareText, Search, X } from "lucide-react"
import { ChatModal } from "@/components/chat/ChatModal"
import { useFilters } from "@/hooks/useFilters"
import { useProjects } from "@/hooks/useProjects"
import { useChatsPage } from "@/hooks/useRecentChats"
import type { RecentChat } from "@/hooks/useRecentChats"
import { Avatar, EngIcon, Fav, Sk, timeAgo } from "@/tabs/overview/overview"
import { formatModelName } from "@/lib/aiModels"

const PAGE_SIZE = 10

function metricValue(value: number | null, suffix = "") {
    if (value == null) return "-"
    return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}${suffix}`
}

function ChatHistorySkeleton() {
    return (
        <div className="flex flex-col">
            {[...Array(8)].map((_, i) => (
                <div key={i} className={`grid grid-cols-[170px_minmax(240px,1.15fr)_minmax(260px,1.4fr)_180px_120px] items-center gap-4 px-4 py-3 ${i % 2 === 0 ? "premium-row-even" : "premium-row-odd"}`}>
                    <Sk cls="h-7 w-28 rounded-full" />
                    <Sk cls="h-4 w-full" />
                    <Sk cls="h-4 w-full" />
                    <Sk cls="h-7 w-32" />
                    <Sk cls="h-4 w-16" />
                </div>
            ))}
        </div>
    )
}

function ChatRow({ chat, index, onOpen }: { chat: RecentChat; index: number; onOpen: () => void }) {
    const topBrands = (chat.brand_details ?? []).slice(0, 3)
    const topSources = (chat.sources ?? []).slice(0, 3)

    return (
        <button
            onClick={onOpen}
            className={`grid w-full grid-cols-[170px_minmax(240px,1.15fr)_minmax(260px,1.4fr)_180px_120px] items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-blue-50/70 ${index % 2 === 0 ? "premium-row-even" : "premium-row-odd"}`}
        >
            <div className="flex min-w-0 items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-zinc-800 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
                    <EngIcon model={chat.ai_model} />
                    {formatModelName(chat.ai_model)}
                </div>
                <span className="text-[11px] font-medium text-zinc-400">{timeAgo(chat.ran_at)}</span>
            </div>

            <div className="min-w-0">
                <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-zinc-800">{chat.prompt_text}</p>
            </div>

            <div className="min-w-0">
                <p className="line-clamp-2 text-[12px] font-medium leading-relaxed text-zinc-500">{chat.excerpt}</p>
            </div>

            <div className="flex min-w-0 items-center gap-1.5">
                {topBrands.length > 0 ? topBrands.map((brand) => (
                    <div key={brand.brand_name} className="flex min-w-0 items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-1">
                        <Avatar name={brand.brand_name} url={`https://${brand.brand_name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`} />
                        <span className="max-w-[72px] truncate text-[11px] font-semibold text-zinc-700">{brand.brand_name}</span>
                    </div>
                )) : (
                    <span className="text-[11px] font-medium text-zinc-400">No brands</span>
                )}
                {(chat.brand_details?.length ?? 0) > topBrands.length && (
                    <span className="text-[11px] font-semibold text-zinc-400">+{(chat.brand_details?.length ?? 0) - topBrands.length}</span>
                )}
            </div>

            <div className="flex items-center justify-end gap-3">
                <div className="hidden items-center gap-1 xl:flex">
                    {topSources.map((source) => <Fav key={source.url} domain={source.domain} />)}
                </div>
                <div className="text-right">
                    <p className="text-[12px] font-bold tabular-nums text-zinc-800">{metricValue(chat.sentiment_score)}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Sentiment</p>
                </div>
            </div>
        </button>
    )
}

export function ChatHistoryPage() {
    const topRef = useRef<HTMLDivElement>(null)
    const { selectedProject } = useProjects()
    const projectId = selectedProject?.id ?? null
    const { queryString } = useFilters()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const deferredSearch = useDeferredValue(search)
    const [selectedChat, setSelectedChat] = useState<RecentChat | null>(null)
    const chatQueryString = useMemo(() => {
        const params = new URLSearchParams(queryString.startsWith("?") ? queryString.slice(1) : queryString)
        const q = deferredSearch.trim()
        if (q) params.set("q", q)
        return params.toString() ? `?${params.toString()}` : ""
    }, [queryString, deferredSearch])
    const { chats, total, total_pages, isLoading } = useChatsPage(projectId, chatQueryString, page, PAGE_SIZE)

    useEffect(() => {
        setPage(1)
    }, [chatQueryString, projectId])

    const firstItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
    const lastItem = Math.min(page * PAGE_SIZE, total)

    function goToPage(nextPage: number) {
        setPage(nextPage)
        requestAnimationFrame(() => {
            topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        })
    }

    return (
        <div ref={topRef} className="scroll-mt-28 flex flex-col gap-3 pb-20">
            <div data-product-tour-id="chat-history-shell" className="dashboard-card">
                <div className="dashboard-card-header flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-[0_8px_18px_-10px_rgba(0,0,0,0.8)]">
                            <MessageSquareText size={16} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="dashboard-card-title">Full Chat History</h2>
                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500">{total} chats</span>
                            </div>
                            <p className="dashboard-card-subtitle">All model responses for {selectedProject?.brand_name ?? "your brand"}, filtered by the controls above.</p>
                        </div>
                    </div>
                    <div className="relative w-full xl:w-[360px]">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search prompt, response, brand, source..."
                            className="h-9 w-full rounded-lg border border-zinc-200 bg-[#f8f8f9] pl-9 pr-9 text-[12px] font-medium text-zinc-700 outline-none transition focus:border-zinc-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,24,27,0.06)]"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700"
                                aria-label="Clear search"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[980px] xl:min-w-[1040px]">
                        <div className="grid grid-cols-[170px_minmax(240px,1.15fr)_minmax(260px,1.4fr)_180px_120px] gap-4 border-b border-slate-200/80 bg-slate-50/80 px-4 py-2.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Model / Time</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Prompt</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Response Preview</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Brands</span>
                            <span className="text-right text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Score</span>
                        </div>

                        {isLoading ? (
                            <ChatHistorySkeleton />
                        ) : chats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                                    <MessageSquareText size={18} />
                                </div>
                                <p className="text-[13px] font-semibold text-zinc-700">No chats found</p>
                                <p className="max-w-md text-[12px] leading-relaxed text-zinc-400">Try changing the date, model, or topic filters to see more responses.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {chats.map((chat, index) => (
                                    <ChatRow key={chat.id} chat={chat} index={index} onOpen={() => setSelectedChat(chat)} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 bg-white/80 px-4 py-3">
                    <p className="text-[12px] font-medium text-zinc-500">
                        Showing <span className="font-semibold text-zinc-800">{firstItem}-{lastItem}</span> of <span className="font-semibold text-zinc-800">{total}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(Math.max(1, page - 1))}
                            disabled={page <= 1 || isLoading}
                            className="flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-[12px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={14} />
                            Previous
                        </button>
                        <div className="rounded-lg bg-zinc-100 px-3 py-2 text-[12px] font-semibold tabular-nums text-zinc-700">
                            {page} / {total_pages}
                        </div>
                        <button
                            onClick={() => goToPage(Math.min(total_pages, page + 1))}
                            disabled={page >= total_pages || isLoading}
                            className="flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-[12px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {selectedChat && <ChatModal chat={selectedChat} onClose={() => setSelectedChat(null)} />}
        </div>
    )
}

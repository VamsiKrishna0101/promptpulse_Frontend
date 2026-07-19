import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useFilters } from "@/hooks/useFilters"
import { useProjects } from "@/hooks/useProjects"
import { usePrompts, type PromptStatus } from "@/hooks/usePrompts"
import { downloadCsvExport } from "@/lib/exportDownload"

const SortIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-zinc-300">
        <path d="M7 9l5-5 5 5" />
        <path d="M17 15l-5 5-5-5" />
    </svg>
)

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
)

const ExportIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
)

const RemoveIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

const CloseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const FolderIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
)

const EyeIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)

const SentimentIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
)

const PositionIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
)

const CHIP_COLORS = [
    "bg-zinc-900",
    "bg-emerald-600",
    "bg-amber-500",
    "bg-rose-500",
    "bg-blue-600",
    "bg-cyan-600",
    "bg-violet-600",
    "bg-fuchsia-600",
]

const PROMPTS_PAGE_SIZE = 20

function chipColor(name: string) {
    let sum = 0
    for (const char of name) sum += char.charCodeAt(0)
    return CHIP_COLORS[sum % CHIP_COLORS.length]
}

function MentionChip({ name }: { name: string }) {
    const letter = name[0]?.toUpperCase() ?? "?"
    return (
        <div
            title={name}
            className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] text-[8.5px] font-bold text-white ${chipColor(name)}`}
        >
            {letter}
        </div>
    )
}

function VolumeBars({ value }: { value: number | null }) {
    const filled = value === null ? 0 : Math.max(1, Math.round((value / 100) * 5))

    return (
        <div className="flex items-center gap-[3px]">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`h-3 w-1 rounded-full ${i < filled ? "bg-emerald-500" : "bg-zinc-200"}`} />
            ))}
        </div>
    )
}

function ColumnHeader({ icon, label }: { icon?: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center justify-between gap-2 text-zinc-400">
            <span className="flex items-center gap-1.5">
                {icon}
                {label}
            </span>
            <SortIcon />
        </div>
    )
}

function StatusTab({
    label,
    count,
    active,
    onClick,
}: {
    label: string
    count: number
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-[13px] transition-all ${active
                ? "bg-white font-semibold text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                : "font-medium text-zinc-500 hover:text-zinc-700"
                }`}
        >
            {label} <span className="ml-1 text-[12px] opacity-70">{count}</span>
        </button>
    )
}

function topicLabel(topic: string | null | undefined) {
    return topic?.trim() || "No topic"
}

function TopicSearchDropdown({
    topics,
    value,
    onChange,
}: {
    topics: string[]
    value: string
    onChange: (topic: string) => void
}) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const filteredTopics = useMemo(() => {
        const needle = query.trim().toLowerCase()
        if (!needle) return topics
        return topics.filter((topic) => topic.toLowerCase().includes(needle))
    }, [topics, query])

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-[13px] font-semibold text-slate-900 outline-none transition hover:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
                <span className={value ? "truncate text-slate-900" : "text-slate-400"}>
                    {value || "Select topic"}
                </span>
                <span className={["text-slate-400 transition-transform", open ? "rotate-180" : ""].join(" ")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.65)]">
                    <div className="border-b border-slate-100 p-2">
                        <div className="relative">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <SearchIcon />
                            </span>
                            <input
                                autoFocus
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search topics..."
                                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-[12.5px] font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto p-1">
                        {filteredTopics.length === 0 ? (
                            <div className="px-3 py-4 text-center text-[12px] font-medium text-slate-400">
                                No topics found
                            </div>
                        ) : (
                            filteredTopics.map((topic) => (
                                <button
                                    key={topic}
                                    type="button"
                                    onClick={() => {
                                        onChange(topic)
                                        setQuery("")
                                        setOpen(false)
                                    }}
                                    className={[
                                        "flex h-9 w-full items-center justify-between rounded-xl px-3 text-left text-[12.5px] transition",
                                        value === topic ? "bg-slate-950 font-bold text-white" : "font-semibold text-slate-700 hover:bg-slate-50",
                                    ].join(" ")}
                                >
                                    <span className="truncate">{topic}</span>
                                    {value === topic && <span className="text-[11px] text-white/70">Selected</span>}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export function PromptsTab() {
    const { selectedProject } = useProjects()
    const projectId = selectedProject?.id ?? null
    const { queryString } = useFilters()
    const navigate = useNavigate()

    const [tab, setTab] = useState<PromptStatus>("ACTIVE")
    const [selectedTopic, setSelectedTopic] = useState("ALL")
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [isAddingTopic, setIsAddingTopic] = useState(false)
    const [newTopicName, setNewTopicName] = useState("")
    const [topicError, setTopicError] = useState<string | null>(null)
    const [isAddPromptOpen, setIsAddPromptOpen] = useState(false)
    const [newPromptText, setNewPromptText] = useState("")
    const [newPromptTopic, setNewPromptTopic] = useState("")
    const [promptError, setPromptError] = useState<string | null>(null)
    const [discoveryMessage, setDiscoveryMessage] = useState<string | null>(null)

    const combinedQuery = queryString ? `${queryString}&status=${tab}` : `?status=${tab}`
    const { prompts, topics: savedTopics, stats, isLoading, isFetching, isCreatingTopic, isCreatingPrompt, isDiscoveringPrompts, activate, deactivate, createTopic, createPrompt, discoverPrompts } = usePrompts(projectId, combinedQuery)

    const activeCount = stats?.byStatus?.["ACTIVE"] ?? 0
    const suggestedCount = stats?.byStatus?.["SUGGESTED"] ?? 0
    const inactiveCount = stats?.byStatus?.["INACTIVE"] ?? 0

    const topicRows = useMemo(() => {
        const counts = new Map<string, number>()
        for (const prompt of prompts) {
            const topic = topicLabel(prompt.topic)
            counts.set(topic, (counts.get(topic) ?? 0) + 1)
        }

        for (const topic of savedTopics) {
            if (!counts.has(topic.name)) counts.set(topic.name, 0)
        }

        return Array.from(counts.entries())
            .map(([topic, count]) => ({ topic, count, isEmpty: count === 0 }))
            .sort((a, b) => a.topic.localeCompare(b.topic))
    }, [prompts, savedTopics])

    const availableTopics = useMemo(() => topicRows.map(({ topic }) => topic).filter((topic) => topic !== "No topic"), [topicRows])

    const visiblePrompts = useMemo(() => {
        const needle = search.trim().toLowerCase()
        return prompts.filter((prompt) => {
            const topicMatches = selectedTopic === "ALL" || topicLabel(prompt.topic) === selectedTopic
            const searchMatches = !needle || prompt.text.toLowerCase().includes(needle) || topicLabel(prompt.topic).toLowerCase().includes(needle)
            return topicMatches && searchMatches
        })
    }, [prompts, search, selectedTopic])

    const pageCount = Math.max(1, Math.ceil(visiblePrompts.length / PROMPTS_PAGE_SIZE))
    const paginatedPrompts = useMemo(() => {
        const start = (page - 1) * PROMPTS_PAGE_SIZE
        return visiblePrompts.slice(start, start + PROMPTS_PAGE_SIZE)
    }, [page, visiblePrompts])

    useEffect(() => {
        setPage(1)
    }, [projectId, queryString, search, selectedTopic, tab])

    useEffect(() => {
        setPage((current) => Math.min(current, pageCount))
    }, [pageCount])

    const summary = useMemo(() => {
        if (!visiblePrompts.length) return { visibility: null, sentiment: null, position: null }
        const avg = (values: Array<number | null>) => {
            const nums = values.filter((value): value is number => value !== null)
            return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : null
        }
        return {
            visibility: avg(visiblePrompts.map((prompt) => prompt.visibility)),
            sentiment: avg(visiblePrompts.map((prompt) => prompt.avg_sentiment)),
            position: avg(visiblePrompts.map((prompt) => prompt.avg_position)),
        }
    }, [visiblePrompts])

    async function submitTopic(event: FormEvent) {
        event.preventDefault()
        setTopicError(null)

        const name = newTopicName.trim().replace(/\s+/g, " ")
        if (name.length < 2) {
            setTopicError("Topic name must be at least 2 characters.")
            return
        }

        try {
            const topic = await createTopic(name)
            setSelectedTopic(topic.name)
            setNewTopicName("")
            setIsAddingTopic(false)
        } catch (err: any) {
            setTopicError(err?.response?.data?.error ?? "Failed to create topic.")
        }
    }

    function openAddPrompt() {
        setPromptError(null)
        setNewPromptText("")
        setNewPromptTopic(selectedTopic !== "ALL" && selectedTopic !== "No topic" ? selectedTopic : availableTopics[0] ?? "")
        setIsAddPromptOpen(true)
    }

    async function submitPrompt(event: FormEvent) {
        event.preventDefault()
        setPromptError(null)

        const text = newPromptText.trim().replace(/\s+/g, " ")
        const topic = newPromptTopic.trim()

        if (text.length < 8) {
            setPromptError("Prompt must be at least 8 characters.")
            return
        }

        if (!topic) {
            setPromptError("Please select a topic.")
            return
        }

        try {
            await createPrompt({ text, topic })
            setTab("ACTIVE")
            setSelectedTopic(topic)
            setNewPromptText("")
            setNewPromptTopic("")
            setIsAddPromptOpen(false)
        } catch (err: any) {
            setPromptError(err?.response?.data?.error ?? "Failed to create prompt.")
        }
    }

    async function runDiscovery() {
        setDiscoveryMessage(null)
        try {
            const result = await discoverPrompts()
            setTab("SUGGESTED")
            setDiscoveryMessage(result.message)
        } catch (err: any) {
            setDiscoveryMessage(err?.response?.data?.error ?? "Failed to discover prompt suggestions.")
        }
    }

    return (
        <div data-product-tour-id="prompts-shell" className="pb-10">
            <div className="dashboard-card grid min-h-[650px] lg:grid-cols-[290px_minmax(0,1fr)]">
                <aside data-product-tour-id="prompts-topics" className="border-r border-slate-200/80 bg-slate-50/70">
                    <div className="dashboard-card-header h-[58px] justify-start">
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-zinc-800">
                            <FolderIcon />
                            All Topics
                        </div>
                    </div>

                    <div className="border-b border-slate-200/80 p-2">
                        <button
                            onClick={() => setSelectedTopic("ALL")}
                            className={`flex h-10 w-full cursor-pointer items-center justify-between rounded-md px-3 text-left text-[13px] transition-colors ${selectedTopic === "ALL"
                                ? "bg-white font-semibold text-slate-950 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.5)]"
                                : "font-medium text-slate-600 hover:bg-white/80"
                                }`}
                        >
                            <span>All prompts</span>
                            <span className="tabular-nums text-zinc-400">{prompts.length}</span>
                        </button>
                    </div>

                    <div className="border-b border-slate-200/80 p-2">
                        {!isAddingTopic ? (
                            <button
                                onClick={() => {
                                    setIsAddingTopic(true)
                                    setTopicError(null)
                                }}
                                className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md px-3 text-left text-[13px] font-semibold text-slate-900 hover:bg-white/80"
                            >
                                <span>Add topic</span>
                                <span className="text-lg font-normal leading-none text-zinc-700">+</span>
                            </button>
                        ) : (
                            <form onSubmit={submitTopic} className="rounded-xl border border-slate-200 bg-white p-2 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.65)]">
                                <input
                                    autoFocus
                                    value={newTopicName}
                                    onChange={(event) => setNewTopicName(event.target.value)}
                                    placeholder="Topic name"
                                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[12.5px] font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                                {topicError && <p className="mt-2 text-[11px] font-semibold text-red-600">{topicError}</p>}
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingTopic(false)
                                            setNewTopicName("")
                                            setTopicError(null)
                                        }}
                                        className="h-8 rounded-lg border border-slate-200 bg-white text-[11.5px] font-bold text-slate-500 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreatingTopic}
                                        className="h-8 rounded-lg bg-slate-950 text-[11.5px] font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isCreatingTopic ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <nav className="space-y-0.5 p-2">
                        {topicRows.map(({ topic, count, isEmpty }) => (
                            <button
                                key={topic}
                                onClick={() => setSelectedTopic(topic)}
                                className={`flex h-9 w-full cursor-pointer items-center justify-between rounded-md px-3 text-left text-[13px] transition-colors ${selectedTopic === topic
                                    ? "bg-white font-semibold text-slate-950 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.5)]"
                                    : "font-medium text-slate-700 hover:bg-white/80"
                                    }`}
                            >
                                <span className="truncate">{topic}</span>
                                <span className={["ml-3 tabular-nums", isEmpty ? "text-slate-300" : "text-zinc-400"].join(" ")}>{count}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                <section className="min-w-0 bg-white/70">
                    <div data-product-tour-id="prompts-controls" className="dashboard-card-header h-[58px]">
                        <div className="inline-flex items-center gap-0.5 rounded-lg bg-zinc-100/80 p-1">
                            <StatusTab label="Active" count={activeCount} active={tab === "ACTIVE"} onClick={() => setTab("ACTIVE")} />
                            <StatusTab label="Suggested" count={suggestedCount} active={tab === "SUGGESTED"} onClick={() => setTab("SUGGESTED")} />
                            <StatusTab label="Inactive" count={inactiveCount} active={tab === "INACTIVE"} onClick={() => setTab("INACTIVE")} />
                        </div>

                        <div className="flex items-center gap-3">
                            {isFetching && (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />
                                    Updating
                                </span>
                            )}
                            <div className="text-[12px] font-medium text-zinc-500">
                                <span>Visibility </span>
                                <strong className="text-zinc-900">{summary.visibility !== null ? `${summary.visibility.toFixed(0)}%` : "-"}</strong>
                                <span className="mx-2 text-zinc-300">|</span>
                                <span>Sentiment </span>
                                <strong className="text-zinc-900">{summary.sentiment !== null ? summary.sentiment.toFixed(0) : "-"}</strong>
                                <span className="mx-2 text-zinc-300">|</span>
                                <span>Position </span>
                                <strong className="text-zinc-900">{summary.position !== null ? `# ${summary.position.toFixed(1)}` : "-"}</strong>
                            </div>
                            <button
                                onClick={() => void runDiscovery()}
                                disabled={isDiscoveringPrompts}
                                className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isDiscoveringPrompts ? "Discovering..." : "Discover prompts"}
                            </button>
                            <button
                                onClick={openAddPrompt}
                                className="cursor-pointer rounded-lg bg-slate-950 px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_12px_24px_-18px_rgba(15,23,42,0.8)] hover:bg-slate-800"
                            >
                                + Add Prompt
                            </button>
                        </div>
                    </div>

                    <div className="flex h-[54px] items-center justify-between border-b border-slate-200/80 px-4">
                        <div className="relative">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
                                <SearchIcon />
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search prompts"
                                className="h-8 w-64 rounded-md border border-zinc-200 bg-white pl-8 pr-3 text-[12px] outline-none placeholder:text-zinc-400 focus:border-zinc-300"
                            />
                        </div>

                        <button
                            onClick={() => void downloadCsvExport(projectId, "prompts", combinedQuery)}
                            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-[12px] font-medium text-zinc-600 hover:bg-zinc-50"
                        >
                            <ExportIcon />
                            Export
                        </button>
                    </div>

                    {discoveryMessage && (
                        <div className="border-b border-slate-200/80 bg-emerald-50 px-4 py-2.5 text-[12px] font-semibold text-emerald-800">
                            {discoveryMessage}
                        </div>
                    )}

                    <div data-product-tour-id="prompts-table" className="overflow-x-auto">
                        <table className="peec-table w-full min-w-[1080px] text-left text-[12px]">
                            <thead>
                                <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[11.5px] font-medium text-slate-400">
                                    <th className="w-[42%] px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" className="cursor-pointer rounded-sm border-zinc-300 text-zinc-900 focus:ring-0" />
                                            <ColumnHeader label="Prompt" />
                                        </div>
                                    </th>
                                    <th className="px-4 py-3">
                                        <ColumnHeader icon={<EyeIcon />} label="Visibility" />
                                    </th>
                                    <th className="px-4 py-3">
                                        <ColumnHeader icon={<SentimentIcon />} label="Sentiment" />
                                    </th>
                                    <th className="px-4 py-3">
                                        <ColumnHeader icon={<PositionIcon />} label="Position" />
                                    </th>
                                    <th className="px-4 py-3 text-zinc-400">Mentions</th>
                                    <th className="px-4 py-3">
                                        <span className="flex items-center gap-1.5 text-zinc-400">
                                            Volume
                                            <span className="rounded bg-brand-50 px-1.5 py-[2px] text-[9.5px] font-bold text-brand-600">
                                                Beta
                                            </span>
                                        </span>
                                    </th>
                                    <th className="w-10 px-4 py-3" />
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading && (
                                    Array.from({ length: 7 }).map((_, index) => (
                                        <tr key={index} className="h-[58px]">
                                            {Array.from({ length: 7 }).map((__, cellIndex) => (
                                                <td key={cellIndex} className="px-4 py-3">
                                                    <div className="h-3 rounded bg-zinc-100" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}

                                {!isLoading && paginatedPrompts.map((prompt, index) => (
                                    <tr
                                        key={prompt.id}
                                        className={`group h-[62px] cursor-pointer transition-colors hover:bg-blue-50/70 ${isFetching ? "opacity-80" : ""} ${index % 2 === 0 ? "premium-row-even" : "premium-row-odd"}`}
                                        onClick={() => navigate(`/prompts/${prompt.id}`)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    onClick={(event) => event.stopPropagation()}
                                                    className="cursor-pointer rounded-sm border-zinc-300 text-zinc-900 focus:ring-0"
                                                />
                                                <div className="min-w-0">
                                                    <div className="line-clamp-1 text-[13px] font-semibold leading-relaxed text-zinc-800">
                                                        {prompt.text}
                                                    </div>
                                                    <div className="mt-0.5 text-[11px] font-medium text-zinc-400">
                                                        {topicLabel(prompt.topic)}
                                                        {tab === "SUGGESTED" && prompt.tags?.length ? (
                                                            <span className="ml-2 text-zinc-300">
                                                                {prompt.tags.filter(tag => tag.startsWith("source:") || tag.startsWith("intent:")).slice(0, 2).join(" · ")}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[13px] font-semibold tabular-nums text-zinc-900">
                                            {prompt.visibility !== null ? `${prompt.visibility.toFixed(0)}%` : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] font-medium tabular-nums text-zinc-600">
                                            {prompt.avg_sentiment !== null ? (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="font-light text-zinc-300">|</span>
                                                    {prompt.avg_sentiment.toFixed(0)}
                                                </span>
                                            ) : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] font-medium tabular-nums text-zinc-600">
                                            {prompt.avg_position !== null ? (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="font-light text-zinc-300">#</span>
                                                    {prompt.avg_position.toFixed(1)}
                                                </span>
                                            ) : "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap items-center gap-1">
                                                {prompt.mentions.slice(0, 5).map((mention) => (
                                                    <MentionChip key={mention} name={mention} />
                                                ))}
                                                {prompt.mentions.length > 5 && (
                                                    <span className="text-[10px] text-zinc-400">+{prompt.mentions.length - 5}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <VolumeBars value={prompt.visibility} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {tab === "ACTIVE" ? (
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation()
                                                        void deactivate(prompt.id)
                                                    }}
                                                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-zinc-200 bg-white text-zinc-400 opacity-0 transition-colors hover:bg-zinc-50 hover:text-red-600 group-hover:opacity-100"
                                                >
                                                    <RemoveIcon />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation()
                                                        void activate(prompt.id)
                                                    }}
                                                    className="inline-flex h-6 cursor-pointer items-center justify-center rounded border border-zinc-900 bg-zinc-900 px-2.5 text-[10px] font-medium text-white shadow-sm transition-colors hover:bg-zinc-800"
                                                >
                                                    Track
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {!isLoading && visiblePrompts.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-16 text-center text-sm text-zinc-500">
                                            No {tab.toLowerCase()} prompts found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!isLoading && visiblePrompts.length > 0 && (
                        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
                            <p className="text-[11.5px] font-medium text-slate-500">
                                {Math.min((page - 1) * PROMPTS_PAGE_SIZE + 1, visiblePrompts.length)}-{Math.min(page * PROMPTS_PAGE_SIZE, visiblePrompts.length)} of {visiblePrompts.length} prompts
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={page === 1}
                                    className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-[11.5px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <span className="min-w-16 text-center text-[11.5px] font-semibold tabular-nums text-slate-600">
                                    {page} / {pageCount}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                                    disabled={page === pageCount}
                                    className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-[11.5px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {isAddPromptOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4">
                    <form
                        onSubmit={submitPrompt}
                        className="w-full max-w-[560px] overflow-visible rounded-[28px] border border-slate-200 bg-white shadow-[0_34px_110px_-52px_rgba(15,23,42,0.78)]"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-600">Prompt library</p>
                                <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-950">Add prompt</h2>
                                <p className="mt-1 text-[13px] leading-5 text-slate-500">
                                    Choose an existing topic, then add the user query you want to monitor.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddPromptOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <label className="block">
                                <span className="text-[12px] font-bold text-slate-700">Topic</span>
                                <div className="mt-2">
                                    <TopicSearchDropdown
                                        topics={availableTopics}
                                        value={newPromptTopic}
                                        onChange={setNewPromptTopic}
                                    />
                                </div>
                                {availableTopics.length === 0 && (
                                    <p className="mt-2 text-[12px] font-semibold text-amber-600">
                                        Add a topic first before creating prompts.
                                    </p>
                                )}
                            </label>

                            <label className="block">
                                <span className="text-[12px] font-bold text-slate-700">Prompt</span>
                                <textarea
                                    value={newPromptText}
                                    onChange={(event) => setNewPromptText(event.target.value)}
                                    rows={5}
                                    placeholder="Example: What are the best AI visibility tools for B2B SaaS teams?"
                                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-3 text-[13px] font-medium leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </label>

                            {promptError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] font-semibold text-red-700">
                                    {promptError}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setIsAddPromptOpen(false)}
                                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-[12.5px] font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreatingPrompt || availableTopics.length === 0}
                                className="h-10 rounded-xl bg-slate-950 px-4 text-[12.5px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isCreatingPrompt ? "Creating..." : "Create prompt"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

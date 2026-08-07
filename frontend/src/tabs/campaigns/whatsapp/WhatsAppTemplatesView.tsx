import { useState, useEffect } from "react"
import { ArrowLeft, RefreshCw, Plus } from "lucide-react"
import type { WhatsAppAccount, WhatsAppTemplate, WhatsAppTemplateStatus } from "@/lib/whatsappApi"
import { listWhatsAppTemplates, syncWhatsAppTemplates } from "@/lib/whatsappApi"

interface Props {
    account: WhatsAppAccount
    onBack: () => void
    onReloadAccount: () => void
}

const STATUS_STYLES: Record<WhatsAppTemplateStatus, string> = {
    APPROVED: "bg-green-50 text-green-700 border border-green-200",
    PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
    REJECTED: "bg-red-50 text-red-600 border border-red-200",
    PAUSED: "bg-zinc-100 text-zinc-500",
    DISABLED: "bg-zinc-100 text-zinc-400",
}

const CATEGORY_STYLES: Record<string, string> = {
    MARKETING: "bg-purple-50 text-purple-700 border border-purple-200",
    UTILITY: "bg-blue-50 text-blue-700 border border-blue-200",
    AUTHENTICATION: "bg-orange-50 text-orange-700 border border-orange-200",
}

const FILTER_OPTIONS: Array<{ label: string; value: WhatsAppTemplateStatus | "ALL" }> = [
    { label: "All", value: "ALL" },
    { label: "Approved", value: "APPROVED" },
    { label: "Pending", value: "PENDING" },
    { label: "Rejected", value: "REJECTED" },
]

function TemplateComponentPreview({ components }: { components: any[] }) {
    return (
        <div className="flex flex-col gap-1.5 text-[11.5px]">
            {components.map((comp: any, i: number) => {
                if (comp.type === "HEADER") {
                    return (
                        <div key={i} className="rounded-md bg-zinc-100 px-2 py-1">
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400">Header · {comp.format}</span>
                            {comp.text && <p className="mt-0.5 font-medium text-zinc-700">{comp.text}</p>}
                            {!comp.text && comp.format !== "TEXT" && (
                                <p className="mt-0.5 text-zinc-500">[{comp.format} media]</p>
                            )}
                        </div>
                    )
                }
                if (comp.type === "BODY") {
                    return (
                        <div key={i} className="rounded-md bg-white border border-zinc-100 px-2 py-1.5">
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400">Body</span>
                            <p className="mt-0.5 leading-5 text-zinc-700 whitespace-pre-line line-clamp-3">
                                {(comp.text ?? "").replace(/\{\{(\d+)\}\}/g, (_: string, n: string) => (
                                    `[var ${n}]`
                                ))}
                            </p>
                        </div>
                    )
                }
                if (comp.type === "FOOTER") {
                    return (
                        <div key={i} className="rounded-md bg-zinc-50 px-2 py-1">
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400">Footer</span>
                            <p className="mt-0.5 text-zinc-400">{comp.text}</p>
                        </div>
                    )
                }
                if (comp.type === "BUTTONS") {
                    return (
                        <div key={i} className="flex flex-wrap gap-1">
                            {(comp.buttons ?? []).map((btn: any, j: number) => (
                                <span key={j} className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                                    {btn.type === "QUICK_REPLY" ? "↩ " : btn.type === "URL" ? "🔗 " : "📞 "}
                                    {btn.text}
                                </span>
                            ))}
                        </div>
                    )
                }
                return null
            })}
        </div>
    )
}

export function WhatsAppTemplatesView({ account, onBack }: Props) {
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [filter, setFilter] = useState<WhatsAppTemplateStatus | "ALL">("ALL")
    const [error, setError] = useState<string | null>(null)

    async function load() {
        setLoading(true)
        try {
            const data = await listWhatsAppTemplates(account.id)
            setTemplates(data)
        } catch (err: any) {
            setError(err?.response?.data?.error ?? "Failed to load templates")
        } finally {
            setLoading(false)
        }
    }

    async function handleSync() {
        setSyncing(true)
        setError(null)
        try {
            const data = await syncWhatsAppTemplates(account.id)
            setTemplates(data)
        } catch (err: any) {
            setError(err?.response?.data?.error ?? "Failed to sync templates from Meta")
        } finally {
            setSyncing(false)
        }
    }

    useEffect(() => { void load() }, [account.id])

    const filtered = filter === "ALL" ? templates : templates.filter((t) => t.status === filter)

    return (
        <div className="flex flex-col gap-5 pb-10">
            {/* Header */}
            <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-sm">
                <div className="relative flex flex-wrap items-center gap-3">
                    <button type="button" onClick={onBack} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition">
                        <ArrowLeft size={14} />
                    </button>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Campaigns / Message Templates</p>
                        <h1 className="text-[20px] font-bold tracking-tight text-zinc-950">WhatsApp Templates</h1>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSync}
                            disabled={syncing}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-[12.5px] font-medium text-zinc-600 hover:bg-zinc-50 transition"
                        >
                            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
                            {syncing ? "Syncing…" : "Sync from Meta"}
                        </button>
                        <a
                            href="https://business.facebook.com/wa/manage/message-templates/"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12.5px] font-semibold text-white transition"
                            style={{ background: "#25D366" }}
                        >
                            <Plus size={13} /> Create on Meta
                        </a>
                    </div>
                </div>

                {/* Filter pills */}
                <div className="relative mt-4 flex gap-2">
                    {FILTER_OPTIONS.map(({ label, value }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilter(value)}
                            className={`rounded-full border px-3 py-1 text-[11.5px] font-semibold transition ${
                                filter === value
                                    ? "border-zinc-800 bg-zinc-900 text-white"
                                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                            }`}
                        >
                            {label}
                            {value !== "ALL" && (
                                <span className="ml-1 text-[10px] opacity-70">
                                    ({templates.filter((t) => t.status === value).length})
                                </span>
                            )}
                        </button>
                    ))}
                    <span className="ml-auto text-[11px] text-zinc-400 self-center">{filtered.length} templates</span>
                </div>
            </section>

            {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[12.5px] text-red-600">{error}</div>
            )}

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-700" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-4xl mb-3">📋</span>
                    <p className="text-[13px] font-medium text-zinc-500">No {filter !== "ALL" ? filter.toLowerCase() : ""} templates yet</p>
                    <p className="mt-1 text-[12px] text-zinc-400">
                        Create templates in Meta Business Manager, then click "Sync from Meta" to import them here.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                    {filtered.map((t) => (
                        <div key={t.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="truncate text-[13px] font-semibold text-zinc-900">{t.name}</p>
                                    <p className="text-[11px] text-zinc-400">{t.language}</p>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[t.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                                        {t.status}
                                    </span>
                                    <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${CATEGORY_STYLES[t.category] ?? "bg-zinc-100 text-zinc-500"}`}>
                                        {t.category}
                                    </span>
                                </div>
                            </div>
                            <TemplateComponentPreview components={t.components as any[]} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

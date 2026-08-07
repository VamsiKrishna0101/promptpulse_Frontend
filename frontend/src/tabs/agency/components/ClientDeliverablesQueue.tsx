import React, { useEffect, useState } from "react"
import { FileText, Download, CheckCircle2, Clock, Sparkles, Presentation, FileCheck, RefreshCw, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"
import type { AgencyClient } from "./ClientPortfolioGrid"

type Props = {
    clients: AgencyClient[]
}

export type AgencyDeliverable = {
    id: string
    title: string
    type: "BRIEF" | "GEO_ARTICLE" | "DECK_PPTX" | "AUDIT_PDF"
    clientName: string
    targetKeyword?: string
    status: "APPROVED" | "PENDING_APPROVAL" | "READY"
    date: string
    projectId: string
    url?: string
}

export const ClientDeliverablesQueue: React.FC<Props> = ({ clients }) => {
    const [deliverables, setDeliverables] = useState<AgencyDeliverable[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedClient, setSelectedClient] = useState<string>("ALL")
    const [typeFilter, setTypeFilter] = useState<string>("ALL")

    async function loadDeliverables() {
        setLoading(true)
        try {
            const res = await api.get<{ deliverables: AgencyDeliverable[] }>("/agency/deliverables")
            setDeliverables(res.data.deliverables || [])
        } catch (error) {
            console.error("Failed to load deliverables:", error)
            setDeliverables([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadDeliverables()
    }, [])

    const filtered = deliverables.filter((item) => {
        const matchesClient = selectedClient === "ALL" || item.clientName === selectedClient
        const matchesType = typeFilter === "ALL" || item.type === typeFilter
        return matchesClient && matchesType
    })

    return (
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        <FileCheck size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Client Deliverables & Sign-offs</h2>
                        <p className="text-xs text-slate-500">Real-time deliverables generated from Content Briefs, SEO Audits, and AI Reports.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => void loadDeliverables()}
                        disabled={loading}
                        title="Refresh Deliverables"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                    </button>

                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
                    >
                        <option value="ALL">All Clients</option>
                        {clients.map((c) => {
                            const name = c.projects[0]?.brand_name || c.client_email.split("@")[0]
                            return (
                                <option key={c.link_id} value={name}>
                                    {name}
                                </option>
                            )
                        })}
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
                    >
                        <option value="ALL">All Types</option>
                        <option value="DECK_PPTX">PowerPoint Decks</option>
                        <option value="AUDIT_PDF">PDF Audits</option>
                        <option value="BRIEF">Content Strategy Briefs</option>
                        <option value="GEO_ARTICLE">GEO Articles</option>
                    </select>
                </div>
            </div>

            {/* Content list or empty state */}
            {loading ? (
                <div className="py-12 text-center text-xs text-slate-500">Loading client deliverables…</div>
            ) : filtered.length === 0 ? (
                <div className="py-10 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <FileText size={18} />
                    </div>
                    <h3 className="mt-3 text-xs font-bold text-slate-800">No Deliverables Generated Yet</h3>
                    <p className="mt-1 text-[11px] text-slate-500 max-w-sm mx-auto">
                        Generate GEO content briefs, SEO audit reports, or executive decks in your brand workspaces to track client sign-offs here.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <Link
                            to="/strategy/briefs"
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
                        >
                            <Plus size={13} /> Create Content Brief
                        </Link>
                        <Link
                            to="/audit"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
                        >
                            Run SEO Audit
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="mt-3 divide-y divide-slate-100">
                    {filtered.map((item) => {
                        const icon =
                            item.type === "DECK_PPTX" ? (
                                <Presentation size={15} className="text-amber-600" />
                            ) : item.type === "AUDIT_PDF" ? (
                                <FileText size={15} className="text-rose-600" />
                            ) : (
                                <Sparkles size={15} className="text-sky-600" />
                            )

                        return (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 hover:bg-slate-50/60 rounded-lg px-2 transition-colors">
                                <div className="flex items-start gap-2.5 min-w-0">
                                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-slate-100">
                                        {icon}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-900 text-xs truncate max-w-md">{item.title}</p>
                                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-600">
                                                {item.clientName}
                                            </span>
                                        </div>
                                        {item.targetKeyword && (
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Keyword: <span className="font-medium text-slate-700">{item.targetKeyword}</span>
                                            </p>
                                        )}
                                        <p className="text-[10px] text-slate-400 mt-0.5">{item.date}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    {item.status === "APPROVED" ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 border border-emerald-100">
                                            <CheckCircle2 size={11} /> Client Approved
                                        </span>
                                    ) : item.status === "PENDING_APPROVAL" ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700 border border-amber-100">
                                            <Clock size={11} /> Needs Sign-Off
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10.5px] font-semibold text-sky-700 border border-sky-100">
                                            Ready for Delivery
                                        </span>
                                    )}

                                    {item.url ? (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
                                        >
                                            <Download size={11} />
                                            View
                                        </a>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 shadow-xs">
                                            Internal Record
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}


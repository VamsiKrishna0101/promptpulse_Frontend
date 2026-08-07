import React, { useState, useMemo } from "react"
import { Search, Filter, Share2, Settings, CheckCircle2, AlertCircle } from "lucide-react"
import type { AgencyClient, ClientProject } from "./ClientPortfolioGrid"

type Props = {
    clients: AgencyClient[]
    onOpenShareModal: (client: AgencyClient, project?: ClientProject) => void
    onOpenBudgetModal: (client: AgencyClient) => void
    onSwitchWorkspace?: (project: ClientProject) => void
}

export const ClientPortfolioTable: React.FC<Props> = ({
    clients,
    onOpenShareModal,
    onOpenBudgetModal,
    onSwitchWorkspace,
}) => {
    const [search, setSearch] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("ALL")
    const [statusFilter, setStatusFilter] = useState("ALL")

    const categories = useMemo(() => {
        const set = new Set<string>()
        clients.forEach(c => { if (c.category) set.add(c.category) })
        return ["ALL", ...Array.from(set)]
    }, [clients])

    const filtered = useMemo(() => {
        return clients.filter(c => {
            const matchesSearch =
                c.client_email.toLowerCase().includes(search.toLowerCase()) ||
                c.projects.some(p => p.brand_name.toLowerCase().includes(search.toLowerCase()) || p.brand_url.toLowerCase().includes(search.toLowerCase()))

            const matchesCat = categoryFilter === "ALL" || c.category === categoryFilter
            const matchesStatus = statusFilter === "ALL" || c.status === statusFilter

            return matchesSearch && matchesCat && matchesStatus
        })
    }, [clients, search, categoryFilter, statusFilter])

    return (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Filters Bar */}
            <div className="flex flex-col gap-2.5 border-b border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
                <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search clients or domains…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11.5px] text-slate-500 font-medium">
                        <Filter size={12} />
                        Category:
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat === "ALL" ? "All Categories" : cat}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 bg-slate-50/70 font-semibold text-slate-500">
                        <tr>
                            <th className="py-2.5 px-3.5">Client Brand & Workspace</th>
                            <th className="py-2.5 px-3.5">Category</th>
                            <th className="py-2.5 px-3.5 text-center">AI Visibility</th>
                            <th className="py-2.5 px-3.5 text-center">Tracked Prompts</th>
                            <th className="py-2.5 px-3.5">Credit Cap</th>
                            <th className="py-2.5 px-3.5">Status</th>
                            <th className="py-2.5 px-3.5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-400">
                                    No client workspaces match the search filter.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((client) => {
                                const primaryProject = client.projects[0]
                                const hasScore = typeof primaryProject?.ai_visibility_score === "number" && !isNaN(primaryProject.ai_visibility_score)
                                const score = hasScore ? primaryProject.ai_visibility_score! : null

                                return (
                                    <tr key={client.link_id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-2.5 px-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 border border-slate-200/80 text-slate-800 font-bold text-xs">
                                                    {primaryProject?.brand_name ? primaryProject.brand_name.charAt(0).toUpperCase() : client.client_email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-tight text-xs">
                                                        {primaryProject?.brand_name || client.client_email.split("@")[0]}
                                                    </p>
                                                    <p className="text-[10.5px] text-slate-400">
                                                        {primaryProject?.brand_url ? primaryProject.brand_url.replace(/^https?:\/\//, "") : client.client_email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3.5">
                                            <span className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-slate-600">
                                                {client.category || "General"}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3.5 text-center">
                                            {score !== null ? (
                                                <span className="inline-flex items-center justify-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200/60">
                                                    {score}%
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center rounded-md bg-slate-50 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-400 border border-slate-200/60">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-center">
                                            <span className="text-slate-800 font-semibold">{primaryProject?.prompts_count ?? 0}</span>
                                            <span className="text-slate-400 text-[10px] ml-1">prompts</span>
                                        </td>
                                        <td className="py-2.5 px-3.5">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800 text-[11.5px]">
                                                    {(client.monthly_credit_cap || 0).toLocaleString()}
                                                </span>
                                                <span className="text-[9.5px] text-slate-400">credits/mo</span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3.5">
                                            {client.status === "ACTIVE" ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                                    <CheckCircle2 size={11} /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                                                    <AlertCircle size={11} /> Suspended
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onOpenShareModal(client, primaryProject)}
                                                    title="Generate live share link"
                                                    className="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                                >
                                                    <Share2 size={12} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onOpenBudgetModal(client)}
                                                    title="Edit settings & cap"
                                                    className="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                                >
                                                    <Settings size={12} />
                                                </button>
                                                {primaryProject && onSwitchWorkspace && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onSwitchWorkspace(primaryProject)}
                                                        className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-slate-800 transition-colors"
                                                    >
                                                        Open
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

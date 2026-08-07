import { useState } from "react"
import { Trash2, Play, Pause, RefreshCw } from "lucide-react"
import type { WhatsAppCampaign, WhatsAppCampaignStatus } from "@/lib/whatsappApi"
import { launchWhatsAppCampaign, pauseWhatsAppCampaign, deleteWhatsAppCampaign } from "@/lib/whatsappApi"

interface Props {
    campaigns: WhatsAppCampaign[]
    loading: boolean
    onOpenCampaign: (id: string) => void
    onRefresh: () => void
}

const STATUS_CONFIG: Record<WhatsAppCampaignStatus, { label: string; class: string }> = {
    DRAFT: { label: "Draft", class: "bg-zinc-100 text-zinc-500" },
    SCHEDULED: { label: "Scheduled", class: "bg-blue-50 text-blue-700 border border-blue-200" },
    RUNNING: { label: "Sending…", class: "bg-amber-50 text-amber-700 border border-amber-200" },
    COMPLETED: { label: "Completed", class: "bg-green-50 text-green-700 border border-green-200" },
    PAUSED: { label: "Paused", class: "bg-zinc-100 text-zinc-500" },
    FAILED: { label: "Failed", class: "bg-red-50 text-red-600 border border-red-200" },
}

export function CampaignsRecentTable({ campaigns, loading, onOpenCampaign, onRefresh }: Props) {
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    async function handleLaunch(campaignId: string) {
        setActionLoading(campaignId)
        try { await launchWhatsAppCampaign(campaignId); onRefresh() }
        catch (err: any) { alert(err?.response?.data?.error ?? "Failed to launch") }
        finally { setActionLoading(null) }
    }

    async function handlePause(campaignId: string) {
        setActionLoading(campaignId)
        try { await pauseWhatsAppCampaign(campaignId); onRefresh() }
        catch { /* silent */ }
        finally { setActionLoading(null) }
    }

    async function handleDelete(campaignId: string, name: string) {
        if (!confirm(`Delete campaign "${name}"?`)) return
        setActionLoading(campaignId)
        try { await deleteWhatsAppCampaign(campaignId); onRefresh() }
        catch { /* silent */ }
        finally { setActionLoading(null) }
    }

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
                <h2 className="text-[13px] font-semibold text-zinc-900">Recent Campaigns</h2>
                <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-50 transition"
                >
                    <RefreshCw size={11} /> Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
                </div>
            ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                        <span className="text-2xl">📨</span>
                    </div>
                    <p className="text-[13px] font-medium text-zinc-500">No campaigns yet</p>
                    <p className="mt-1 text-[12px] text-zinc-400">Click "New Campaign" to send your first bulk WhatsApp.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-[12.5px]">
                        <thead>
                            <tr className="border-b border-zinc-100 text-left">
                                <th className="px-5 py-2.5 font-semibold text-zinc-400">Campaign</th>
                                <th className="px-4 py-2.5 font-semibold text-zinc-400">Template</th>
                                <th className="px-4 py-2.5 font-semibold text-zinc-400 text-right">Recipients</th>
                                <th className="px-4 py-2.5 font-semibold text-zinc-400 text-right">Read Rate</th>
                                <th className="px-4 py-2.5 font-semibold text-zinc-400 text-right">Cost ₹</th>
                                <th className="px-4 py-2.5 font-semibold text-zinc-400">Status</th>
                                <th className="px-4 py-2.5 font-semibold text-zinc-400">Created</th>
                                <th className="px-4 py-2.5 font-semibold text-zinc-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((c) => {
                                const statusCfg = STATUS_CONFIG[c.status]
                                const readRate = c.delivered_count > 0
                                    ? `${Math.round((c.read_count / c.delivered_count) * 100)}%`
                                    : "—"
                                const cost = c.estimated_cost_inr
                                    ? `₹${Number(c.estimated_cost_inr).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                                    : "—"
                                const isLoading = actionLoading === c.id

                                return (
                                    <tr
                                        key={c.id}
                                        className="border-b border-zinc-50 hover:bg-zinc-50/60 cursor-pointer transition"
                                        onClick={() => onOpenCampaign(c.id)}
                                    >
                                        <td className="px-5 py-3 font-medium text-zinc-900">{c.name}</td>
                                        <td className="px-4 py-3 text-zinc-500">{c.template?.name ?? "—"}</td>
                                        <td className="px-4 py-3 text-right text-zinc-600">{c.total_recipients.toLocaleString("en-IN")}</td>
                                        <td className="px-4 py-3 text-right text-zinc-600">{readRate}</td>
                                        <td className="px-4 py-3 text-right text-zinc-600">{cost}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${statusCfg.class}`}>
                                                {statusCfg.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400">
                                            {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </td>
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-1">
                                                {(c.status === "DRAFT" || c.status === "SCHEDULED") && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLaunch(c.id)}
                                                        disabled={isLoading}
                                                        title="Launch"
                                                        className="rounded p-1 text-green-600 hover:bg-green-50 transition disabled:opacity-40"
                                                    >
                                                        <Play size={13} />
                                                    </button>
                                                )}
                                                {c.status === "RUNNING" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePause(c.id)}
                                                        disabled={isLoading}
                                                        title="Pause"
                                                        className="rounded p-1 text-amber-600 hover:bg-amber-50 transition disabled:opacity-40"
                                                    >
                                                        <Pause size={13} />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(c.id, c.name)}
                                                    disabled={isLoading || c.status === "RUNNING"}
                                                    title="Delete"
                                                    className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition disabled:opacity-40"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}

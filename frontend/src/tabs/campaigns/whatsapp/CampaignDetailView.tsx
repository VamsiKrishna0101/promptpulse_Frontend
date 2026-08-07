import { useState, useEffect } from "react"
import { ArrowLeft, RefreshCw } from "lucide-react"
import type { WhatsAppCampaign, WhatsAppRecipient, WhatsAppRecipientStatus } from "@/lib/whatsappApi"
import { getWhatsAppCampaign, listCampaignRecipients } from "@/lib/whatsappApi"

interface Props {
    campaignId: string
    onBack: () => void
}

const RECIPIENT_STATUS_STYLES: Record<WhatsAppRecipientStatus, { label: string; cls: string }> = {
    QUEUED: { label: "Queued", cls: "bg-zinc-100 text-zinc-500" },
    SENT: { label: "Sent ✓", cls: "bg-blue-50 text-blue-600" },
    DELIVERED: { label: "Delivered ✓✓", cls: "bg-indigo-50 text-indigo-600" },
    READ: { label: "Read 👁", cls: "bg-green-50 text-green-700" },
    FAILED: { label: "Failed ✗", cls: "bg-red-50 text-red-600" },
}

export function CampaignDetailView({ campaignId, onBack }: Props) {
    const [campaign, setCampaign] = useState<WhatsAppCampaign | null>(null)
    const [recipients, setRecipients] = useState<WhatsAppRecipient[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [recipientsLoading, setRecipientsLoading] = useState(false)

    async function loadCampaign() {
        setLoading(true)
        try {
            const data = await getWhatsAppCampaign(campaignId)
            setCampaign(data)
        } finally {
            setLoading(false)
        }
    }

    async function loadRecipients(p: number) {
        setRecipientsLoading(true)
        try {
            const data = await listCampaignRecipients(campaignId, p, 50)
            setRecipients(data.recipients)
            setTotal(data.total)
        } finally {
            setRecipientsLoading(false)
        }
    }

    useEffect(() => { void loadCampaign() }, [campaignId])
    useEffect(() => { void loadRecipients(page) }, [campaignId, page])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-700" />
            </div>
        )
    }

    if (!campaign) {
        return <div className="py-10 text-center text-zinc-400">Campaign not found</div>
    }

    const cost = campaign.estimated_cost_inr
        ? Number(campaign.estimated_cost_inr).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : null

    const deliveryRate = campaign.sent_count > 0
        ? Math.round((campaign.delivered_count / campaign.sent_count) * 100)
        : 0
    const readRate = campaign.delivered_count > 0
        ? Math.round((campaign.read_count / campaign.delivered_count) * 100)
        : 0

    return (
        <div className="flex flex-col gap-5 pb-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
                <button type="button" onClick={onBack} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition">
                    <ArrowLeft size={14} />
                </button>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">Campaigns / {campaign.name}</span>
                <button type="button" onClick={loadCampaign} className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-50 transition">
                    <RefreshCw size={11} /> Refresh
                </button>
            </div>

            {/* Campaign Info Card */}
            <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <h1 className="text-[20px] font-bold tracking-tight text-zinc-950">{campaign.name}</h1>
                        <p className="text-[12px] text-zinc-400">
                            Template: <strong className="text-zinc-700">{campaign.template?.name ?? "—"}</strong>
                            {campaign.objective && <> · {campaign.objective}</>}
                        </p>
                    </div>
                    {cost && (
                        <div className="ml-auto rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2 text-right">
                            <p className="text-[10px] text-zinc-400">Estimated Cost (incl. GST)</p>
                            <p className="text-[17px] font-bold text-zinc-900">₹{cost}</p>
                        </div>
                    )}
                </div>

                {/* Delivery Funnel */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: "Total Recipients", value: campaign.total_recipients.toLocaleString("en-IN"), color: "#6366f1" },
                        { label: "Sent", value: `${campaign.sent_count.toLocaleString("en-IN")}`, sub: `${deliveryRate}% delivered`, color: "#3b82f6" },
                        { label: "Delivered", value: campaign.delivered_count.toLocaleString("en-IN"), color: "#8b5cf6" },
                        { label: "Read", value: campaign.read_count.toLocaleString("en-IN"), sub: `${readRate}% read rate`, color: "#22c55e" },
                    ].map(({ label, value, sub, color }) => (
                        <div key={label} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                            <p className="text-[10.5px] font-medium text-zinc-400">{label}</p>
                            <p className="mt-0.5 text-[22px] font-bold text-zinc-900" style={{ color }}>{value}</p>
                            {sub && <p className="text-[10px] text-zinc-400">{sub}</p>}
                        </div>
                    ))}
                </div>

                {/* Funnel bar */}
                <div className="mt-4">
                    <div className="flex h-2 overflow-hidden rounded-full bg-zinc-100">
                        {campaign.total_recipients > 0 && (
                            <>
                                <div
                                    className="h-full bg-blue-400 transition-all duration-500"
                                    style={{ width: `${(campaign.delivered_count / campaign.total_recipients) * 100}%` }}
                                />
                                <div
                                    className="h-full bg-green-400 transition-all duration-500"
                                    style={{ width: `${(campaign.read_count / campaign.total_recipients) * 100}%` }}
                                />
                                {campaign.failed_count > 0 && (
                                    <div
                                        className="h-full bg-red-300 transition-all duration-500"
                                        style={{ width: `${(campaign.failed_count / campaign.total_recipients) * 100}%` }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                    <div className="mt-1.5 flex gap-4 text-[10px] text-zinc-400">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" /> Delivered</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400" /> Read</span>
                        {campaign.failed_count > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-300" /> Failed ({campaign.failed_count})</span>}
                    </div>
                </div>
            </div>

            {/* Recipients Table */}
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
                    <h2 className="text-[13px] font-semibold text-zinc-900">Recipients Log</h2>
                    <span className="text-[11px] text-zinc-400">{total.toLocaleString("en-IN")} total</span>
                </div>
                {recipientsLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-700" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-[12px]">
                            <thead>
                                <tr className="border-b border-zinc-100 text-left">
                                    <th className="px-5 py-2.5 font-semibold text-zinc-400">Name</th>
                                    <th className="px-4 py-2.5 font-semibold text-zinc-400">Phone</th>
                                    <th className="px-4 py-2.5 font-semibold text-zinc-400">Status</th>
                                    <th className="px-4 py-2.5 font-semibold text-zinc-400">Sent At</th>
                                    <th className="px-4 py-2.5 font-semibold text-zinc-400">Read At</th>
                                    <th className="px-4 py-2.5 font-semibold text-zinc-400">Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recipients.map((r) => {
                                    const s = RECIPIENT_STATUS_STYLES[r.status] ?? { label: r.status, cls: "bg-zinc-100 text-zinc-500" }
                                    return (
                                        <tr key={r.id} className="border-b border-zinc-50">
                                            <td className="px-5 py-2.5 font-medium text-zinc-800">{r.name || "—"}</td>
                                            <td className="px-4 py-2.5 font-mono text-zinc-600">{r.phone}</td>
                                            <td className="px-4 py-2.5">
                                                <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${s.cls}`}>
                                                    {s.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-zinc-400">
                                                {r.sent_at ? new Date(r.sent_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                                            </td>
                                            <td className="px-4 py-2.5 text-zinc-400">
                                                {r.read_at ? new Date(r.read_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                                            </td>
                                            <td className="px-4 py-2.5 text-red-400 max-w-[180px] truncate">{r.error_msg ?? "—"}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {total > 50 && (
                    <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
                        <span className="text-[11px] text-zinc-400">Page {page} of {Math.ceil(total / 50)}</span>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="rounded-md border border-zinc-200 px-3 py-1 text-[11px] text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 transition"
                            >
                                ← Prev
                            </button>
                            <button
                                type="button"
                                disabled={page >= Math.ceil(total / 50)}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-md border border-zinc-200 px-3 py-1 text-[11px] text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 transition"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

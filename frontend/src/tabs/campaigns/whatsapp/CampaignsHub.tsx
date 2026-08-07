import { useState, useEffect } from "react"
import { ArrowRight, ArrowLeft, FileText, BarChart2, Phone, ShieldCheck, Megaphone } from "lucide-react"
import type { WhatsAppAccount, WhatsAppCampaign } from "@/lib/whatsappApi"
import { listWhatsAppCampaigns } from "@/lib/whatsappApi"
import { CampaignsRecentTable } from "./CampaignsRecentTable"
import { WhatsAppConnectionHealth } from "./WhatsAppConnectionHealth"

// ─── Hub Cards ────────────────────────────────────────────────────────────────

const GLOW = "group-hover:shadow-[0_20px_40px_-24px_rgba(24,24,27,0.14)] group-hover:ring-zinc-300"

interface HubCard {
    id: string
    title: string
    description: string
    icon: React.ElementType
    ready: boolean
}

const CARDS: HubCard[] = [
    {
        id: "create",
        title: "Launch Campaign",
        description: "Send personalised bulk WhatsApp messages to your Indian customer list with a 5-step guided wizard.",
        icon: Megaphone,
        ready: true,
    },
    {
        id: "templates",
        title: "Message Templates",
        description: "Browse, sync, and create Meta-approved HSM templates with variable preview and status tracking.",
        icon: FileText,
        ready: true,
    },
    {
        id: "sender-profile",
        title: "Sender Profile",
        description: "Set your WhatsApp Business profile photo, about info, quality rating, and messaging tier.",
        icon: Phone,
        ready: true,
    },
    {
        id: "analytics",
        title: "Delivery Analytics",
        description: "Track Sent → Delivered → Read funnel and per-recipient logs for every campaign.",
        icon: BarChart2,
        ready: true,
    },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    account: WhatsAppAccount | null
    accountLoading: boolean
    projectId: string
    onBack?: () => void
    onNewCampaign: () => void
    onOpenTemplates: () => void
    onOpenSenderProfile: () => void
    onOpenCampaign: (id: string) => void
}

export function CampaignsHub({
    account,
    accountLoading,
    onBack,
    onNewCampaign,
    onOpenTemplates,
    onOpenSenderProfile,
    onOpenCampaign,
}: Props) {
    const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([])
    const [campaignsLoading, setCampaignsLoading] = useState(false)

    useEffect(() => {
        if (!account) return
        setCampaignsLoading(true)
        listWhatsAppCampaigns(account.id)
            .then(setCampaigns)
            .catch((err) => console.error("[CampaignsHub] listCampaigns error:", err))
            .finally(() => setCampaignsLoading(false))
    }, [account?.id])

    // Aggregate KPIs
    const totalSent = campaigns.reduce((s, c) => s + c.sent_count, 0)
    const totalDelivered = campaigns.reduce((s, c) => s + c.delivered_count, 0)
    const totalRead = campaigns.reduce((s, c) => s + c.read_count, 0)
    const totalCost = campaigns.reduce((s, c) => s + Number(c.estimated_cost_inr ?? 0), 0)
    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0
    const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0

    function qualityBadge(rating: string | undefined) {
        if (rating === "HIGH") return "🟢 High"
        if (rating === "MEDIUM") return "🟡 Medium"
        if (rating === "LOW") return "🔴 Low"
        return "⚪ Unknown"
    }

    return (
        <div className="flex flex-col gap-5">
            {/* ── Breadcrumb / Back to channels ────────────────────────────── */}
            {onBack && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-600 transition shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        All Channels
                    </button>
                    <span className="text-xs text-zinc-300">/</span>
                    <span className="text-xs font-semibold text-zinc-700">WhatsApp Campaigns</span>
                </div>
            )}

            {/* ── Hero (Matches AI Workspace 1:1) ──────────────────────────── */}
            <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(24,24,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.05) 1px, transparent 1px)",
                        backgroundSize: "36px 36px",
                        maskImage: "radial-gradient(ellipse 55% 90% at 0% 0%, black 15%, transparent 75%)",
                        WebkitMaskImage: "radial-gradient(ellipse 55% 90% at 0% 0%, black 15%, transparent 75%)",
                    }}
                />

                <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 ring-1 ring-zinc-200">
                            <img
                                src="https://www.google.com/s2/favicons?domain=whatsapp.com&sz=64"
                                alt="WhatsApp"
                                className="h-5 w-5 object-contain"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
                                    WhatsApp Marketing
                                </span>
                                {account?.is_green_badge && (
                                    <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-800 border border-zinc-200">
                                        <ShieldCheck size={10} /> Verified
                                    </span>
                                )}
                            </div>
                            <h1 className="text-[19px] font-bold leading-tight tracking-tight text-zinc-950">
                                Campaign Manager
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {account && !accountLoading ? (
                            <>
                                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-right">
                                    <p className="text-[11.5px] font-semibold text-zinc-900">{account.display_phone}</p>
                                    <p className="text-[10px] text-zinc-400">{account.display_name}</p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5">
                                    <p className="text-[10px] text-zinc-400">Quality</p>
                                    <p className="text-[11px] font-semibold text-zinc-900">{qualityBadge(account.quality_rating)}</p>
                                </div>
                            </>
                        ) : null}

                        <button
                            type="button"
                            onClick={onNewCampaign}
                            disabled={!account}
                            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-[12.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            + New Campaign
                        </button>
                    </div>
                </div>

                {/* KPI Strip */}
                {account && (
                    <div className="relative mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 pt-3.5 border-t border-zinc-100">
                        {[
                            { label: "Total Sent", value: totalSent.toLocaleString("en-IN") },
                            { label: "Delivery Rate", value: `${deliveryRate}%` },
                            { label: "Read Rate", value: `${readRate}%` },
                            { label: "Total Spent", value: `₹${totalCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-3 py-2">
                                <p className="text-[10.5px] font-medium text-zinc-400">{label}</p>
                                <p className="mt-0.5 text-[17px] font-bold tracking-tight text-zinc-900">{value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {account && <WhatsAppConnectionHealth account={account} />}

            {/* ── Workspace Cards ───────────────────────────────────────────── */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                {CARDS.map((card) => {
                    const Icon = card.icon
                    function onClick() {
                        if (card.id === "create") onNewCampaign()
                        else if (card.id === "templates") onOpenTemplates()
                        else if (card.id === "sender-profile") onOpenSenderProfile()
                        else if (card.id === "analytics") onOpenCampaign(campaigns[0]?.id ?? "")
                    }

                    return (
                        <button
                            key={card.id}
                            type="button"
                            onClick={onClick}
                            className={`group relative flex min-h-[190px] flex-col rounded-2xl border border-zinc-200 bg-white p-6 text-left ring-1 ring-transparent shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-[3px] hover:border-zinc-300 ${GLOW}`}
                        >
                            <div className="mb-5 flex w-full items-start justify-between gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-inset ring-zinc-200 text-zinc-700">
                                    <Icon size={19} strokeWidth={1.8} />
                                </div>
                                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-800">
                                    Active
                                </span>
                            </div>

                            <h2 className="mb-1.5 text-[16px] font-semibold tracking-tight text-zinc-950">
                                {card.title}
                            </h2>
                            <p className="line-clamp-2 min-h-[40px] text-[13px] leading-5 text-zinc-500">
                                {card.description}
                            </p>

                            <div className="flex-1" />

                            <div className="mt-4">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all group-hover:gap-2.5 group-hover:bg-zinc-800">
                                    Open
                                    <ArrowRight size={13} className="text-zinc-400 group-hover:text-white" />
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* ── Recent Campaigns ─────────────────────────────────────────── */}
            {account && (
                <CampaignsRecentTable
                    campaigns={campaigns}
                    loading={campaignsLoading}
                    onOpenCampaign={onOpenCampaign}
                    onRefresh={() => {
                        setCampaignsLoading(true)
                        listWhatsAppCampaigns(account.id).then(setCampaigns).finally(() => setCampaignsLoading(false))
                    }}
                />
            )}
        </div>
    )
}

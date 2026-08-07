import React from "react"
import { Bot, PhoneCall, Mail, MessageSquare } from "lucide-react"
import { useProjects } from "@/hooks/useProjects"
import type { WhatsAppAccount } from "@/lib/whatsappApi"

const DISABLED_TINT = "text-zinc-400 bg-zinc-50 ring-zinc-200"

interface ChannelItem {
    id: string
    title: string
    description: string
    icon: React.ElementType | null
    logoDomain: string | null
    status: "Ready" | "Coming soon"
    tint: string
    glow: string
}

const CHANNELS: ChannelItem[] = [
    {
        id: "bot",
        title: "WhatsApp AI Chatbot",
        description: "24/7 AI-powered appointment booking assistant.",
        icon: Bot,
        logoDomain: null,
        status: "Coming soon",
        tint: DISABLED_TINT,
        glow: "",
    },
    {
        id: "whatsapp",
        title: "WhatsApp Campaigns",
        description: "Send personalized bulk marketing broadcasts.",
        icon: null,
        logoDomain: "whatsapp.com",
        status: "Coming soon",
        tint: DISABLED_TINT,
        glow: "",
    },
    {
        id: "voice",
        title: "Voice AI Outreach",
        description: "Purpose-built Telugu voice agents for calls.",
        icon: PhoneCall,
        logoDomain: null,
        status: "Coming soon",
        tint: DISABLED_TINT,
        glow: "",
    },
    {
        id: "email",
        title: "Email Marketing",
        description: "Design responsive newsletters and drip campaigns.",
        icon: Mail,
        logoDomain: null,
        status: "Coming soon",
        tint: DISABLED_TINT,
        glow: "",
    },
    {
        id: "sms",
        title: "SMS Broadcast",
        description: "High-deliverability promotional SMS.",
        icon: MessageSquare,
        logoDomain: null,
        status: "Coming soon",
        tint: DISABLED_TINT,
        glow: "",
    },
]

interface Props {
    account: WhatsAppAccount | null
    accountLoading: boolean
    onOpenWhatsApp: () => void
    onOpenBot: () => void
    onOpenVoice: () => void
    onOpenEmail: () => void
}

export const CampaignsChannelsView: React.FC<Props> = () => {
    const { selectedProject } = useProjects()

    return (
        <div className="flex flex-col gap-5">
            {/* ─── Hero Banner ───────────────────── */}
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

                <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
                            Campaigns
                        </span>
                    </div>
                    <h1 className="text-[19px] font-bold leading-tight tracking-tight text-zinc-950">
                        Choose a channel
                    </h1>
                    <p className="text-[13px] leading-5 text-zinc-500">
                        Outreach campaigns and marketing broadcasts for{" "}
                        <strong className="font-semibold text-zinc-900">
                            {selectedProject?.brand_name ?? "your selected project"}
                        </strong>
                        .
                    </p>
                </div>
            </section>

            {/* ─── Channel Cards (Short Premium Grid) ─────────────────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {CHANNELS.map((channel) => {
                    const Icon = channel.icon
                    const ready = channel.status === "Ready"

                    return (
                        <button
                            key={channel.id}
                            type="button"
                            disabled={!ready}
                            className={`group relative flex flex-col rounded-2xl border p-5 text-left transition-all duration-200 ${
                                ready
                                    ? `border-zinc-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:-translate-y-[2px] hover:border-zinc-300 ${channel.glow}`
                                    : "cursor-not-allowed border-zinc-200/60 bg-zinc-50/50"
                            }`}
                        >
                            <div className="mb-4 flex w-full items-start justify-between gap-4">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-inset ${channel.tint}`}
                                >
                                    {channel.logoDomain ? (
                                        <img
                                            src={`https://www.google.com/s2/favicons?domain=${channel.logoDomain}&sz=64`}
                                            alt={channel.title}
                                            className="h-4 w-4 object-contain opacity-50 grayscale"
                                        />
                                    ) : Icon ? (
                                        <Icon size={18} strokeWidth={1.8} className="text-zinc-400" />
                                    ) : null}
                                </div>
                                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                    {channel.status}
                                </span>
                            </div>

                            <h2 className="mb-1 text-[15px] font-semibold tracking-tight text-zinc-900">
                                {channel.title}
                            </h2>
                            <p className="text-[12.5px] leading-snug text-zinc-500">
                                {channel.description}
                            </p>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

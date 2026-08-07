import { useState, useEffect } from "react"
import { ArrowRight, ArrowLeft, Mail, LayoutTemplate, Settings,} from "lucide-react"
import { getEmailAccount, listEmailCampaigns, type EmailAccount, type EmailCampaign } from "@/lib/emailApi"

const GLOW = "group-hover:shadow-[0_20px_40px_-24px_rgba(24,24,27,0.14)] group-hover:ring-zinc-300"

interface Props {
    projectId: string
    onBack: () => void
    onNewCampaign: () => void
    onOpenTemplates: () => void
    onOpenSettings: () => void
    onOpenCampaign: (id: string) => void
}

export function EmailCampaignsHub({ projectId, onBack, onNewCampaign, onOpenTemplates, onOpenSettings, onOpenCampaign }: Props) {
    const [account, setAccount] = useState<EmailAccount | null>(null)
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [projectId])

    async function loadData() {
        setLoading(true)
        try {
            const acc = await getEmailAccount(projectId)
            setAccount(acc)
            if (acc) {
                const camps = await listEmailCampaigns(projectId)
                setCampaigns(camps)
            }
        } catch (error) {
            console.error("Failed to load email hub data:", error)
        } finally {
            setLoading(false)
        }
    }

    const totalSent = campaigns.reduce((acc, c) => acc + c.sent_count, 0)
    const totalOpened = campaigns.reduce((acc, c) => acc + c.opened_count, 0)
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0

    const CARDS = [
        {
            id: "create",
            title: "Launch Campaign",
            description: "Send personalized rich HTML emails to your list via AWS SES.",
            icon: Mail,
            action: onNewCampaign,
        },
        {
            id: "templates",
            title: "Template Studio",
            description: "Design beautiful HTML emails with images, variables, and styling.",
            icon: LayoutTemplate,
            action: onOpenTemplates,
        },
        {
            id: "settings",
            title: "Sender Settings",
            description: "Configure AWS SES keys, verified domains, and from addresses.",
            icon: Settings,
            action: onOpenSettings,
        },
    ]

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-600 transition shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    All Channels
                </button>
                <span className="text-xs text-zinc-300">/</span>
                <span className="text-xs font-semibold text-zinc-700">Email Campaigns</span>
            </div>

            <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage: "linear-gradient(to right, rgba(24,24,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.05) 1px, transparent 1px)",
                        backgroundSize: "36px 36px",
                        maskImage: "radial-gradient(ellipse 55% 90% at 0% 0%, black 15%, transparent 75%)",
                        WebkitMaskImage: "radial-gradient(ellipse 55% 90% at 0% 0%, black 15%, transparent 75%)",
                    }}
                />

                <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 ring-1 ring-orange-200/50 text-orange-600">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
                                    AWS SES Marketing
                                </span>
                            </div>
                            <h1 className="text-[19px] font-bold leading-tight tracking-tight text-zinc-950">
                                Email Campaigns
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {account && (
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-right">
                                <p className="text-[11.5px] font-semibold text-zinc-900">{account.from_email}</p>
                                <p className="text-[10px] text-zinc-400">Verified Sender</p>
                            </div>
                        )}
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

                {account && (
                    <div className="relative mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 pt-3.5 border-t border-zinc-100">
                        {[
                            { label: "Total Sent", value: totalSent.toLocaleString() },
                            { label: "Open Rate", value: `${openRate}%` },
                            { label: "Cost Savings", value: "~90%" },
                            { label: "Provider", value: "AWS SES" },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-3 py-2">
                                <p className="text-[10.5px] font-medium text-zinc-400">{label}</p>
                                <p className="mt-0.5 text-[17px] font-bold tracking-tight text-zinc-900">{value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {!account && !loading && (
                <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-5 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-orange-900 text-sm">AWS SES Not Configured</h3>
                        <p className="text-xs text-orange-700/80 mt-0.5">You need to set up your AWS credentials to start sending emails.</p>
                    </div>
                    <button 
                        onClick={onOpenSettings}
                        className="px-4 py-2 bg-white border border-orange-200 rounded-xl text-xs font-semibold text-orange-700 shadow-sm hover:bg-orange-50"
                    >
                        Configure Now
                    </button>
                </div>
            )}

            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                {CARDS.map((card) => {
                    const Icon = card.icon
                    return (
                        <button
                            key={card.id}
                            type="button"
                            onClick={card.action}
                            className={`group relative flex min-h-[190px] flex-col rounded-2xl border border-zinc-200 bg-white p-6 text-left ring-1 ring-transparent shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-[3px] hover:border-zinc-300 ${GLOW}`}
                        >
                            <div className="mb-5 flex w-full items-start justify-between gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-inset ring-zinc-200 text-zinc-700">
                                    <Icon size={19} strokeWidth={1.8} />
                                </div>
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

            {campaigns.length > 0 && (
                <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
                        <h3 className="font-semibold text-zinc-900 text-sm">Recent Campaigns</h3>
                    </div>
                    <div className="divide-y divide-zinc-100">
                        {campaigns.map(c => (
                            <div key={c.id} className="p-5 flex items-center justify-between hover:bg-zinc-50 transition cursor-pointer" onClick={() => onOpenCampaign(c.id)}>
                                <div>
                                    <h4 className="font-medium text-sm text-zinc-900">{c.name}</h4>
                                    <p className="text-xs text-zinc-500 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600">
                                        {c.status}
                                    </span>
                                    <p className="text-xs text-zinc-500 mt-1">{c.sent_count} sent</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

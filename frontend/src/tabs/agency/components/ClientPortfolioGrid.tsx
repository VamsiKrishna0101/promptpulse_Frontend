import React from "react"
import {
    Building2, Share2, Settings2, ArrowUpRight,
    Plus, UserPlus, Globe, BarChart3, ShieldCheck,
    TrendingUp, Activity, Zap, ExternalLink,
} from "lucide-react"
import { Link } from "react-router-dom"

export type ClientProject = {
    id: string
    brand_name: string
    brand_url: string
    brand_location: string
    created_at: string | Date
    ai_visibility_score?: number
    prompts_count: number
    runs_count: number
    competitors_count: number
}

export type AgencyClient = {
    link_id: string
    client_user_id: string
    client_email: string
    role: string
    status: string
    category: string
    monthly_credit_cap: number
    assigned_manager_id: string | null
    linked_at: string | Date
    project_count: number
    projects: ClientProject[]
}

type Props = {
    clients: AgencyClient[]
    onOpenShareModal: (client: AgencyClient, project?: ClientProject) => void
    onOpenBudgetModal: (client: AgencyClient) => void
    onSwitchWorkspace?: (project: ClientProject) => void
    onOpenInviteModal?: () => void
}

function ScoreBadge({ score }: { score: number | null | undefined }) {
    if (score === null || score === undefined) {
        return (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                No Runs
            </span>
        )
    }
    const pct = Math.round(score)
    const [bg, text, border] = pct >= 75
        ? ["bg-emerald-50", "text-emerald-700", "border-emerald-200"]
        : pct >= 50
        ? ["bg-amber-50", "text-amber-700", "border-amber-200"]
        : ["bg-rose-50", "text-rose-700", "border-rose-200"]

    return (
        <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold ${bg} ${text} ${border}`}>
            <Activity size={9} />
            {pct}%
        </span>
    )
}

function getInitials(name: string) {
    return name.charAt(0).toUpperCase()
}

const AVATAR_COLORS = [
    "from-slate-700 to-slate-900",
    "from-sky-600 to-sky-800",
    "from-violet-600 to-violet-800",
    "from-emerald-600 to-emerald-800",
    "from-rose-600 to-rose-800",
    "from-amber-500 to-amber-700",
]

export const ClientPortfolioGrid: React.FC<Props> = ({
    clients,
    onOpenShareModal,
    onOpenBudgetModal,
    onOpenInviteModal,
}) => {
    if (clients.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                    <Building2 size={22} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">No Client Workspaces Yet</h3>
                <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Connect client brand workspaces to track their GEO & SEO visibility, share white-labeled live portals, and set monthly credit limits.
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    {[
                        { icon: Globe, label: "White-Label Live Portals", color: "text-slate-600" },
                        { icon: BarChart3, label: "AI Visibility Scores", color: "text-emerald-600" },
                        { icon: ShieldCheck, label: "Budget Guardrails", color: "text-sky-600" },
                    ].map(({ icon: Icon, label, color }) => (
                        <span key={label} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-xs">
                            <Icon size={12} className={color} />
                            {label}
                        </span>
                    ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                    <Link
                        to="/onboarding"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-slate-800 transition-all"
                    >
                        <Plus size={13} />
                        Connect Brand Workspace
                    </Link>
                    {onOpenInviteModal && (
                        <button
                            type="button"
                            onClick={onOpenInviteModal}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all"
                        >
                            <UserPlus size={13} className="text-slate-500" />
                            Invite Client Stakeholder
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((client, idx) => {
                const primaryProject = client.projects[0]
                const score = primaryProject?.ai_visibility_score
                const displayName = primaryProject?.brand_name || client.client_email.split("@")[0]
                const avatarGradient = AVATAR_COLORS[idx % AVATAR_COLORS.length]

                return (
                    <div
                        key={client.link_id}
                        className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
                    >
                        {/* Card top accent bar based on score */}
                        <div className={`h-0.5 w-full ${
                            typeof score === "number"
                                ? score >= 75 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-rose-400"
                                : "bg-slate-200"
                        }`} />

                        <div className="p-5">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Avatar with gradient */}
                                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarGradient} text-white font-bold text-sm shadow`}>
                                        {getInitials(displayName)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-sm text-slate-900 leading-tight truncate max-w-[130px]">
                                                {displayName}
                                            </h3>
                                        </div>
                                        {primaryProject?.brand_url && (
                                            <a
                                                href={primaryProject.brand_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors mt-0.5 truncate max-w-[160px]"
                                            >
                                                {primaryProject.brand_url.replace(/^https?:\/\//, "")}
                                                <ExternalLink size={9} className="flex-shrink-0" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <ScoreBadge score={score} />
                            </div>

                            {/* Category + Status badges */}
                            <div className="mt-3 flex items-center gap-1.5">
                                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                    {client.category || "Direct"}
                                </span>
                                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                                    client.status === "ACTIVE"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-50 text-slate-500"
                                }`}>
                                    {client.status.toLowerCase()}
                                </span>
                                {client.projects.length > 1 && (
                                    <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                                        +{client.projects.length - 1} more
                                    </span>
                                )}
                            </div>

                            {/* Metrics Row */}
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                {[
                                    { label: "Prompts", value: primaryProject?.prompts_count ?? 0, icon: Zap, color: "text-amber-500" },
                                    { label: "Runs", value: primaryProject?.runs_count ?? 0, icon: Activity, color: "text-sky-500" },
                                    { label: "Rivals", value: primaryProject?.competitors_count ?? 0, icon: TrendingUp, color: "text-rose-400" },
                                ].map(({ label, value, icon: Icon, color }) => (
                                    <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2 text-center">
                                        <Icon size={11} className={`mx-auto mb-1 ${color}`} />
                                        <p className="text-sm font-bold text-slate-900 leading-none">{value}</p>
                                        <p className="text-[9px] font-medium text-slate-400 mt-0.5">{label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Credit Allocation */}
                            <div className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                                <span className="text-[10px] text-slate-400 font-medium">Monthly Credits</span>
                                <span className="text-xs font-bold text-slate-800">
                                    {(client.monthly_credit_cap || 0).toLocaleString()} / mo
                                </span>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                            <button
                                type="button"
                                onClick={() => onOpenShareModal(client, primaryProject)}
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                <Share2 size={12} />
                                Share Portal
                            </button>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => onOpenBudgetModal(client)}
                                    title="Adjust Budget Cap"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 transition-colors shadow-xs"
                                >
                                    <Settings2 size={12} />
                                </button>
                                {primaryProject && (
                                    <Link
                                        to={`/?project=${primaryProject.id}`}
                                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
                                    >
                                        Open <ArrowUpRight size={11} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

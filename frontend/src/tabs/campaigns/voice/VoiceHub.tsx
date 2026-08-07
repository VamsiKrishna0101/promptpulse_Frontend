import { useState, useEffect } from "react"
import { Plus,
    
    Bot,
    Clock,
    CheckCircle2,
    
    
    ShieldAlert,
    ArrowRight,
    RefreshCw,
    
    
} from "lucide-react"
import type { VoiceAccount, VoiceCampaign, VoicePlaybookDefinition, VoiceTimeStatus } from "@/lib/voiceApi"
import { getVoiceAccount, listVoiceCampaigns, getVoicePlaybooks } from "@/lib/voiceApi"
import { VoiceCampaignWizard } from "./VoiceCampaignWizard"
import { VoiceAgentStudio } from "./VoiceAgentStudio"
import { VoiceLiveDeskView } from "./VoiceLiveDeskView"
import { VoicePlaybooksCatalog } from "./VoicePlaybooksCatalog"

interface Props {
    projectId: string
    onBackToChannels: () => void
}

type ViewMode = "hub" | "wizard" | "studio" | "live-desk" | "playbooks"

export function VoiceHub({ projectId, onBackToChannels }: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>("hub")
    const [account, setAccount] = useState<VoiceAccount | null>(null)
    const [ setTimeStatus] = useState<VoiceTimeStatus | null>(null)
    const [campaigns, setCampaigns] = useState<VoiceCampaign[]>([])
    const [playbooks, setPlaybooks] = useState<VoicePlaybookDefinition[]>([])
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [projectId])

    async function loadData() {
        try {
            setLoading(true)
            const [accData, camps, pbs] = await Promise.all([
                getVoiceAccount(projectId),
                listVoiceCampaigns(projectId),
                getVoicePlaybooks(),
            ])
            setAccount(accData.account)
            setTimeStatus(accData.timeStatus)
            setCampaigns(camps)
            setPlaybooks(pbs)
        } catch (err) {
            console.error("Failed to load Voice Hub data:", err)
        } finally {
            setLoading(false)
        }
    }

    function openLiveDesk(campaignId: string) {
        setSelectedCampaignId(campaignId)
        setViewMode("live-desk")
    }

    if (loading && !account) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
        )
    }

    // Sub-view: Wizard
    if (viewMode === "wizard" && account) {
        return (
            <VoiceCampaignWizard
                account={account}
                playbooks={playbooks}
                onBack={() => setViewMode("hub")}
                onSuccess={(campaignId) => {
                    openLiveDesk(campaignId)
                    loadData()
                }}
            />
        )
    }

    // Sub-view: Agent Studio
    if (viewMode === "studio" && account?.agents?.[0]) {
        return (
            <VoiceAgentStudio
                agent={account.agents[0]}
                onSaved={() => loadData()}
                onBack={() => setViewMode("hub")}
            />
        )
    }

    // Sub-view: Live Call Outcomes Desk
    if (viewMode === "live-desk" && selectedCampaignId) {
        return (
            <VoiceLiveDeskView
                campaignId={selectedCampaignId}
                onBack={() => setViewMode("hub")}
            />
        )
    }

    // Sub-view: Playbooks Library
    if (viewMode === "playbooks") {
        return (
            <div className="space-y-4">
                <button
                    type="button"
                    onClick={() => setViewMode("hub")}
                    className="text-xs font-medium text-zinc-600 hover:underline dark:text-zinc-400"
                >
                    &larr; Back to Voice Hub
                </button>
                <VoicePlaybooksCatalog
                    playbooks={playbooks}
                    selectedPlaybook="OPD_APPOINTMENT_CONFIRMATION"
                    onSelect={() => setViewMode("wizard")}
                />
            </div>
        )
    }

    // Master Dashboard Totals
    const totalCalls = campaigns.reduce((sum, c) => sum + (c.called_count || 0), 0)
    const totalConfirmed = campaigns.reduce((sum, c) => sum + (c.confirmed_count || 0), 0)
    const totalRescheduled = campaigns.reduce((sum, c) => sum + (c.rescheduled_count || 0), 0)
    const totalUrgent = campaigns.reduce((sum, c) => sum + (c.urgent_count || 0), 0)

    return (
        <div className="space-y-6 pb-12">
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onBackToChannels}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            Outreach Channels /
                        </button>
                        <h2 className="text-xl font-bold text-slate-900">
                            Voice AI Outreach Hub
                        </h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        Purpose-built Telugu voice agents for appointment confirmations, patient recovery, and triage.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Regulatory IST Pill */}
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                        <Clock className="h-3.5 w-3.5 text-emerald-600" />
                        <span>09:00 AM – 06:00 PM IST: ACTIVE</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setViewMode("studio")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        <Bot className="h-3.5 w-3.5 text-slate-500" /> Agent Studio
                    </button>

                    <button
                        type="button"
                        onClick={() => setViewMode("wizard")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> New Voice Campaign
                    </button>
                </div>
            </div>

            {/* Metric KPI Strip */}
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <span className="text-xs font-semibold text-slate-500">Total Voice Campaigns</span>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{campaigns.length}</p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <span className="text-xs font-semibold text-slate-500">Total Calls Executed</span>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{totalCalls}</p>
                </div>

                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-800">Appointments Confirmed</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">{totalConfirmed}</p>
                </div>

                <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-rose-800">🚨 Emergency Escalations</span>
                        <ShieldAlert className="h-4 w-4 text-rose-600" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-rose-700">{totalUrgent}</p>
                </div>
            </div>

            {/* Active Voice Campaigns Table */}
            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 p-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Voice Campaigns & Live Desks
                        </h3>
                        <p className="text-xs text-slate-500">
                            Real-time call progress and patient dispositions.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setViewMode("wizard")}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        Create Campaign &rarr;
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                            <tr>
                                <th className="p-3.5">Campaign Name</th>
                                <th className="p-3.5">Playbook</th>
                                <th className="p-3.5">Total / Called</th>
                                <th className="p-3.5">Confirmed</th>
                                <th className="p-3.5">Rescheduled</th>
                                <th className="p-3.5">Urgent</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-zinc-500">
                                        No voice campaigns yet. Click <strong>New Voice Campaign</strong> above to upload your patient list!
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((camp) => (
                                    <tr key={camp.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                        <td className="p-3.5">
                                            <button
                                                type="button"
                                                onClick={() => openLiveDesk(camp.id)}
                                                className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100 text-left"
                                            >
                                                {camp.name}
                                            </button>
                                            <div className="text-[11px] text-zinc-500">
                                                Created {new Date(camp.created_at).toLocaleDateString("en-IN")}
                                            </div>
                                        </td>

                                        <td className="p-3.5">
                                            <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                                {camp.playbook_type.replace(/_/g, " ")}
                                            </span>
                                        </td>

                                        <td className="p-3.5 font-mono">
                                            {camp.called_count} / {camp.total_recipients}
                                        </td>

                                        <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                            {camp.confirmed_count}
                                        </td>

                                        <td className="p-3.5 font-semibold text-amber-600 dark:text-amber-400">
                                            {camp.rescheduled_count}
                                        </td>

                                        <td className="p-3.5 font-bold text-rose-600 dark:text-rose-400">
                                            {camp.urgent_count > 0 ? `🚨 ${camp.urgent_count}` : "0"}
                                        </td>

                                        <td className="p-3.5">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                                                camp.status === "COMPLETED"
                                                    ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                                    : camp.status === "IN_PROGRESS"
                                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse"
                                                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                            }`}>
                                                {camp.status}
                                            </span>
                                        </td>

                                        <td className="p-3.5 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openLiveDesk(camp.id)}
                                                className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                            >
                                                Live Desk <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

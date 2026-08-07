import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import {
    Calendar,
    Activity,
    Sliders,
    PhoneCall,
    FileText,
    Radio,
} from "lucide-react"
import { OpdAppointmentsDesk } from "./tabs/OpdAppointmentsDesk"
import { PostDischargeDesk } from "./tabs/PostDischargeDesk"
import { VoiceTemplatesStudioTab } from "./tabs/VoiceTemplatesStudioTab"
import { VoiceAgentSettingsTab } from "./tabs/VoiceAgentSettingsTab"
import { LiveVoiceCallTesterModal } from "./components/LiveVoiceCallTesterModal"

type TabKey = "opd" | "discharge" | "templates" | "settings"

export const VoiceDeskPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialTab = (searchParams.get("tab") as TabKey) || "opd"
    const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
    const [isTestModalOpen, setIsTestModalOpen] = useState(false)

    useEffect(() => {
        const tab = searchParams.get("tab") as TabKey
        if (tab && ["opd", "discharge", "templates", "settings"].includes(tab)) {
            setActiveTab(tab)
        }
    }, [searchParams])

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab)
        setSearchParams({ tab })
    }

    return (
        <div className="min-h-screen bg-[#fafafa] p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Top Operational Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                        <PhoneCall className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                Hospital Voice AI Calling Desk
                            </h1>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                ● Telugu Live Desk
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Automated conversational calling for appointment confirmations, post-discharge triage, and custom script templates.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Live Test Call Button */}
                    <button
                        type="button"
                        onClick={() => setIsTestModalOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-sm active:scale-95 transition-all"
                    >
                        <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                        <span>Test Live Voice Call</span>
                    </button>

                    {/* Tab Navigation Buttons */}
                    <div className="inline-flex rounded-xl bg-slate-200/80 p-1 border border-slate-300/60">
                        <button
                            type="button"
                            onClick={() => handleTabChange("opd")}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                activeTab === "opd"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            <span>OPD Desk</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange("discharge")}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                activeTab === "discharge"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <Activity className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Recovery Triage</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange("templates")}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                activeTab === "templates"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <FileText className="h-3.5 w-3.5 text-purple-600" />
                            <span>Templates Studio</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange("settings")}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                activeTab === "settings"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <Sliders className="h-3.5 w-3.5 text-slate-500" />
                            <span>Settings</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Contents */}
            <div className="mt-4">
                {activeTab === "opd" && <OpdAppointmentsDesk />}
                {activeTab === "discharge" && <PostDischargeDesk />}
                {activeTab === "templates" && <VoiceTemplatesStudioTab />}
                {activeTab === "settings" && <VoiceAgentSettingsTab />}
            </div>

            {/* Live Test Call Modal */}
            <LiveVoiceCallTesterModal
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
            />
        </div>
    )
}
export default VoiceDeskPage


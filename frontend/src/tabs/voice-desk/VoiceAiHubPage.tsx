import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar,
    HeartPulse,
    FileText,
    
    ArrowRight,
    
    
    
    
    
    
    
    Radio,
} from "lucide-react"
import { LiveVoiceCallTesterModal } from "./components/LiveVoiceCallTesterModal"

export const VoiceAiHubPage: React.FC = () => {
    const navigate = useNavigate()
    const [isTestModalOpen, setIsTestModalOpen] = useState(false)

    return (
        <div className="space-y-8 pb-16">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-10 text-white shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Telugu Neural Speech Active
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-500/30">
                                TRAI IST Guard: 09:00 AM – 06:00 PM
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                            Hospital Voice AI Calling Desk
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                            Empathetic Telugu conversational AI for Vikas Hospitals & KIMS. Automate tomorrow's OPD appointment attendance confirmations, conduct 24-48h post-discharge recovery triaging, and escalate emergencies in real time.
                        </p>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsTestModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-3 text-sm font-bold text-white border border-white/20 transition-all shadow-sm active:scale-95"
                        >
                            <Radio className="h-4 w-4 text-emerald-400" />
                            <span>Test Live Voice Call</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/voice-ai/dashboard")}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 hover:bg-blue-400 px-6 py-3 text-sm font-extrabold text-white transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                        >
                            <span>Open Voice AI Dashboard</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Core Feature Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Operational Desks & Core Capabilities
                        </h2>
                        <p className="text-xs text-slate-500">
                            Dedicated clinical workflows designed specifically for hospital operations.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/voice-ai/dashboard")}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                        <span>Launch Dashboard</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Feature 1: OPD Appointments */}
                    <div
                        onClick={() => navigate("/voice-ai/dashboard?tab=opd")}
                        className="group p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                                OPD Desk
                            </span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                                OPD Appointment Attendance Desk
                            </h3>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                Upload tomorrow's scheduled patient CSV. Shruti AI calls in Telugu to confirm attendance, notes reschedule requests, and tags cancellations automatically.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 pt-2 border-t border-slate-100">
                            <span>Open OPD Attendance Desk</span>
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Feature 2: Post-Discharge */}
                    <div
                        onClick={() => navigate("/voice-ai/dashboard?tab=discharge")}
                        className="group p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <HeartPulse className="h-6 w-6" />
                            </div>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                                Recovery Triage
                            </span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                                Post-Discharge Care & Recovery
                            </h3>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                Proactive 24-48h patient follow-up. Check medication adherence, monitor pain/fever, and detect red-flag symptoms with immediate casualty nurse transfer.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 pt-2 border-t border-slate-100">
                            <span>Open Recovery Triage Desk</span>
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Feature 3: Templates Studio */}
                    <div
                        onClick={() => navigate("/voice-ai/dashboard?tab=templates")}
                        className="group p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <FileText className="h-6 w-6" />
                            </div>
                            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                                Script Studio
                            </span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-600 transition-colors">
                                Voice Script & Templates Studio
                            </h3>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                Customize Telugu greetings for Vikas Hospitals or KIMS. Edit dialogue scripts with dynamic variables and preview live Azure Neural audio with 1-click.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 pt-2 border-t border-slate-100">
                            <span>Open Templates Studio</span>
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Call Modal */}
            <LiveVoiceCallTesterModal
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
            />
        </div>
    )
}

import React, { useState } from "react"
import {
    X,
    Phone,
    Play,
    Pause,
    CheckCircle2,
    Calendar,
    Clock,
    AlertTriangle,
    ShieldAlert,
    User,
    Stethoscope,
    MessageSquare,
    Volume2,
    Share2,
    Copy,
    Check,
} from "lucide-react"

export interface TranscriptTurn {
    speaker: "agent" | "patient"
    textTelugu: string
    textEnglish?: string
    timestamp: string
}

export interface PatientVoiceRecord {
    id: string
    patientName: string
    patientPhone: string
    doctorName?: string
    scheduledSlot?: string
    dischargeDate?: string
    diagnosis?: string
    type: "OPD_CONFIRMATION" | "POST_DISCHARGE_RECOVERY"
    status: "CONFIRMED" | "RESCHEDULED" | "CANCELLED" | "NO_ANSWER" | "RECOVERING_WELL" | "NEEDS_ATTENTION" | "EMERGENCY"
    patientVerbatimQuote: string
    aiSummary: string
    callDurationSeconds: number
    calledAt: string
    isUrgent?: boolean
    symptomsReported?: string[]
    transcript: TranscriptTurn[]
}

interface PatientTranscriptDrawerProps {
    record: PatientVoiceRecord | null
    onClose: () => void
    onCallAgain?: (record: PatientVoiceRecord) => void
    onEscalateNurse?: (record: PatientVoiceRecord) => void
}

export const PatientTranscriptDrawer: React.FC<PatientTranscriptDrawerProps> = ({
    record,
    onClose,
    onCallAgain,
    onEscalateNurse,
}) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [showEnglishTranslation, setShowEnglishTranslation] = useState(true)
    const [copied, setCopied] = useState(false)

    if (!record) return null

    const handleCopyTranscript = () => {
        const text = record.transcript
            .map((t) => `${t.speaker === "agent" ? "AI (Shruti)" : record.patientName}: ${t.textTelugu} (${t.textEnglish || ""})`)
            .join("\n")
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const getStatusBadge = () => {
        switch (record.status) {
            case "CONFIRMED":
            case "RECOVERING_WELL":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {record.status === "CONFIRMED" ? "Coming / Confirmed" : "Recovering Well"}
                    </span>
                )
            case "RESCHEDULED":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                        <Calendar className="h-3.5 w-3.5" /> Rescheduled Requested
                    </span>
                )
            case "CANCELLED":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                        <X className="h-3.5 w-3.5" /> Cancelled / Not Coming
                    </span>
                )
            case "EMERGENCY":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 border border-red-300 animate-pulse">
                        <ShieldAlert className="h-3.5 w-3.5 text-red-600" /> 🚨 EMERGENCY RED-FLAG
                    </span>
                )
            case "NEEDS_ATTENTION":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                        <AlertTriangle className="h-3.5 w-3.5" /> Nurse Callback Needed
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                        <Clock className="h-3.5 w-3.5" /> No Answer / Busy
                    </span>
                )
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity">
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm font-bold text-sm">
                                {record.patientName.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-slate-900">{record.patientName}</h3>
                                    {getStatusBadge()}
                                </div>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">{record.patientPhone}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Drawer Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Emergency Alert Banner if Emergency */}
                        {record.status === "EMERGENCY" && (
                            <div className="rounded-xl border border-red-300 bg-red-50 p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-red-900">🚨 Immediate Clinical Attention Required</h4>
                                        <p className="mt-1 text-xs text-red-700 leading-relaxed">
                                            Patient reported acute symptoms during call:{" "}
                                            <strong>{record.symptomsReported?.join(", ") || "Critical pain / fever"}</strong>.
                                            Call was flagged for immediate Casualty / Triage Nurse follow-up.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => onEscalateNurse?.(record)}
                                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 shadow-sm"
                                        >
                                            <Phone className="h-3.5 w-3.5" /> Transfer to Casualty Nurse
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Patient & Call Metadata Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                                    {record.type === "OPD_CONFIRMATION" ? "Assigned Doctor" : "Treating Physician"}
                                </span>
                                <p className="mt-1 text-sm font-bold text-slate-900">{record.doctorName || "Dr. Suresh Reddy, MD"}</p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    {record.type === "OPD_CONFIRMATION" ? "Scheduled Slot" : "Discharge Date"}
                                </span>
                                <p className="mt-1 text-sm font-bold text-slate-900">
                                    {record.scheduledSlot || record.dischargeDate || "Tomorrow 10:30 AM"}
                                </p>
                            </div>
                        </div>

                        {/* Highlight: What the Patient Said */}
                        <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/40 p-4 relative">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <MessageSquare className="h-4 w-4 text-blue-600" />
                                    What the Patient Said (Summary)
                                </span>
                                <span className="text-[11px] text-blue-700 font-semibold bg-blue-100/80 px-2 py-0.5 rounded-full">
                                    Telugu Voice AI
                                </span>
                            </div>
                            <blockquote className="text-sm font-semibold text-slate-900 italic pl-3 border-l-2 border-blue-500">
                                "{record.patientVerbatimQuote}"
                            </blockquote>
                            <p className="mt-2 text-xs text-slate-600 leading-relaxed font-normal bg-white/80 p-2.5 rounded-lg border border-blue-100/80">
                                <strong className="text-slate-800">AI Clinical Note:</strong> {record.aiSummary}
                            </p>
                        </div>

                        {/* Audio Waveform & Player */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Volume2 className="h-4 w-4 text-slate-500" />
                                    <span className="text-xs font-bold text-slate-800">Call Audio Recording</span>
                                </div>
                                <span className="text-xs font-mono font-medium text-slate-500">
                                    00:{record.callDurationSeconds < 10 ? `0${record.callDurationSeconds}` : record.callDurationSeconds}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors flex-shrink-0"
                                >
                                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                                </button>

                                {/* Audio Mock Waveform */}
                                <div className="flex-1 flex items-center gap-1 h-8 bg-slate-50 rounded-lg px-3 border border-slate-200/80">
                                    {[20, 45, 80, 60, 30, 90, 75, 40, 65, 85, 95, 40, 50, 70, 30, 80, 60, 45, 90, 35, 60, 40, 75, 20].map(
                                        (height, i) => (
                                            <div
                                                key={i}
                                                className={`w-1 rounded-full transition-all ${
                                                    i < 10
                                                        ? "bg-blue-600"
                                                        : isPlaying
                                                        ? "bg-blue-400 animate-pulse"
                                                        : "bg-slate-300"
                                                }`}
                                                style={{ height: `${height}%` }}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Full Conversational Dialogue Turns */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    Full Call Dialogue ({record.transcript.length} turns)
                                </h4>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEnglishTranslation(!showEnglishTranslation)}
                                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                                    >
                                        {showEnglishTranslation ? "Hide English" : "Show English"}
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                        type="button"
                                        onClick={handleCopyTranscript}
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                                    >
                                        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                                {record.transcript.map((turn, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex flex-col ${
                                            turn.speaker === "agent" ? "items-start" : "items-end"
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-1 px-1">
                                            <span className="text-[10px] font-bold text-slate-500">
                                                {turn.speaker === "agent" ? "🤖 Shruti (KIMS AI)" : `👤 ${record.patientName}`}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">{turn.timestamp}</span>
                                        </div>

                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed ${
                                                turn.speaker === "agent"
                                                    ? "bg-white text-slate-900 border border-slate-200 rounded-tl-sm"
                                                    : "bg-blue-600 text-white rounded-tr-sm font-medium"
                                            }`}
                                        >
                                            <p className="font-semibold">{turn.textTelugu}</p>
                                            {showEnglishTranslation && turn.textEnglish && (
                                                <p
                                                    className={`mt-1 text-[11px] italic pt-1 border-t ${
                                                        turn.speaker === "agent"
                                                            ? "text-slate-500 border-slate-100"
                                                            : "text-blue-100 border-blue-500"
                                                    }`}
                                                >
                                                    "{turn.textEnglish}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Drawer Footer Actions */}
                    <div className="border-t border-slate-200 px-6 py-4 bg-white flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Close
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onCallAgain?.(record)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                            >
                                <Phone className="h-3.5 w-3.5" /> Call Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

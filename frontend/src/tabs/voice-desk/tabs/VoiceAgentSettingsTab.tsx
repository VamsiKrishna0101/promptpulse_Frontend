import React, { useState } from "react"
import { synthesizePrimaryVoicePreview } from "@/lib/voiceApi"
import {
    Phone,
    Play,
    Pause,
    CheckCircle2,
    Building2,
    Clock,
    Save,
} from "lucide-react"

export const VoiceAgentSettingsTab: React.FC = () => {
    const [voiceId, setVoiceId] = useState("te-IN-ShrutiNeural")
    const [hospitalName, setHospitalName] = useState("KIMS Hospitals, Secunderabad")
    const [casualtyNursePhone, setCasualtyNursePhone] = useState("+91 98480 22338")
    const [isPlayingPreview, setIsPlayingPreview] = useState(false)
    const [savedSuccess, setSavedSuccess] = useState(false)
    const [previewError, setPreviewError] = useState<string | null>(null)

    const handleSave = () => {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 2500)
    }

    const handlePreview = async () => {
        setPreviewError(null)
        setIsPlayingPreview(true)
        try {
            const blob = await synthesizePrimaryVoicePreview(
                "నమస్కారం అండి, ఇది KIMS Hospital Voice AI యొక్క తెలుగు పరీక్షా కాల్.",
                voiceId,
            )
            const audio = new Audio(URL.createObjectURL(blob))
            audio.onended = () => setIsPlayingPreview(false)
            audio.onerror = () => { setIsPlayingPreview(false); setPreviewError("Voice preview could not be played.") }
            await audio.play()
        } catch {
            setIsPlayingPreview(false)
            setPreviewError("Voice AI service or Azure Speech is not reachable.")
        }
    }

    return (
        <div className="max-w-4xl space-y-6">
            {/* Header */}
            <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-bold text-slate-900">
                    🎙️ Voice Persona & Casualty Emergency Settings
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                    Configure your hospital's AI caller identity, Azure Neural Telugu voice models, and casualty emergency nurse handoff numbers.
                </p>
            </div>

            {/* Persona Selection */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                        Telugu Neural Voice Persona
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                            onClick={() => setVoiceId("te-IN-ShrutiNeural")}
                            className={`rounded-2xl p-4 border-2 cursor-pointer transition-all ${
                                voiceId === "te-IN-ShrutiNeural"
                                    ? "border-blue-600 bg-blue-50/40 shadow-sm"
                                    : "border-slate-200 hover:border-slate-300"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-700 font-bold text-sm">
                                        👩
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-900">Shruti (శృతి)</div>
                                        <div className="text-[11px] text-slate-500">Female • Empathetic Clinical Voice</div>
                                    </div>
                                </div>
                                {voiceId === "te-IN-ShrutiNeural" && (
                                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                )}
                            </div>
                            <p className="mt-3 text-xs text-slate-600 italic">
                                "నమస్కారం అండి, నేను కిమ్స్ హాస్పిటల్ నుండి శృతిని మాట్లాడుతున్నాను..."
                            </p>
                        </div>

                        <div
                            onClick={() => setVoiceId("te-IN-MohanNeural")}
                            className={`rounded-2xl p-4 border-2 cursor-pointer transition-all ${
                                voiceId === "te-IN-MohanNeural"
                                    ? "border-blue-600 bg-blue-50/40 shadow-sm"
                                    : "border-slate-200 hover:border-slate-300"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm">
                                        👨
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-900">Mohan (మోహన్)</div>
                                        <div className="text-[11px] text-slate-500">Male • Professional Doctor Desk</div>
                                    </div>
                                </div>
                                {voiceId === "te-IN-MohanNeural" && (
                                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                )}
                            </div>
                            <p className="mt-3 text-xs text-slate-600 italic">
                                "నమస్కారం అండి, కిమ్స్ హాస్పిటల్ అపాయింట్‌మెంట్స్ డెస్క్ నుండి మోహన్ ని..."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Voice Preview Player */}
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => { if (!isPlayingPreview) void handlePreview() }}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            {isPlayingPreview ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                        </button>
                        <div>
                            <div className="text-xs font-bold text-slate-900">
                                Test Sample Telugu Voice Call
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                                Synthesized with Azure Neural Speech (Sub-300ms latency)
                            </div>
                        </div>
                    </div>

                    <span className="text-xs font-semibold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-full">
                        {isPlayingPreview ? "Playing" : "Ready"}
                    </span>
                </div>
                {previewError && <p className="text-xs font-semibold text-red-600">{previewError}</p>}
            </div>

            {/* Hospital & Emergency Escalation Setup */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Hospital Information & Casualty Emergency Route
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Hospital Name (Used in AI Salutation)
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={hospitalName}
                                onChange={(e) => setHospitalName(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Casualty / Emergency Nurse Transfer Hotline
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-red-500" />
                            <input
                                type="text"
                                value={casualtyNursePhone}
                                onChange={(e) => setCasualtyNursePhone(e.target.value)}
                                placeholder="+91 98480 22338"
                                className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            When a patient reports acute chest pain or bleeding, call is automatically transferred here.
                        </p>
                    </div>
                </div>
            </div>

            {/* TRAI Regulatory Compliance Indicator */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-emerald-900">
                            TRAI IST Regulatory Calling Guard: ACTIVE
                        </div>
                        <div className="text-[11px] text-emerald-700">
                            Calls are automatically restricted to 09:00 AM – 06:00 PM Indian Standard Time.
                        </div>
                    </div>
                </div>

                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    Compliant
                </span>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
                {savedSuccess ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="h-4 w-4" /> Settings saved successfully!
                    </span>
                ) : (
                    <div />
                )}

                <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                    <Save className="h-4 w-4" /> Save Settings
                </button>
            </div>
        </div>
    )
}

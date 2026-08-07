import React, { useState } from "react"
import {
    FileText,
    Volume2,
    Play,
    Pause,
    Sparkles,
    CheckCircle2,
    Save,
    RotateCcw,
    Plus,
    Copy,
    Building2,
    Check,
    MessageSquare,
} from "lucide-react"

export interface VoiceTemplate {
    id: string
    title: string
    category: "OPD" | "DISCHARGE" | "LAB" | "CUSTOM"
    description: string
    hospitalName: string
    teluguScript: string
    englishTranslation: string
    variables: string[]
}

const DEFAULT_TEMPLATES: VoiceTemplate[] = [
    {
        id: "tpl-opd-vikas",
        title: "OPD Doctor Appointment Confirmation (Vikas Hospitals)",
        category: "OPD",
        description: "Automated Telugu call asking patient to confirm or reschedule tomorrow's doctor appointment.",
        hospitalName: "వికాస్ హాస్పిటల్స్ (Vikas Hospitals)",
        teluguScript: "నమస్కారం అండి, నేను {hospital_name} నుండి శృతిని మాట్లాడుతున్నాను. మీరు రేపు {time_slot} గంటలకు డాక్టర్ {doctor_name} గారిని కలవడానికి అపాయింట్‌మెంట్ తీసుకున్నారు కదా? మీరు తప్పకుండా వస్తున్నారా అండి?",
        englishTranslation: "Hello, I am Shruti calling from {hospital_name}. You have booked an appointment tomorrow at {time_slot} with Dr. {doctor_name}, right? Are you definitely coming?",
        variables: ["{hospital_name}", "{doctor_name}", "{patient_name}", "{time_slot}"],
    },
    {
        id: "tpl-discharge-care",
        title: "Post-Discharge Recovery & Symptom Check (24-48h)",
        category: "DISCHARGE",
        description: "Proactive recovery check on medication adherence, pain levels, and detecting red flags.",
        hospitalName: "వికాస్ హాస్పిటల్స్ (Vikas Hospitals)",
        teluguScript: "నమస్కారం {patient_name} గారు, నేను {hospital_name} నుండి మాట్లాడుతున్నాను. మీరు డిశ్చార్జ్ అయ్యాక మీ ఆరోగ్యం ఎలా ఉంది? డాక్టర్ ఇచ్చిన మందులు సమయానికి వేసుకుంటున్నారా? ఛాతీ నొప్పి లేదా అధిక జ్వరం లాంటి సమస్యలేమైనా ఉన్నాయా?",
        englishTranslation: "Hello {patient_name} garu, calling from {hospital_name}. How is your health after discharge? Are you taking prescribed medicines on time? Are you experiencing any chest pain or high fever?",
        variables: ["{hospital_name}", "{patient_name}", "{doctor_name}"],
    },
    {
        id: "tpl-lab-ready",
        title: "Diagnostics & Lab Reports Ready Alert",
        category: "LAB",
        description: "Informs patient that blood/radiology reports are ready and available on WhatsApp.",
        hospitalName: "వికాస్ హాస్పిటల్స్ (Vikas Hospitals)",
        teluguScript: "నమస్కారం {patient_name} గారు, {hospital_name} డయాగ్నస్టిక్స్ నుండి శృతిని. మీ రక్త పరీక్ష రిపోర్ట్స్ సిద్ధంగా ఉన్నాయి. రిపోర్ట్ కాపీని మీ వాట్సాప్‌కి పంపాము. డాక్టర్ రివ్యూ కోసం అపాయింట్‌మెంట్ బుక్ చేయమంటారా?",
        englishTranslation: "Hello {patient_name} garu, Shruti from {hospital_name} Diagnostics. Your lab test reports are ready and sent to your WhatsApp. Would you like to book a doctor review appointment?",
        variables: ["{hospital_name}", "{patient_name}"],
    },
]

export const VoiceTemplatesStudioTab: React.FC = () => {
    const [templates, setTemplates] = useState<VoiceTemplate[]>(DEFAULT_TEMPLATES)
    const [selectedTemplate, setSelectedTemplate] = useState<VoiceTemplate>(DEFAULT_TEMPLATES[0])
    const [isPlayingAudio, setIsPlayingAudio] = useState(false)
    const [audioError, setAudioError] = useState<string | null>(null)
    const [savedSuccess, setSavedSuccess] = useState(false)
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)

    const handleSelectTemplate = (tpl: VoiceTemplate) => {
        if (currentAudio) {
            currentAudio.pause()
            setIsPlayingAudio(false)
        }
        setSelectedTemplate(tpl)
    }

    const handleUpdateScript = (text: string) => {
        const updated = { ...selectedTemplate, teluguScript: text }
        setSelectedTemplate(updated)
        setTemplates(templates.map((t) => (t.id === updated.id ? updated : t)))
    }

    const handleUpdateHospitalName = (name: string) => {
        const updated = { ...selectedTemplate, hospitalName: name }
        setSelectedTemplate(updated)
        setTemplates(templates.map((t) => (t.id === updated.id ? updated : t)))
    }

    const handlePlayAudio = async () => {
        if (isPlayingAudio && currentAudio) {
            currentAudio.pause()
            setIsPlayingAudio(false)
            return
        }

        setAudioError(null)
        setIsPlayingAudio(true)

        try {
            // Replace placeholder variables with realistic preview values
            const synthesizedText = selectedTemplate.teluguScript
                .replace(/{hospital_name}/g, selectedTemplate.hospitalName || "వికాస్ హాస్పిటల్స్")
                .replace(/{doctor_name}/g, "డాక్టర్ సురేష్ రెడ్డి")
                .replace(/{patient_name}/g, "వెంకటేష్ గారు")
                .replace(/{time_slot}/g, "ఉదయం 10:30")

            const response = await fetch("http://localhost:4000/api/voice/audio/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: synthesizedText,
                    voiceName: "te-IN-ShrutiNeural",
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to synthesize audio from Azure Speech.")
            }

            const blob = await response.blob()
            const audioUrl = URL.createObjectURL(blob)
            const audio = new Audio(audioUrl)
            setCurrentAudio(audio)

            audio.onended = () => {
                setIsPlayingAudio(false)
            }
            audio.onerror = () => {
                setIsPlayingAudio(false)
                setAudioError("Audio playback failed.")
            }

            await audio.play()
        } catch (err: any) {
            console.error("Audio preview failed:", err)
            setIsPlayingAudio(false)
            setAudioError(err.message || "Failed to load audio.")
        }
    }

    const handleSaveTemplate = () => {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 2500)
    }

    const handleResetDefaults = () => {
        setTemplates(DEFAULT_TEMPLATES)
        setSelectedTemplate(DEFAULT_TEMPLATES[0])
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900">
                            📋 Hospital Voice Script & Template Studio
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                            Azure Neural Telugu
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Customize what Shruti AI says to your patients. Edit greetings for Vikas Hospitals, OPD confirmations, discharge follow-ups, and test live audio instantly.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm"
                    >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
                    </button>
                </div>
            </div>

            {/* Template Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Template Selector List */}
                <div className="lg:col-span-4 space-y-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Select Template
                    </span>
                    {templates.map((tpl) => (
                        <div
                            key={tpl.id}
                            onClick={() => handleSelectTemplate(tpl)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                selectedTemplate.id === tpl.id
                                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                                    {tpl.category}
                                </span>
                                {selectedTemplate.id === tpl.id && (
                                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                )}
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 mt-2">{tpl.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
                        </div>
                    ))}
                </div>

                {/* Right: Template Editor & Live Audio Synthesizer */}
                <div className="lg:col-span-8 space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
                            <div>
                                <h4 className="text-base font-bold text-slate-900">{selectedTemplate.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{selectedTemplate.description}</p>
                            </div>

                            {/* Audio Playback Button */}
                            <button
                                type="button"
                                onClick={handlePlayAudio}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-colors ${
                                    isPlayingAudio
                                        ? "bg-rose-600 text-white hover:bg-rose-700"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            >
                                {isPlayingAudio ? (
                                    <>
                                        <Pause className="h-4 w-4" /> Stop Audio Preview
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4" /> ▶ Listen to Telugu Audio
                                    </>
                                )}
                            </button>
                        </div>

                        {audioError && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                                {audioError}
                            </div>
                        )}

                        {/* Hospital Name Configurator */}
                        <div>
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                                Hospital / Clinic Branding Name
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={selectedTemplate.hospitalName}
                                    onChange={(e) => handleUpdateHospitalName(e.target.value)}
                                    placeholder="e.g. వికాస్ హాస్పిటల్స్ (Vikas Hospitals)"
                                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Telugu Speech Script Box */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Spoken Telugu Script (What Shruti AI Speaks)
                                </label>
                                <span className="text-[11px] font-semibold text-blue-600">
                                    Voice: te-IN-ShrutiNeural
                                </span>
                            </div>
                            <textarea
                                rows={4}
                                value={selectedTemplate.teluguScript}
                                onChange={(e) => handleUpdateScript(e.target.value)}
                                className="w-full p-3.5 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                            />
                        </div>

                        {/* Variable Tags */}
                        <div>
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                                Available Dynamic Placeholder Variables:
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                {selectedTemplate.variables.map((v) => (
                                    <span
                                        key={v}
                                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 border border-slate-200"
                                    >
                                        {v}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* English Reference Translation */}
                        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Reference English Translation
                            </span>
                            <p className="text-xs text-slate-700 italic">"{selectedTemplate.englishTranslation}"</p>
                        </div>

                        {/* Save Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                            {savedSuccess ? (
                                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                                    <Check className="h-4 w-4" /> Template saved successfully!
                                </span>
                            ) : (
                                <div />
                            )}

                            <button
                                type="button"
                                onClick={handleSaveTemplate}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
                            >
                                <Save className="h-4 w-4" /> Save Template
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

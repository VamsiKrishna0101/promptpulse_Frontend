import { useState } from "react"
import { Volume2,  Square, Sparkles,  ShieldAlert, Save, RefreshCw, Check } from "lucide-react"
import type { VoiceAgentConfig,} from "@/lib/voiceApi"
import { updateVoiceAgent, synthesizeVoicePreview } from "@/lib/voiceApi"

interface Props {
    agent: VoiceAgentConfig
    onSaved: (updated: VoiceAgentConfig) => void
    onBack?: () => void
}

const VOICES = [
    { id: "te-IN-ShrutiNeural", name: "Shruti (Telugu - Female)", lang: "te-IN", tone: "Warm, polite, conversational hospital receptionist" },
    { id: "te-IN-MohanNeural", name: "Mohan (Telugu - Male)", lang: "te-IN", tone: "Professional, reassuring, authoritative medical advisor" },
    { id: "hi-IN-SwaraNeural", name: "Swara (Hindi - Female)", lang: "hi-IN", tone: "Polite Hindi healthcare coordinator" },
    { id: "en-IN-NeerjaNeural", name: "Neerja (English - Indian Accent)", lang: "en-IN", tone: "Clear, fluent Indian-accent English" },
]

export function VoiceAgentStudio({ agent, onSaved, onBack }: Props) {
    const [name, setName] = useState(agent.name)
    const [language, setLanguage] = useState(agent.language || "te-IN")
    const [voiceName, setVoiceName] = useState(agent.voice_name || "te-IN-ShrutiNeural")
    const [systemPrompt, setSystemPrompt] = useState(agent.system_prompt)
    const [liveTransferNumber, setLiveTransferNumber] = useState(agent.live_transfer_number || "+91 80 4567 8911")
    const [emergencyKeywords, setEmergencyKeywords] = useState(agent.emergency_keywords?.join(", ") || "chest pain, fever, emergency, bleeding, severe pain")
    
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [playingAudio, setPlayingAudio] = useState(false)
    const [audioError, setAudioError] = useState<string | null>(null)

    async function handlePlayPreview() {
        try {
            setAudioError(null)
            setPlayingAudio(true)
            const sampleText = "నమస్తే రామారావు గారు! సిటీ కేర్ హాస్పిటల్ నుండి శృతి మాట్లాడుతున్నాను. రేపు మీ డాక్టర్ అపాయింట్మెంట్ కన్ఫర్మ్ చేయడానికి కాల్ చేశాను."
            
            // Check if browser native speech synthesis is supported as instant zero-latency playback
            if ("speechSynthesis" in window) {
                const utterance = new SpeechSynthesisUtterance(sampleText)
                utterance.lang = language
                utterance.rate = 0.95
                utterance.onend = () => setPlayingAudio(false)
                utterance.onerror = () => setPlayingAudio(false)
                window.speechSynthesis.cancel()
                window.speechSynthesis.speak(utterance)
            } else {
                // Fallback to backend synthesis
                const blob = await synthesizeVoicePreview(sampleText, voiceName)
                const url = URL.createObjectURL(blob)
                const audio = new Audio(url)
                audio.onended = () => setPlayingAudio(false)
                audio.onerror = () => {
                    setPlayingAudio(false)
                    setAudioError("Audio playback not supported in this environment.")
                }
                await audio.play()
            }
        } catch (err: any) {
            setPlayingAudio(false)
            setAudioError("Unable to synthesize audio preview.")
        }
    }

    async function handleSave() {
        try {
            setSaving(true)
            setSaveSuccess(false)
            const keywordsArray = emergencyKeywords.split(",").map((k) => k.trim()).filter(Boolean)
            const updated = await updateVoiceAgent({
                agentId: agent.id,
                name,
                language,
                voice_name: voiceName,
                system_prompt: systemPrompt,
                live_transfer_number: liveTransferNumber,
                emergency_keywords: keywordsArray,
            })
            setSaveSuccess(true)
            onSaved(updated)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err) {
            console.error("Failed to save agent persona:", err)
        } finally {
            setSaving(false)
        }
    }

    function insertTag(tag: string) {
        setSystemPrompt((prev) => prev + ` {{${tag}}}`)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Voice AI Agent Studio
                    </h2>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Configure Telugu neural voices, system prompts, clinical triage triggers, and emergency live transfers.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            Back
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        {saving ? (
                            <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <Check className="h-3.5 w-3.5 text-emerald-500" /> Saved!
                            </>
                        ) : (
                            <>
                                <Save className="h-3.5 w-3.5" /> Save Agent Persona
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column: Voice Model & Persona Settings */}
                <div className="space-y-5 lg:col-span-1">
                    {/* Agent Name */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                        <label className="block text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                            Agent Display Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                            placeholder="e.g. Telugu Hospital Receptionist (Shruti)"
                        />
                    </div>

                    {/* Voice Model Selector */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                Neural Voice Model
                            </label>
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                                Azure Free F0 Tier
                            </span>
                        </div>

                        <div className="space-y-2">
                            {VOICES.map((v) => {
                                const isSelected = voiceName === v.id
                                return (
                                    <div
                                        key={v.id}
                                        onClick={() => {
                                            setVoiceName(v.id)
                                            setLanguage(v.lang)
                                        }}
                                        className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                                            isSelected
                                                ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
                                                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                                {v.name}
                                            </span>
                                            {isSelected && <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />}
                                        </div>
                                        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                            {v.tone}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Test Voice Audio Button */}
                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={handlePlayPreview}
                                className={`w-full inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                                    playingAudio
                                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                                        : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                                }`}
                            >
                                {playingAudio ? (
                                    <>
                                        <Square className="h-3.5 w-3.5 fill-current animate-pulse" /> Speaking Telugu Sample...
                                    </>
                                ) : (
                                    <>
                                        <Volume2 className="h-3.5 w-3.5" /> Test Voice Audio
                                    </>
                                )}
                            </button>
                            {audioError && (
                                <p className="mt-1.5 text-[11px] text-rose-500 text-center">{audioError}</p>
                            )}
                        </div>
                    </div>

                    {/* Live Emergency Transfer & Safety */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                            <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            <span>Safety & Live Nurse Transfer</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Hospital Casualty / Nurse Phone
                                </label>
                                <input
                                    type="text"
                                    value={liveTransferNumber}
                                    onChange={(e) => setLiveTransferNumber(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                    placeholder="+91 80 4567 8911"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Emergency Trigger Keywords (Comma-separated)
                                </label>
                                <textarea
                                    rows={2}
                                    value={emergencyKeywords}
                                    onChange={(e) => setEmergencyKeywords(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 p-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                    placeholder="chest pain, fever, severe pain, bleeding, emergency"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: AI Brain System Prompt & Dynamic Variables */}
                <div className="space-y-4 lg:col-span-2">
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Conversational Telugu System Prompt (Groq LPU Powered)
                                </h3>
                            </div>
                            <span className="text-[11px] text-zinc-500">
                                Latency: &lt;150ms TTFT
                            </span>
                        </div>

                        {/* Variable Insertion Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                            <span className="text-[11px] text-zinc-500">Insert Tag:</span>
                            {["patient_name", "doctor_name", "scheduled_slot", "brand_name"].map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => insertTag(tag)}
                                    className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-mono text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                                >
                                    +{`{{${tag}}}`}
                                </button>
                            ))}
                        </div>

                        <textarea
                            rows={16}
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 p-3 font-mono text-xs text-zinc-900 leading-relaxed focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                            placeholder="Enter the system instructions for the Voice AI receptionist..."
                        />

                        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                            <span>Keep response guidelines concise (1-2 sentences) for human phone pacing.</span>
                            <span>{systemPrompt.length} chars</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

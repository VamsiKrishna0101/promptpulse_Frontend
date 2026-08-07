import React, { useState, useRef, useEffect } from "react"
import {
    X,
    Phone,
    PhoneCall,
    Mic,
    Volume2,
    Play,
    Pause,
    Send,
    ShieldAlert,
    CheckCircle2,
    Sparkles,
    RefreshCw,
    Radio,
} from "lucide-react"

interface ChatTurn {
    sender: "ai" | "user"
    text: string
    timestamp: string
    audioUrl?: string
}

interface LiveVoiceCallTesterModalProps {
    isOpen: boolean
    onClose: () => void
    defaultHospitalName?: string
}

export const LiveVoiceCallTesterModal: React.FC<LiveVoiceCallTesterModalProps> = ({
    isOpen,
    onClose,
    defaultHospitalName = "వికాస్ హాస్పిటల్స్ (Vikas Hospitals)",
}) => {
    const [testMode, setTestMode] = useState<"BROWSER_CALL" | "PHONE_DIAL">("BROWSER_CALL")
    const [hospitalName, setHospitalName] = useState(defaultHospitalName)
    const [doctorName, setDoctorName] = useState("డాక్టర్ సురేష్ రెడ్డి (Dr. Suresh Reddy)")
    const [patientName, setPatientName] = useState("వికాస్ గారు (Vikas)")
    const [phoneNumber, setPhoneNumber] = useState("+91")

    // Browser Call State
    const [isCallActive, setIsCallActive] = useState(false)
    const [isProcessingTurn, setIsProcessingTurn] = useState(false)
    const [userInputText, setUserInputText] = useState("")
    const [dialogueHistory, setDialogueHistory] = useState<ChatTurn[]>([])
    const [lastIntent, setLastIntent] = useState<string | null>(null)
    const [isUrgentAlert, setIsUrgentAlert] = useState(false)
    const currentAudioRef = useRef<HTMLAudioElement | null>(null)

    // Phone Dial State
    const [isDialingPhone, setIsDialingPhone] = useState(false)
    const [phoneDialStatus, setPhoneDialStatus] = useState<string | null>(null)
    const [phoneDialError, setPhoneDialError] = useState<string | null>(null)

    useEffect(() => {
        return () => {
            if (currentAudioRef.current) {
                currentAudioRef.current.pause()
            }
        }
    }, [])

    if (!isOpen) return null

    const playBase64Audio = (dataUri: string) => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause()
        }
        const audio = new Audio(dataUri)
        currentAudioRef.current = audio
        audio.play().catch((err) => console.warn("Audio play blocked:", err))
    }

    const startBrowserCall = async () => {
        setIsCallActive(true)
        setIsProcessingTurn(true)
        setDialogueHistory([])
        setIsUrgentAlert(false)
        setLastIntent(null)

        try {
            const response = await fetch("http://localhost:4000/api/voice/interactive/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userSpeech: "__INITIAL_GREETING__",
                    hospitalName,
                    doctorName,
                    patientName,
                    playbookType: "OPD_CONFIRMATION",
                }),
            })

            const data = await response.json()
            if (data.replyTelugu) {
                const turn: ChatTurn = {
                    sender: "ai",
                    text: data.replyTelugu,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                    audioUrl: data.audioBase64,
                }
                setDialogueHistory([turn])
                if (data.audioBase64) {
                    playBase64Audio(data.audioBase64)
                }
            }
        } catch (err: any) {
            console.error("Initial call greeting error:", err)
        } finally {
            setIsProcessingTurn(false)
        }
    }

    const handleSendTurn = async (customMessage?: string) => {
        const messageToSend = customMessage || userInputText.trim()
        if (!messageToSend || isProcessingTurn) return

        setUserInputText("")
        const userTurn: ChatTurn = {
            sender: "user",
            text: messageToSend,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        }

        const newHistory = [...dialogueHistory, userTurn]
        setDialogueHistory(newHistory)
        setIsProcessingTurn(true)

        try {
            const response = await fetch("http://localhost:4000/api/voice/interactive/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userSpeech: messageToSend,
                    history: newHistory,
                    hospitalName,
                    doctorName,
                    patientName,
                }),
            })

            const data = await response.json()
            if (data.replyTelugu) {
                const aiTurn: ChatTurn = {
                    sender: "ai",
                    text: data.replyTelugu,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                    audioUrl: data.audioBase64,
                }
                setDialogueHistory([...newHistory, aiTurn])
                setLastIntent(data.intent)
                setIsUrgentAlert(data.isUrgent)

                if (data.audioBase64) {
                    playBase64Audio(data.audioBase64)
                }
            }
        } catch (err: any) {
            console.error("Turn processing error:", err)
        } finally {
            setIsProcessingTurn(false)
        }
    }

    const handleDialRealPhone = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setPhoneDialError("Please enter a valid 10-digit Indian phone number with +91")
            return
        }

        setIsDialingPhone(true)
        setPhoneDialStatus(null)
        setPhoneDialError(null)

        try {
            const response = await fetch("http://localhost:4000/api/voice/test-call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phoneNumber,
                    patientName,
                    doctorName,
                    hospitalName,
                }),
            })

            const data = await response.json()
            if (!response.ok || !data.success) {
                throw new Error(data.message || data.error || "Failed to trigger outbound call")
            }

            setPhoneDialStatus(data.message || `Outbound telephone call initiated to ${phoneNumber}!`)
        } catch (err: any) {
            setPhoneDialError(err.message || "Failed to dial phone")
        } finally {
            setIsDialingPhone(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                            <Radio className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-900">
                                    🎙️ Live Telugu Voice AI Tester
                                </h3>
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5">
                                    Azure + Groq Llama 3.3
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Experience real 2-way Telugu voice calling via browser audio or trigger a real PSTN phone call.
                            </p>
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

                {/* Mode Selector */}
                <div className="grid grid-cols-2 p-3 bg-slate-100/70 border-b border-slate-200 gap-2">
                    <button
                        type="button"
                        onClick={() => setTestMode("BROWSER_CALL")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            testMode === "BROWSER_CALL"
                                ? "bg-white text-blue-700 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Volume2 className="h-4 w-4 text-blue-600" />
                        <span>1. Live Browser Call (Audio & Mic)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTestMode("PHONE_DIAL")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            testMode === "PHONE_DIAL"
                                ? "bg-white text-emerald-700 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <PhoneCall className="h-4 w-4 text-emerald-600" />
                        <span>2. Ring My Real Mobile Phone</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-5 flex-1">
                    {/* BROWSER CALL MODE */}
                    {testMode === "BROWSER_CALL" && (
                        <div className="space-y-4">
                            {!isCallActive ? (
                                <div className="text-center py-8 space-y-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg mx-auto">
                                        <Volume2 className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-slate-900">
                                            Start Live Audio Call with Shruti AI
                                        </h4>
                                        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                                            Shruti AI will speak in natural Telugu as <strong>{hospitalName}</strong> calling to confirm tomorrow's doctor appointment.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={startBrowserCall}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-transform active:scale-95"
                                    >
                                        <Phone className="h-4 w-4" /> Connect & Start Talking (Telugu)
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Call Status Strip */}
                                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-2xl p-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-xs font-bold text-blue-950">
                                                Live Call Active: Shruti AI (KIMS / Vikas Hospitals)
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsCallActive(false)
                                                if (currentAudioRef.current) currentAudioRef.current.pause()
                                            }}
                                            className="text-xs font-bold text-rose-600 hover:underline"
                                        >
                                            End Call
                                        </button>
                                    </div>

                                    {/* Emergency Alert Banner */}
                                    {isUrgentAlert && (
                                        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-bold text-red-900 flex items-center gap-2 animate-pulse">
                                            <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
                                            <span>🚨 Live Emergency Clinical Triage Triggered! Connecting to Casualty Nurse...</span>
                                        </div>
                                    )}

                                    {/* Live Dialogue Turns */}
                                    <div className="max-h-64 overflow-y-auto space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                                        {dialogueHistory.map((turn, i) => (
                                            <div
                                                key={i}
                                                className={`flex flex-col ${
                                                    turn.sender === "ai" ? "items-start" : "items-end"
                                                }`}
                                            >
                                                <div className="flex items-center gap-1.5 mb-1 px-1">
                                                    <span className="text-[10px] font-bold text-slate-500">
                                                        {turn.sender === "ai" ? "🤖 Shruti (Telugu AI)" : "👤 You"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        {turn.timestamp}
                                                    </span>
                                                </div>

                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed ${
                                                        turn.sender === "ai"
                                                            ? "bg-white text-slate-900 border border-slate-200 rounded-tl-sm font-semibold"
                                                            : "bg-blue-600 text-white rounded-tr-sm font-medium"
                                                    }`}
                                                >
                                                    <p>{turn.text}</p>
                                                    {turn.audioUrl && (
                                                        <button
                                                            type="button"
                                                            onClick={() => playBase64Audio(turn.audioUrl!)}
                                                            className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200"
                                                        >
                                                            <Play className="h-3 w-3" /> Replay Audio
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {isProcessingTurn && (
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 py-2">
                                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
                                                <span>Shruti AI is thinking & speaking in Telugu...</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Telugu Patient Answers */}
                                    <div>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                            Quick Patient Answers (Click to speak):
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[
                                                { label: "🟢 తప్పకుండా వస్తాను (Coming)", val: "అవునండి నేను రేపు ఉదయం తప్పకుండా వస్తున్నాను." },
                                                { label: "🟡 రేపు కుదరదు మార్చండి (Reschedule)", val: "రేపు ఉదయం నాకు కుదరదండి, సాయంత్రం 4 గంటలకి మార్చగలరా?" },
                                                { label: "🔴 రద్దు చేయండి (Cancel)", val: "ప్రస్తుతానికి అపాయింట్‌మెంట్ రద్దు చేయండి." },
                                                { label: "🚨 ఛాతీ నొప్పి వస్తుంది (Chest Pain)", val: "నాకు ఛాతీలో చాలా నొప్పిగా ఉంది, ఊపిరి ఆడటం లేదు." },
                                            ].map((q, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    disabled={isProcessingTurn}
                                                    onClick={() => handleSendTurn(q.val)}
                                                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 disabled:opacity-50 transition-colors shadow-sm"
                                                >
                                                    {q.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Message Input */}
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault()
                                            handleSendTurn()
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={userInputText}
                                            onChange={(e) => setUserInputText(e.target.value)}
                                            placeholder="Type or reply in Telugu or English..."
                                            className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isProcessingTurn || !userInputText.trim()}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PHONE DIAL MODE */}
                    {testMode === "PHONE_DIAL" && (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                                    Direct Indian Mobile Phone Ringing
                                </h4>
                                <p className="text-xs text-emerald-800 mt-1">
                                    Enter your 10-digit mobile number to receive an actual phone call from Shruti AI using Indian cloud telephony (Plivo / Exotel).
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                                    Your Mobile Number (+91)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+919876543210"
                                        className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            {phoneDialStatus && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                    <span>{phoneDialStatus}</span>
                                </div>
                            )}

                            {phoneDialError && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                                    {phoneDialError}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleDialRealPhone}
                                disabled={isDialingPhone}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                                {isDialingPhone ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" /> Dialing Your Phone...
                                    </>
                                ) : (
                                    <>
                                        <PhoneCall className="h-4 w-4" /> Dial My Phone Now (+91)
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-6 py-3.5 bg-slate-50/50 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                        Azure Neural Speech • Sub-300ms Latency
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

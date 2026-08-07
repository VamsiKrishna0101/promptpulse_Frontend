import React, { useState, useEffect } from "react"
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    XCircle,
    Calendar,
    PhoneCall,
    Volume2,
    MessageSquare,
    Play,
    RefreshCw,
    ShieldAlert,
    User,
    ChevronRight,
    Square,
} from "lucide-react"
import type { VoiceCampaign, VoiceCallRecord, VoiceOutcomeIntent } from "@/lib/voiceApi"
import { getVoiceCampaign, listVoiceCallRecords, processVoiceBatch } from "@/lib/voiceApi"

interface Props {
    campaignId: string
    onBack: () => void
}

export function VoiceLiveDeskView({ campaignId, onBack }: Props) {
    const [campaign, setCampaign] = useState<VoiceCampaign | null>(null)
    const [records, setRecords] = useState<VoiceCallRecord[]>([])
    const [filterIntent, setFilterIntent] = useState<string>("ALL")
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState<VoiceCallRecord | null>(null)
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)

    useEffect(() => {
        loadData()
        const interval = setInterval(loadData, 5000) // auto-refresh live desk every 5s
        return () => clearInterval(interval)
    }, [campaignId])

    async function loadData() {
        try {
            const [campData, recs] = await Promise.all([
                getVoiceCampaign(campaignId),
                listVoiceCallRecords(campaignId),
            ])
            setCampaign(campData.campaign)
            setRecords(recs)
        } catch (err) {
            console.error("Failed to load live desk:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    async function handleSimulateNextBatch() {
        try {
            setRefreshing(true)
            await processVoiceBatch(campaignId)
            await loadData()
        } catch (err) {
            console.error("Failed to process batch:", err)
        } finally {
            setRefreshing(false)
        }
    }

    function playAudio(record: VoiceCallRecord) {
        if (playingAudioId === record.id) {
            if ("speechSynthesis" in window) window.speechSynthesis.cancel()
            setPlayingAudioId(null)
            return
        }

        setPlayingAudioId(record.id)
        if ("speechSynthesis" in window) {
            const text = record.transcript?.[0]?.text || "నమస్తే! సిటీ కేర్ హాస్పిటల్ నుండి మాట్లాడుతున్నాను."
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = "te-IN"
            utterance.onend = () => setPlayingAudioId(null)
            utterance.onerror = () => setPlayingAudioId(null)
            window.speechSynthesis.cancel()
            window.speechSynthesis.speak(utterance)
        } else {
            setTimeout(() => setPlayingAudioId(null), 3000)
        }
    }

    const filteredRecords = records.filter((r) => {
        if (filterIntent === "ALL") return true
        if (filterIntent === "URGENT") return r.is_urgent || r.outcome_intent === "URGENT_EMERGENCY_ESCALATION"
        return r.outcome_intent === filterIntent
    })

    const total = campaign?.total_recipients || records.length
    const confirmed = campaign?.confirmed_count || records.filter((r) => r.outcome_intent === "CONFIRMED").length
    const rescheduled = campaign?.rescheduled_count || records.filter((r) => r.outcome_intent === "RESCHEDULED").length
    const cancelled = campaign?.cancelled_count || records.filter((r) => r.outcome_intent === "CANCELLED").length
    const urgent = campaign?.urgent_count || records.filter((r) => r.is_urgent || r.outcome_intent === "URGENT_EMERGENCY_ESCALATION").length

    if (loading && !campaign) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Top Navigation & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {campaign?.name || "Voice AI Campaign"}
                            </h2>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Live Desk
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500">
                            Pacing: {campaign?.concurrent_limit || 10} concurrent lines • Language: Telugu (te-IN)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleSimulateNextBatch}
                        disabled={refreshing}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        Trigger Next Batch Call
                    </button>
                </div>
            </div>

            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <span className="text-xs text-zinc-500 font-medium">Total In Queue</span>
                    <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{total}</p>
                </div>

                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Confirmed (Coming)</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">{confirmed}</p>
                </div>

                <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-amber-800 dark:text-amber-300">Rescheduled</span>
                        <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">{rescheduled}</p>
                </div>

                <div className="rounded-xl border border-rose-200/80 bg-rose-50/40 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-rose-800 dark:text-rose-300">Cancelled / Freed</span>
                        <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-400">{cancelled}</p>
                </div>

                <div className="rounded-xl border border-red-300 bg-red-50/60 p-4 dark:border-red-900/60 dark:bg-red-950/30">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-red-800 dark:text-red-300">🚨 Urgent Escalation</span>
                        <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-400">{urgent}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-200 pb-2 dark:border-zinc-800">
                {[
                    { id: "ALL", label: `All Calls (${records.length})` },
                    { id: "CONFIRMED", label: `Confirmed (${confirmed})` },
                    { id: "RESCHEDULED", label: `Rescheduled (${rescheduled})` },
                    { id: "CANCELLED", label: `Cancelled (${cancelled})` },
                    { id: "URGENT", label: `Urgent Alerts (${urgent})` },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilterIntent(tab.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            filterIntent === tab.id
                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Live Patient Calls Table */}
            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                            <tr>
                                <th className="p-3.5">Patient Details</th>
                                <th className="p-3.5">Doctor & Scheduled Slot</th>
                                <th className="p-3.5">Call Outcome</th>
                                <th className="p-3.5">AI Summary</th>
                                <th className="p-3.5">Duration</th>
                                <th className="p-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                                        No call records match the selected filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((r) => {
                                    const isPlaying = playingAudioId === r.id
                                    return (
                                        <tr key={r.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                            <td className="p-3.5">
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {r.patient_name}
                                                </div>
                                                <div className="font-mono text-[11px] text-zinc-500">
                                                    {r.patient_phone}
                                                </div>
                                            </td>

                                            <td className="p-3.5">
                                                <div className="text-zinc-800 dark:text-zinc-200 font-medium">
                                                    {r.doctor_name || "—"}
                                                </div>
                                                <div className="text-[11px] text-zinc-500">
                                                    {r.scheduled_slot || "—"}
                                                </div>
                                            </td>

                                            <td className="p-3.5">
                                                {r.outcome_intent === "CONFIRMED" && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                        <CheckCircle2 className="h-3 w-3" /> Confirmed (Coming)
                                                    </span>
                                                )}
                                                {r.outcome_intent === "RESCHEDULED" && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                                        <Calendar className="h-3 w-3" /> Rescheduled
                                                    </span>
                                                )}
                                                {r.outcome_intent === "CANCELLED" && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                                                        <XCircle className="h-3 w-3" /> Cancelled
                                                    </span>
                                                )}
                                                {r.outcome_intent === "URGENT_EMERGENCY_ESCALATION" && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800 dark:bg-red-950 dark:text-red-200">
                                                        <ShieldAlert className="h-3 w-3" /> 🚨 Nurse Escalated
                                                    </span>
                                                )}
                                                {r.outcome_intent === "UNKNOWN" && (
                                                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                                        Queued
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-3.5 max-w-xs text-[11px] text-zinc-600 dark:text-zinc-400">
                                                {r.ai_summary || "Call queued for dialing."}
                                            </td>

                                            <td className="p-3.5 font-mono text-[11px] text-zinc-500">
                                                {r.duration_seconds > 0 ? `${r.duration_seconds}s` : "—"}
                                            </td>

                                            <td className="p-3.5 text-right space-x-1.5">
                                                {/* Audio Player Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => playAudio(r)}
                                                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                                                        isPlaying
                                                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                                                            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                                                    }`}
                                                >
                                                    {isPlaying ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3" />}
                                                    <span>{isPlaying ? "Playing..." : "Audio"}</span>
                                                </button>

                                                {/* Transcript Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedRecord(r)}
                                                    className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                                                >
                                                    <MessageSquare className="h-3 w-3" />
                                                    <span>Transcript</span>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Telugu Transcript Modal Drawer */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex items-start justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
                            <div>
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                    Call Transcript: {selectedRecord.patient_name}
                                </h3>
                                <p className="text-xs text-zinc-500">
                                    {selectedRecord.patient_phone} • Duration: {selectedRecord.duration_seconds}s
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRecord(null)}
                                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Dialogue Bubbles */}
                        <div className="my-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                            {selectedRecord.transcript && selectedRecord.transcript.length > 0 ? (
                                selectedRecord.transcript.map((t, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex flex-col ${
                                            t.sender === "ai"
                                                ? "items-start"
                                                : t.sender === "user"
                                                ? "items-end"
                                                : "items-center"
                                        }`}
                                    >
                                        <span className="text-[10px] text-zinc-400 mb-0.5">
                                            {t.sender === "ai" ? "Shruti (AI Voice)" : t.sender === "user" ? "Patient" : "System Alert"} • {t.timestamp}
                                        </span>
                                        <div
                                            className={`rounded-2xl px-4 py-2.5 text-xs max-w-[85%] ${
                                                t.sender === "ai"
                                                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                                                    : t.sender === "user"
                                                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                                    : "bg-red-50 text-red-700 font-semibold border border-red-200 dark:bg-red-950 dark:text-red-300"
                                            }`}
                                        >
                                            {t.text}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-xs text-zinc-500">No transcript available for this call record.</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-3 border-t border-zinc-200 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setSelectedRecord(null)}
                                className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                            >
                                Close Transcript
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

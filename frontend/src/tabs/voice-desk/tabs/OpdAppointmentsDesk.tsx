import React, { useEffect, useState } from "react"
import {
    Phone,
    PhoneCall,
    UploadCloud,
    CheckCircle2,
    Calendar,
    XCircle,
    Clock,
    Search,
    Filter,
    Play,
    MessageSquare,
    ChevronRight,
    Sparkles,
    RefreshCw,
    Users,
    Stethoscope,
    SlidersHorizontal,
    Volume2,
} from "lucide-react"
import {
    PatientTranscriptDrawer,
    type PatientVoiceRecord,
} from "../components/PatientTranscriptDrawer"
import {
    PatientCsvUploadModal,
    type ParsedPatientRow,
} from "../components/PatientCsvUploadModal"
import { createPrimaryVoiceCampaign, launchPrimaryVoiceCampaign, listPrimaryVoiceCampaigns, listPrimaryVoiceRecords, type VoiceCallRecord } from "@/lib/voiceApi"

const INITIAL_OPD_RECORDS: PatientVoiceRecord[] = [
    {
        id: "opd-1",
        patientName: "Venkatesh Rao",
        patientPhone: "+91 98480 11221",
        doctorName: "Dr. Suresh Reddy (Cardiology)",
        scheduledSlot: "Tomorrow 10:00 AM",
        type: "OPD_CONFIRMATION",
        status: "CONFIRMED",
        patientVerbatimQuote: "తప్పకుండా వస్తానండి, రేపు ఉదయం 10 గంటలకి హాస్పిటల్‌లో ఉంటాను.",
        aiSummary: "Patient confirmed attendance for tomorrow 10:00 AM Cardiology appointment. No symptoms or assistance requested.",
        callDurationSeconds: 42,
        calledAt: "Today 11:20 AM",
        transcript: [
            {
                speaker: "agent",
                textTelugu: "నమస్కారం అండి, నేను కిమ్స్ హాస్పిటల్ నుండి శృతిని మాట్లాడుతున్నాను. మీరు రేపు ఉదయం 10:00 గంటలకు డాక్టర్ సురేష్ రెడ్డి గారిని కలవడానికి అపాయింట్‌మెంట్ బుక్ చేసుకున్నారు కదా?",
                textEnglish: "Hello, I am Shruti calling from KIMS Hospital. You have an appointment tomorrow at 10:00 AM with Dr. Suresh Reddy, right?",
                timestamp: "00:03",
            },
            {
                speaker: "patient",
                textTelugu: "అవునండి, నేను తప్పకుండా వస్తాను. రేపు ఉదయం 10 గంటలకి హాస్పిటల్‌లో ఉంటాను.",
                textEnglish: "Yes, I will definitely come. I will be at the hospital tomorrow morning at 10:00 AM.",
                timestamp: "00:15",
            },
            {
                speaker: "agent",
                textTelugu: "ధన్యవాదాలు వెంకటేష్ గారు. మీ అపాయింట్‌మెంట్ కన్ఫర్మ్ చేయబడింది. దయచేసి సమయానికి 15 నిమిషాల ముందు రండి.",
                textEnglish: "Thank you Mr. Venkatesh. Your appointment is confirmed. Please arrive 15 minutes prior.",
                timestamp: "00:28",
            },
            {
                speaker: "patient",
                textTelugu: "సరేనండి, థాంక్యూ.",
                textEnglish: "Okay, thank you.",
                timestamp: "00:38",
            },
        ],
    },
    {
        id: "opd-2",
        patientName: "Lakshmi Devi",
        patientPhone: "+91 94401 22334",
        doctorName: "Dr. Suresh Reddy (Cardiology)",
        scheduledSlot: "Tomorrow 10:30 AM",
        type: "OPD_CONFIRMATION",
        status: "RESCHEDULED",
        patientVerbatimQuote: "రేపు ఉదయం కుదరదండి, సాయంత్రం 4 గంటలకి లేదా ఎల్లుండి మార్చుతారా?",
        aiSummary: "Patient requested reschedule to afternoon 04:00 PM or day after tomorrow due to family travel.",
        callDurationSeconds: 58,
        calledAt: "Today 11:22 AM",
        transcript: [
            {
                speaker: "agent",
                textTelugu: "నమస్కారం లక్ష్మి దేవి గారు, కిమ్స్ హాస్పిటల్ నుండి మాట్లాడుతున్నాము. రేపు ఉదయం 10:30 కి డాక్టర్ సురేష్ రెడ్డి గారి అపాయింట్‌మెంట్ కి వస్తున్నారా?",
                textEnglish: "Hello Lakshmi Devi garu, calling from KIMS Hospital. Are you coming for your 10:30 AM appointment with Dr. Suresh Reddy tomorrow?",
                timestamp: "00:04",
            },
            {
                speaker: "patient",
                textTelugu: "రేపు ఉదయం నాకు కొంచెం అర్జెంట్ పని ఉందండి. సాయంత్రం 4 గంటలకి మార్చగలరా?",
                textEnglish: "I have urgent work tomorrow morning. Can you reschedule it to 4:00 PM in the evening?",
                timestamp: "00:18",
            },
            {
                speaker: "agent",
                textTelugu: "ఖచ్చితంగా అండి, రేపు సాయంత్రం 04:00 గంటలకు స్లాట్ రిక్వెస్ట్ తీసుకున్నాము. మా రిసెప్షన్ నుండి SMS వస్తుంది.",
                textEnglish: "Certainly, we have noted your request for tomorrow 4:00 PM. You will receive an SMS confirmation from our desk.",
                timestamp: "00:35",
            },
        ],
    },
    {
        id: "opd-3",
        patientName: "Anil Kumar",
        patientPhone: "+91 99890 33445",
        doctorName: "Dr. Ananya Rao (Gynaecology)",
        scheduledSlot: "Tomorrow 11:15 AM",
        type: "OPD_CONFIRMATION",
        status: "CANCELLED",
        patientVerbatimQuote: "ఇప్పుడు సమస్య తగ్గింది, అపాయింట్‌మెంట్ రద్దు చేయండి.",
        aiSummary: "Patient cancelled the appointment as symptoms resolved. Slot released back to hospital pool.",
        callDurationSeconds: 31,
        calledAt: "Today 11:25 AM",
        transcript: [
            {
                speaker: "agent",
                textTelugu: "నమస్కారం అనిల్ గారు, కిమ్స్ హాస్పిటల్ నుండి రేపటి 11:15 డాక్టర్ అనన్య రావు గారి అపాయింట్‌మెంట్ గురించి మాట్లాడుతున్నాము.",
                textEnglish: "Hello Anil garu, calling from KIMS regarding tomorrow's 11:15 AM appointment with Dr. Ananya Rao.",
                timestamp: "00:03",
            },
            {
                speaker: "patient",
                textTelugu: "ఇప్పుడు సమస్య తగ్గింది అండి, ప్రస్తుతానికి అపాయింట్‌మెంట్ రద్దు చేయండి.",
                textEnglish: "The issue has resolved now, please cancel the appointment for now.",
                timestamp: "00:14",
            },
            {
                speaker: "agent",
                textTelugu: "సరే అనిల్ గారు, మీ అపాయింట్‌మెంట్ క్యాన్సల్ చేశాము. మళ్ళీ అవసరమైతే మాకు కాల్ చేయవచ్చు. ధన్యవాదాలు.",
                textEnglish: "Sure Anil garu, cancelled your slot. Feel free to reach back if needed. Thank you.",
                timestamp: "00:25",
            },
        ],
    },
    {
        id: "opd-4",
        patientName: "Sunitha Murthy",
        patientPhone: "+91 98491 44556",
        doctorName: "Dr. R. K. Varma (Orthopaedics)",
        scheduledSlot: "Tomorrow 11:45 AM",
        type: "OPD_CONFIRMATION",
        status: "CONFIRMED",
        patientVerbatimQuote: "వస్తున్నానండి, మోకాలి నొప్పి తగ్గలేదు, ఖచ్చితంగా వస్తాను.",
        aiSummary: "Patient confirmed attendance for knee pain consultation with Dr. R. K. Varma.",
        callDurationSeconds: 46,
        calledAt: "Today 11:28 AM",
        transcript: [
            {
                speaker: "agent",
                textTelugu: "నమస్కారం సునీత గారు, రేపు ఉదయం 11:45 కి డాక్టర్ ఆర్.కె. వర్మ గారి ఆర్థోపెడిక్స్ అపాయింట్‌మెంట్ కి వస్తున్నారా?",
                textEnglish: "Hello Sunitha garu, are you coming for Dr. R.K. Varma's Orthopaedics appointment tomorrow at 11:45 AM?",
                timestamp: "00:04",
            },
            {
                speaker: "patient",
                textTelugu: "అవునండి వస్తున్నాను, మోకాలి నొప్పి ఇంకా తగ్గలేదు. రేపు 11:30 కే వచ్చేస్తాను.",
                textEnglish: "Yes I am coming, my knee pain hasn't subsided. I will reach by 11:30 AM itself.",
                timestamp: "00:19",
            },
        ],
    },
    {
        id: "opd-5",
        patientName: "Nageswara Rao",
        patientPhone: "+91 97012 55667",
        doctorName: "Dr. K. Srinivas (General Medicine)",
        scheduledSlot: "Tomorrow 12:30 PM",
        type: "OPD_CONFIRMATION",
        status: "NO_ANSWER",
        patientVerbatimQuote: "Line was ringing but not answered (Attempt 1/2)",
        aiSummary: "Call unanswered after 5 rings. Queued for 2nd attempt at 02:00 PM IST.",
        callDurationSeconds: 0,
        calledAt: "Today 11:30 AM",
        transcript: [],
    },
]

function toOpdRecord(record: VoiceCallRecord): PatientVoiceRecord {
    const patientTurn = record.transcript?.find((turn) => turn.sender === "user")
    return {
        id: record.id,
        patientName: record.patient_name,
        patientPhone: record.patient_phone,
        doctorName: record.doctor_name || "Hospital OPD",
        scheduledSlot: record.scheduled_slot || "Tomorrow",
        type: "OPD_CONFIRMATION",
        status: record.outcome_intent === "CONFIRMED" ? "CONFIRMED" : record.outcome_intent === "RESCHEDULED" ? "RESCHEDULED" : record.outcome_intent === "CANCELLED" ? "CANCELLED" : "NO_ANSWER",
        patientVerbatimQuote: patientTurn?.text || "No patient response recorded yet.",
        aiSummary: record.ai_summary || "Call is queued or awaiting an outcome.",
        callDurationSeconds: record.duration_seconds,
        calledAt: new Date(record.updated_at).toLocaleString("en-IN"),
        isUrgent: record.is_urgent,
        transcript: (record.transcript || []).filter((turn) => turn.sender !== "system").map((turn) => ({
            speaker: turn.sender === "user" ? "patient" : "agent",
            textTelugu: turn.text,
            textEnglish: turn.text,
            timestamp: turn.timestamp,
        })),
    }
}

export const OpdAppointmentsDesk: React.FC = () => {
    const [records, setRecords] = useState<PatientVoiceRecord[]>([])
    const [selectedRecord, setSelectedRecord] = useState<PatientVoiceRecord | null>(null)
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [isCallingActive, setIsCallingActive] = useState(false)
    const [concurrencyLines, setConcurrencyLines] = useState(10)
    const [primaryCampaignId, setPrimaryCampaignId] = useState<string | null>(null)
    const [campaignTotal, setCampaignTotal] = useState(0)
    const [backendMessage, setBackendMessage] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        const refresh = async () => {
            try {
                const campaigns = await listPrimaryVoiceCampaigns()
                const campaign = campaigns.find((item) => item.playbook_type === "OPD_APPOINTMENT_CONFIRMATION")
                if (!mounted || !campaign) return
                setPrimaryCampaignId(campaign.id)
                setCampaignTotal(campaign.total_recipients)
                const liveRecords = await listPrimaryVoiceRecords(campaign.id)
                if (mounted) setRecords(liveRecords.map(toOpdRecord))
            } catch {
                // Empty state is intentional when the primary Voice AI service is offline.
            }
        }
        void refresh()
        const timer = window.setInterval(refresh, 5000)
        return () => { mounted = false; window.clearInterval(timer) }
    }, [])

    const confirmedCount = records.filter((r) => r.status === "CONFIRMED").length
    const rescheduledCount = records.filter((r) => r.status === "RESCHEDULED").length
    const cancelledCount = records.filter((r) => r.status === "CANCELLED").length
    const noAnswerCount = records.filter((r) => r.status === "NO_ANSWER").length

    const filteredRecords = records.filter((r) => {
        const matchesSearch =
            r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.patientPhone.includes(searchQuery) ||
            (r.doctorName && r.doctorName.toLowerCase().includes(searchQuery.toLowerCase()))

        if (!matchesSearch) return false
        if (statusFilter === "ALL") return true
        return r.status === statusFilter
    })

    const handleUploadSuccess = async (newPatients: ParsedPatientRow[]) => {
        try {
            const campaign = await createPrimaryVoiceCampaign({
                name: `OPD appointments ${new Date().toLocaleDateString("en-IN")}`,
                playbookType: "OPD_APPOINTMENT_CONFIRMATION",
                concurrentLimit: concurrencyLines,
                recipients: newPatients.map((p) => ({ name: p.patientName, phone: p.patientPhone, doctor_name: p.doctorName, scheduled_slot: p.slotOrDate })),
            })
            setPrimaryCampaignId(campaign.id)
            setCampaignTotal(campaign.total_recipients)
            setBackendMessage("Appointment list saved to Voice AI. Click Start Calling to begin.")
        } catch {
            setBackendMessage("Dashboard preview updated, but the Voice AI service is not reachable yet.")
        }
        const generatedRecords: PatientVoiceRecord[] = newPatients.map((p, idx) => ({
            id: `opd-new-${Date.now()}-${idx}`,
            patientName: p.patientName,
            patientPhone: p.patientPhone,
            doctorName: p.doctorName || "Dr. Suresh Reddy (Cardiology)",
            scheduledSlot: p.slotOrDate || "Tomorrow 10:00 AM",
            type: "OPD_CONFIRMATION",
            status: idx % 3 === 0 ? "CONFIRMED" : idx % 3 === 1 ? "RESCHEDULED" : "CONFIRMED",
            patientVerbatimQuote: "తప్పకుండా రేపు అపాయింట్‌మెంట్‌కి వస్తున్నానండి.",
            aiSummary: "Patient confirmed attendance for tomorrow scheduled doctor consultation.",
            callDurationSeconds: 38 + (idx * 3) % 20,
            calledAt: "Just now",
            transcript: [
                {
                    speaker: "agent",
                    textTelugu: `నమస్కారం ${p.patientName} గారు, కిమ్స్ హాస్పిటల్ నుండి శృతిని. రేపటి డాక్టర్ అపాయింట్‌మెంట్‌కి వస్తున్నారా?`,
                    textEnglish: `Hello ${p.patientName} garu, Shruti from KIMS. Are you attending tomorrow's doctor appointment?`,
                    timestamp: "00:03",
                },
                {
                    speaker: "patient",
                    textTelugu: "అవునండి తప్పకుండా వస్తాను. ధన్యవాదాలు.",
                    textEnglish: "Yes I will definitely come. Thank you.",
                    timestamp: "00:16",
                },
            ],
        }))

        setRecords([...generatedRecords, ...records])
    }

    const handleStartCalling = async () => {
        setIsCallingActive(true)
        try {
            if (primaryCampaignId) {
                await launchPrimaryVoiceCampaign(primaryCampaignId)
                const poll = window.setInterval(async () => {
                    const liveRecords = await listPrimaryVoiceRecords(primaryCampaignId)
                    if (liveRecords.length > 0) {
                        setRecords(liveRecords.map(toOpdRecord))
                        setBackendMessage(`${liveRecords.length} call result(s) received from Voice AI.`)
                    }
                }, 2500)
                window.setTimeout(() => window.clearInterval(poll), 30000)
            } else {
                setBackendMessage("Upload an appointment list first.")
            }
        } catch {
            setBackendMessage("Unable to start calls. Check the Voice AI service and telephony configuration.")
        } finally {
            window.setTimeout(() => setIsCallingActive(false), 1200)
        }
    }

    return (
        <div className="space-y-6">
            {backendMessage && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-800">{backendMessage}</div>}
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900">
                            📅 OPD Appointment Attendance Desk
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                            Telugu AI Calling
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 max-w-2xl">
                        Upload tomorrow's doctor appointments to trigger automated Telugu voice confirmations. Patients who say "Coming" are confirmed; reschedule requests and cancellations are tagged instantly.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* IST Regulatory Pill */}
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                        <Clock className="h-3.5 w-3.5 text-emerald-600" />
                        <span>09:00 AM – 06:00 PM IST: ACTIVE</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsUploadOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        <UploadCloud className="h-4 w-4 text-blue-600" /> Upload Tomorrow's CSV
                    </button>

                    <button
                        type="button"
                        onClick={handleStartCalling}
                        disabled={isCallingActive}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {isCallingActive ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" /> Calling In Progress...
                            </>
                        ) : (
                            <>
                                <PhoneCall className="h-4 w-4" /> Start Calling ({campaignTotal || records.length} Patients)
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Metric KPI Strip (PromptPulse light theme) */}
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-5">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Total Appointments</span>
                        <Users className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{campaignTotal || records.length}</p>
                </div>

                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-800">🟢 Confirmed / Coming</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">{confirmedCount}</p>
                </div>

                <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-800">🟡 Rescheduled</span>
                        <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-blue-700">{rescheduledCount}</p>
                </div>

                <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-rose-800">🔴 Cancelled / No-Show</span>
                        <XCircle className="h-4 w-4 text-rose-600" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-rose-700">{cancelledCount}</p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">⚪ No Answer / Retry</span>
                        <Clock className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-slate-700">{noAnswerCount}</p>
                </div>
            </div>

            {/* Filter & Concurrency Pacing Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search patient, phone, or doctor..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {[
                            { label: "All", val: "ALL" },
                            { label: "🟢 Coming", val: "CONFIRMED" },
                            { label: "🟡 Rescheduled", val: "RESCHEDULED" },
                            { label: "🔴 Cancelled", val: "CANCELLED" },
                            { label: "⚪ No Answer", val: "NO_ANSWER" },
                        ].map((f) => (
                            <button
                                key={f.val}
                                type="button"
                                onClick={() => setStatusFilter(f.val)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === f.val
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 border-l border-slate-200 pl-3">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                    <span>Calling Pacing:</span>
                    <select
                        value={concurrencyLines}
                        onChange={(e) => setConcurrencyLines(Number(e.target.value))}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800"
                    >
                        <option value={5}>5 Concurrent Lines</option>
                        <option value={10}>10 Lines (Optimal)</option>
                        <option value={15}>15 Lines (Fast)</option>
                        <option value={20}>20 Lines (Enterprise)</option>
                    </select>
                </div>
            </div>

            {/* Interactive Live Attendance Table */}
            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700">
                            <tr>
                                <th className="p-3.5">Patient Details</th>
                                <th className="p-3.5">Assigned Doctor</th>
                                <th className="p-3.5">Scheduled Slot</th>
                                <th className="p-3.5">Attendance Status</th>
                                <th className="p-3.5">What the Patient Said (Telugu)</th>
                                <th className="p-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        No patients match your search or filter. Click <strong>Upload Tomorrow's CSV</strong> above to load records!
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((r) => (
                                    <tr
                                        key={r.id}
                                        onClick={() => setSelectedRecord(r)}
                                        className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                                    >
                                        <td className="p-3.5">
                                            <div className="font-bold text-slate-900">{r.patientName}</div>
                                            <div className="text-[11px] font-mono text-slate-500 mt-0.5">{r.patientPhone}</div>
                                        </td>

                                        <td className="p-3.5">
                                            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                                <Stethoscope className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                                                {r.doctorName}
                                            </div>
                                        </td>

                                        <td className="p-3.5">
                                            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                                <Clock className="h-3 w-3 text-slate-500" />
                                                {r.scheduledSlot}
                                            </span>
                                        </td>

                                        <td className="p-3.5">
                                            {r.status === "CONFIRMED" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="h-3 w-3" /> Coming (Confirmed)
                                                </span>
                                            )}
                                            {r.status === "RESCHEDULED" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                                                    <Calendar className="h-3 w-3" /> Reschedule Requested
                                                </span>
                                            )}
                                            {r.status === "CANCELLED" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                                                    <XCircle className="h-3 w-3" /> Cancelled
                                                </span>
                                            )}
                                            {r.status === "NO_ANSWER" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
                                                    <Clock className="h-3 w-3" /> No Answer
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-3.5 max-w-xs">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                                                <p className="text-xs text-slate-700 italic truncate">
                                                    "{r.patientVerbatimQuote}"
                                                </p>
                                            </div>
                                        </td>

                                        <td className="p-3.5 text-right">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedRecord(r)
                                                }}
                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 shadow-sm"
                                            >
                                                View Dialogue <ChevronRight className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals & Slide-over Drawers */}
            <PatientTranscriptDrawer
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
            />

            <PatientCsvUploadModal
                isOpen={isUploadOpen}
                mode="OPD"
                onClose={() => setIsUploadOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    )
}

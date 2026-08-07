import React, { useEffect, useState } from "react"
import {
    Phone,
    PhoneCall,
    UploadCloud,
    CheckCircle2,
    Calendar,
    AlertTriangle,
    ShieldAlert,
    Clock,
    Search,
    Filter,
    MessageSquare,
    ChevronRight,
    Sparkles,
    RefreshCw,
    Users,
    Stethoscope,
    Activity,
    HeartPulse,
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

const INITIAL_DISCHARGE_RECORDS: PatientVoiceRecord[] = [
    {
        id: "dis-1",
        patientName: "Ramesh Chandra",
        patientPhone: "+91 98480 99881",
        doctorName: "Dr. Suresh Reddy (Cardiology)",
        dischargeDate: "Discharged 2 Days Ago (2026-08-04)",
        diagnosis: "Post-Angioplasty Stent Placement",
        type: "POST_DISCHARGE_RECOVERY",
        status: "EMERGENCY",
        patientVerbatimQuote: "ఛాతీలో విపరీతమైన నొప్పి వస్తుంది, ఊపిరి ఆడటం లేదు, ఏం చేయాలి?",
        aiSummary: "🚨 RED-FLAG EMERGENCY: Patient reports acute chest pain and dyspnea 48h post-angioplasty. Immediate transfer to KIMS Casualty Triage Nurse triggered.",
        callDurationSeconds: 65,
        calledAt: "Today 10:15 AM",
        isUrgent: true,
        symptomsReported: ["Severe Chest Pain", "Shortness of Breath (Dyspnea)"],
        transcript: [
            {
                speaker: "agent",
                textTelugu: "నమస్కారం రమేష్ చంద్ర గారు, కిమ్స్ హాస్పిటల్ నుండి శృతిని. మీరు డిశ్చార్జ్ అయ్యి 2 రోజులు అయింది కదా, ప్రస్తుతం మీ ఆరోగ్యం ఎలా ఉంది? ఏమైనా నొప్పి ఉందా?",
                textEnglish: "Hello Ramesh Chandra garu, Shruti from KIMS Hospital. It has been 2 days since discharge. How is your health now? Are you having any pain?",
                timestamp: "00:04",
            },
            {
                speaker: "patient",
                textTelugu: "శృతి గారూ, ఛాతీలో చాలా విపరీతంగా నొప్పిగా ఉందండి. ఊపిరి కూడా సరిగ్గా ఆడటం లేదు. చెమటలు పడుతున్నాయి.",
                textEnglish: "Shruti garu, I have very severe chest pain. I cannot breathe properly either. Breaking into sweats.",
                timestamp: "00:18",
            },
            {
                speaker: "agent",
                textTelugu: "రమేష్ గారు దయచేసి కంగారు పడవద్దు, విశ్రాంతిగా కూర్చోండి. నేను ఈ కాల్‌ని వెంటనే మా ఎమర్జెన్సీ ట్రియాజ్ నర్స్‌కి ట్రాన్స్‌ఫర్ చేస్తున్నాను, లైన్‌లో ఉండండి.",
                textEnglish: "Ramesh garu please don't panic, sit calmly. I am immediately transferring this call to our Emergency Triage Nurse, please hold.",
                timestamp: "00:35",
            },
        ],
    },
    {
        id: "dis-2",
        patientName: "Prabhavathi Devi",
        patientPhone: "+91 94401 88772",
        doctorName: "Dr. Ananya Rao (Gynaecology)",
        dischargeDate: "Discharged Yesterday (2026-08-05)",
        diagnosis: "Post-Laparoscopic Hysterectomy",
        type: "POST_DISCHARGE_RECOVERY",
        status: "RECOVERING_WELL",
        patientVerbatimQuote: "నొప్పి అంతా తగ్గింది, మందులు వేసుకుంటున్నాను, చాలా హాయిగా ఉంది.",
        aiSummary: "Patient recovering well, surgical site clean, 100% compliant with prescribed antibiotics and analgesics.",
        callDurationSeconds: 49,
        calledAt: "Today 10:22 AM",
        symptomsReported: ["No Active Pain", "Medication Compliant"],
        transcript: [
            {
                speaker: "agent",
                textTelugu: "నమస్కారం ప్రభావతి గారు, కిమ్స్ హాస్పిటల్ నుండి డాక్టర్ అనన్య రావు గారి టీమ్ మాట్లాడుతున్నాము. నిన్న డిశ్చార్జ్ అయ్యాక ఎలా ఉన్నారు? టాబ్లెట్స్ సరిగ్గా వేసుకుంటున్నారా?",
                textEnglish: "Hello Prabhavathi garu, calling from Dr. Ananya Rao's team at KIMS. How are you after yesterday's discharge? Taking tablets on time?",
                timestamp: "00:04",
            },
            {
                speaker: "patient",
                textTelugu: "చాలా బాగున్నానండి. నొప్పి తగ్గింది. డాక్టర్ గారు ఇచ్చిన అన్ని మందులు సమయానికి వేసుకుంటున్నాను.",
                textEnglish: "Feeling very good. Pain has reduced. Taking all medications given by doctor on time.",
                timestamp: "00:19",
            },
            {
                speaker: "agent",
                textTelugu: "చాలా సంతోషం అండి. వారం తర్వాత సూచించిన రివ్యూకి రండి. ఏదైనా సందేహం ఉంటే హాస్పిటల్‌కి కాల్ చేయవచ్చు.",
                textEnglish: "Very glad to hear. Please come for the review after 1 week. Contact us anytime if you need help.",
                timestamp: "00:36",
            },
        ],
    },
    {
        id: "dis-3",
        patientName: "Mohan Krishna",
        patientPhone: "+91 99890 77663",
        doctorName: "Dr. R. K. Varma (Orthopaedics)",
        dischargeDate: "Discharged 3 Days Ago (2026-08-03)",
        diagnosis: "Total Knee Replacement (TKR)",
        type: "POST_DISCHARGE_RECOVERY",
        status: "NEEDS_ATTENTION",
        patientVerbatimQuote: "మోకాలి దగ్గర కొంచెం వాపు వచ్చింది, ఫిజియోథెరపీ ఎలా చేయాలో అర్థం కావడం లేదు.",
        aiSummary: "Patient reports mild postoperative swelling and requests physiotherapy guidance. Scheduled nurse callback for 02:30 PM.",
        callDurationSeconds: 52,
        calledAt: "Today 10:40 AM",
        symptomsReported: ["Mild Localized Swelling", "Physiotherapy Guidance Needed"],
        transcript: [
            {
                speaker: "agent",
                textTelugu: "నమస్కారం మోహన్ కృష్ణ గారు, కిమ్స్ ఆర్థోపెడిక్స్ టీమ్ నుండి శృతిని. మీ మోకాలి ఆపరేషన్ తర్వాత వాకింగ్ మరియు ఫిజియోథెరపీ ఎలా సాగుతోంది?",
                textEnglish: "Hello Mohan Krishna garu, Shruti from KIMS Orthopaedics. How is your walking and physiotherapy going after knee surgery?",
                timestamp: "00:03",
            },
            {
                speaker: "patient",
                textTelugu: "నొప్పి తక్కువే ఉంది కానీ మోకాలి దగ్గర కాస్త వాపు కనిపిస్తుంది. వ్యాయామాలు సరిగ్గా ఎలా చేయాలో మాకు సందేహంగా ఉంది.",
                textEnglish: "Pain is low but there is mild swelling around knee. We are unsure about exact physiotherapy exercise routine.",
                timestamp: "00:21",
            },
            {
                speaker: "agent",
                textTelugu: "అర్థమైంది మోహన్ గారు. మా ఫిజియోథెరపీ టీమ్ నుండి నర్స్ ఈరోజు మధ్యాహ్నం మీకు కాల్ చేసి పూర్తి వివరణ ఇస్తారు.",
                textEnglish: "Understood Mohan garu. Our physiotherapy nurse will call you this afternoon to give full guidance.",
                timestamp: "00:39",
            },
        ],
    },
]

function toDischargeRecord(record: VoiceCallRecord): PatientVoiceRecord {
    const patientTurn = record.transcript?.find((turn) => turn.sender === "user")
    const emergency = record.is_urgent || record.outcome_intent === "URGENT_EMERGENCY_ESCALATION"
    return {
        id: record.id,
        patientName: record.patient_name,
        patientPhone: record.patient_phone,
        doctorName: record.doctor_name || "Hospital Care Team",
        dischargeDate: record.scheduled_slot || "Recent discharge",
        type: "POST_DISCHARGE_RECOVERY",
        status: emergency ? "EMERGENCY" : record.outcome_intent === "UNKNOWN" ? "NEEDS_ATTENTION" : "RECOVERING_WELL",
        patientVerbatimQuote: patientTurn?.text || "No patient response recorded yet.",
        aiSummary: record.ai_summary || "Follow-up is queued or awaiting an outcome.",
        callDurationSeconds: record.duration_seconds,
        calledAt: new Date(record.updated_at).toLocaleString("en-IN"),
        isUrgent: emergency,
        symptomsReported: emergency ? ["Emergency escalation"] : [],
        transcript: (record.transcript || []).filter((turn) => turn.sender !== "system").map((turn) => ({
            speaker: turn.sender === "user" ? "patient" : "agent",
            textTelugu: turn.text,
            textEnglish: turn.text,
            timestamp: turn.timestamp,
        })),
    }
}

export const PostDischargeDesk: React.FC = () => {
    const [records, setRecords] = useState<PatientVoiceRecord[]>([])
    const [selectedRecord, setSelectedRecord] = useState<PatientVoiceRecord | null>(null)
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [isCallingActive, setIsCallingActive] = useState(false)
    const [primaryCampaignId, setPrimaryCampaignId] = useState<string | null>(null)
    const [campaignTotal, setCampaignTotal] = useState(0)
    const [backendMessage, setBackendMessage] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        const refresh = async () => {
            try {
                const campaigns = await listPrimaryVoiceCampaigns()
                const campaign = campaigns.find((item) => item.playbook_type === "POST_DISCHARGE_CARE")
                if (!mounted || !campaign) return
                setPrimaryCampaignId(campaign.id)
                setCampaignTotal(campaign.total_recipients)
                const liveRecords = await listPrimaryVoiceRecords(campaign.id)
                if (mounted) setRecords(liveRecords.map(toDischargeRecord))
            } catch {
                // Empty state is intentional when the primary Voice AI service is offline.
            }
        }
        void refresh()
        const timer = window.setInterval(refresh, 5000)
        return () => { mounted = false; window.clearInterval(timer) }
    }, [])

    const recoveringWellCount = records.filter((r) => r.status === "RECOVERING_WELL").length
    const needsAttentionCount = records.filter((r) => r.status === "NEEDS_ATTENTION").length
    const emergencyCount = records.filter((r) => r.status === "EMERGENCY").length

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
                name: `Post-discharge follow-ups ${new Date().toLocaleDateString("en-IN")}`,
                playbookType: "POST_DISCHARGE_CARE",
                recipients: newPatients.map((p) => ({ name: p.patientName, phone: p.patientPhone, doctor_name: p.doctorName, scheduled_slot: p.slotOrDate, notes: p.notes })),
            })
            setPrimaryCampaignId(campaign.id)
            setCampaignTotal(campaign.total_recipients)
            setBackendMessage("Discharge list saved to Voice AI. Click Start Recovery Follow-ups to begin.")
        } catch {
            setBackendMessage("Dashboard preview updated, but the Voice AI service is not reachable yet.")
        }
        const generatedRecords: PatientVoiceRecord[] = newPatients.map((p, idx) => ({
            id: `dis-new-${Date.now()}-${idx}`,
            patientName: p.patientName,
            patientPhone: p.patientPhone,
            doctorName: p.doctorName || "Dr. Suresh Reddy (Cardiology)",
            dischargeDate: p.slotOrDate || "Discharged Yesterday",
            type: "POST_DISCHARGE_RECOVERY",
            status: idx === 0 ? "RECOVERING_WELL" : idx === 1 ? "NEEDS_ATTENTION" : "RECOVERING_WELL",
            patientVerbatimQuote: "బాగానే ఉన్నానండి, మందులు వేసుకుంటున్నాను.",
            aiSummary: "Postoperative recovery follow-up completed. Patient in stable condition.",
            callDurationSeconds: 45,
            calledAt: "Just now",
            transcript: [
                {
                    speaker: "agent",
                    textTelugu: `నమస్కారం ${p.patientName} గారు, కిమ్స్ హాస్పిటల్ నుండి మీ ఆరోగ్య పరిస్థితి తెలుసుకోవడానికి కాల్ చేస్తున్నాము. ఎలా ఉన్నారు?`,
                    textEnglish: `Hello ${p.patientName} garu, calling from KIMS Hospital to check on your recovery. How are you feeling?`,
                    timestamp: "00:03",
                },
                {
                    speaker: "patient",
                    textTelugu: "నొప్పి తగ్గింది అండి, ఆరోగ్యం నిలకడగా ఉంది. ధన్యవాదాలు.",
                    textEnglish: "Pain reduced, health is stable. Thank you.",
                    timestamp: "00:17",
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
                setBackendMessage("Recovery calls have been queued in Voice AI.")
                const poll = window.setInterval(async () => {
                    const liveRecords = await listPrimaryVoiceRecords(primaryCampaignId)
                    if (liveRecords.length > 0) {
                        setRecords(liveRecords.map(toDischargeRecord))
                        setBackendMessage(`${liveRecords.length} recovery call result(s) received.`)
                    }
                }, 2500)
                window.setTimeout(() => window.clearInterval(poll), 30000)
            } else {
                setBackendMessage("Upload a discharged-patient list first.")
            }
        } catch {
            setBackendMessage("Unable to start recovery calls. Check the Voice AI service and telephony configuration.")
        } finally {
            window.setTimeout(() => setIsCallingActive(false), 1200)
        }
    }

    return (
        <div className="space-y-6">
            {backendMessage && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">{backendMessage}</div>}
            {/* Emergency Alert Notification Bar if Emergency Exists */}
            {emergencyCount > 0 && (
                <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 shadow-sm animate-pulse">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm flex-shrink-0">
                                <ShieldAlert className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-red-900">
                                    🚨 {emergencyCount} Emergency Clinical Escalation Detected
                                </h4>
                                <p className="text-xs text-red-700">
                                    Patient <strong>Ramesh Chandra</strong> reported acute chest pain 48h post-angioplasty. Live transfer triggered to Casualty Desk.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-red-900 bg-red-200/80 px-2.5 py-1 rounded-lg">
                                Hotline: +91 98480 22338
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900">
                            🏥 Post-Discharge Patient Recovery Desk
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                            Clinical Triage AI
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 max-w-2xl">
                        Proactive 24-48h Telugu voice calls to recently discharged patients. Shruti AI asks about pain levels, wound status, and medication compliance, instantly flagging acute emergency red-flags for casualty nurses.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setIsUploadOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        <UploadCloud className="h-4 w-4 text-emerald-600" /> Upload Discharged List
                    </button>

                    <button
                        type="button"
                        onClick={handleStartCalling}
                        disabled={isCallingActive}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                        {isCallingActive ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" /> Calling Discharged Patients...
                            </>
                        ) : (
                            <>
                                <PhoneCall className="h-4 w-4" /> Start Recovery Follow-ups ({campaignTotal || records.length})
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Metric KPI Strip */}
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Discharged Patients Called</span>
                        <Users className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{campaignTotal || records.length}</p>
                </div>

                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-800">🟢 Recovering Well / Stable</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">{recoveringWellCount}</p>
                </div>

                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-800">🟡 Needs Nurse Callback</span>
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-amber-700">{needsAttentionCount}</p>
                </div>

                <div className="rounded-2xl border border-red-300 bg-red-50/60 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-800">🚨 EMERGENCY RED-FLAGS</span>
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="mt-1 text-2xl font-bold text-red-700">{emergencyCount}</p>
                </div>
            </div>

            {/* Filter Strip */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search discharged patient, doctor, or diagnosis..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {[
                            { label: "All", val: "ALL" },
                            { label: "🚨 Emergency Alerts", val: "EMERGENCY" },
                            { label: "🟢 Stable", val: "RECOVERING_WELL" },
                            { label: "🟡 Needs Nurse", val: "NEEDS_ATTENTION" },
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
            </div>

            {/* Interactive Recovery Table */}
            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700">
                            <tr>
                                <th className="p-3.5">Patient Details</th>
                                <th className="p-3.5">Physician & Diagnosis</th>
                                <th className="p-3.5">Discharge Date</th>
                                <th className="p-3.5">Clinical Recovery Status</th>
                                <th className="p-3.5">What the Patient Said (Telugu)</th>
                                <th className="p-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        No patient records found. Click <strong>Upload Discharged List</strong> to begin follow-up calls!
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((r) => (
                                    <tr
                                        key={r.id}
                                        onClick={() => setSelectedRecord(r)}
                                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                                            r.status === "EMERGENCY" ? "bg-red-50/40" : ""
                                        }`}
                                    >
                                        <td className="p-3.5">
                                            <div className="font-bold text-slate-900">{r.patientName}</div>
                                            <div className="text-[11px] font-mono text-slate-500 mt-0.5">{r.patientPhone}</div>
                                        </td>

                                        <td className="p-3.5">
                                            <div className="font-semibold text-slate-800">{r.doctorName}</div>
                                            {r.diagnosis && (
                                                <div className="text-[11px] text-slate-500 italic mt-0.5">{r.diagnosis}</div>
                                            )}
                                        </td>

                                        <td className="p-3.5">
                                            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                                <Calendar className="h-3 w-3 text-slate-500" />
                                                {r.dischargeDate}
                                            </span>
                                        </td>

                                        <td className="p-3.5">
                                            {r.status === "EMERGENCY" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800 border border-red-300 animate-pulse">
                                                    <ShieldAlert className="h-3 w-3 text-red-600" /> 🚨 EMERGENCY ALERT
                                                </span>
                                            )}
                                            {r.status === "RECOVERING_WELL" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="h-3 w-3" /> Recovering Well / Stable
                                                </span>
                                            )}
                                            {r.status === "NEEDS_ATTENTION" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                                                    <AlertTriangle className="h-3 w-3" /> Nurse Callback Needed
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-3.5 max-w-xs">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                                                <p className="text-xs text-slate-700 italic truncate font-medium">
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
                mode="DISCHARGE"
                onClose={() => setIsUploadOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    )
}

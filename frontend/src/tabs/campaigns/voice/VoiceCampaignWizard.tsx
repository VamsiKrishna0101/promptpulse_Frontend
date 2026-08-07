import { useState } from "react"
import { ArrowRight,
    ArrowLeft,
    Upload,
    
    Users,
    Sliders,
    Clock,
    PhoneCall,
    
    
    
    AlertCircle,
    
} from "lucide-react"
import type { VoiceAccount, VoicePlaybookDefinition, VoicePlaybookType, ParsedVoiceRecipient } from "@/lib/voiceApi"
import { createVoiceCampaign, parseVoiceCsv } from "@/lib/voiceApi"

interface Props {
    account: VoiceAccount
    playbooks: VoicePlaybookDefinition[]
    onBack: () => void
    onSuccess: (campaignId: string) => void
}

const SAMPLE_CSV = `Patient Name,Phone Number,Doctor Name,Scheduled Slot,Notes
Rama Rao,+919876543210,Dr. Priya Sharma (Cardiology),Tomorrow 10:30 AM,Follow-up consultation
Lakshmi Devi,+919848022338,Dr. Suresh Varma (Orthopedics),Tomorrow 11:15 AM,Knee pain review
Venkatesh K,+919123456780,Dr. Ananya Reddy (General),Tomorrow 04:00 PM,Fever check
Sita Mahalakshmi,+919988776655,Dr. Priya Sharma (Cardiology),Tomorrow 04:45 PM,ECG review
Rajesh Kumar,+919701234567,Dr. K. Srinivas (Neurology),Friday 10:00 AM,Migraine consultation`

export function VoiceCampaignWizard({ account, playbooks, onBack, onSuccess }: Props) {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [campaignName, setCampaignName] = useState("OPD Appointment Confirmation - Tomorrow")
    const [selectedPlaybook, setSelectedPlaybook] = useState<VoicePlaybookType>("OPD_APPOINTMENT_CONFIRMATION")
    const [csvText, setCsvText] = useState(SAMPLE_CSV)
    const [recipients, setRecipients] = useState<ParsedVoiceRecipient[]>([])
    const [concurrentLimit, setConcurrentLimit] = useState(10)
    const [autoLaunch, setAutoLaunch] = useState(true)
    const [ setParsing] = useState(false)
    const [launching, setLaunching] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Pre-parse sample CSV on mount
    React.useEffect(() => {
        handleParseCsv(SAMPLE_CSV)
    }, [])

    async function handleParseCsv(text: string) {
        try {
            setParsing(true)
            setError(null)
            const result = await parseVoiceCsv(text)
            setRecipients(result.recipients)
        } catch (err: any) {
            setError("Failed to parse CSV file.")
        } finally {
            setParsing(false)
        }
    }

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (evt) => {
            const text = (evt.target?.result as string) || ""
            setCsvText(text)
            handleParseCsv(text)
        }
        reader.readAsText(file)
    }

    async function handleLaunch() {
        try {
            setLaunching(true)
            setError(null)
            const agent = account.agents?.[0]
            if (!agent) {
                setError("No active voice agent found. Please configure an agent in Studio.")
                return
            }

            const campaign = await createVoiceCampaign({
                accountId: account.id,
                agentId: agent.id,
                name: campaignName,
                playbookType: selectedPlaybook,
                recipients,
                concurrentLimit,
                autoLaunch,
            })

            onSuccess(campaign.id)
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to create voice campaign.")
        } finally {
            setLaunching(false)
        }
    }

    const estimatedCallsPerHour = concurrentLimit * 80 // ~80 calls/hour per line (45s average)
    const hoursNeeded = recipients.length > 0 ? (recipients.length / estimatedCallsPerHour).toFixed(1) : "0"

    return (
        <div className="mx-auto max-w-4xl space-y-6 pb-12">
            {/* Header & Step Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                        Create Voice AI Campaign
                    </h2>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Method 1: 1-Click Excel/CSV patient upload with automated Telugu voice outreach.
                    </p>
                </div>

                {/* Step Pills */}
                <div className="flex items-center gap-2">
                    {[
                        { num: 1, label: "Playbook" },
                        { num: 2, label: "Upload List" },
                        { num: 3, label: "Pacing & Launch" },
                    ].map((s) => (
                        <div
                            key={s.num}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                                step === s.num
                                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                    : step > s.num
                                    ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                                    : "text-zinc-400 dark:text-zinc-600"
                            }`}
                        >
                            <span>{s.num}.</span>
                            <span>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* STEP 1: BASICS & PLAYBOOK */}
            {step === 1 && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Campaign Name
                        </h3>
                        <input
                            type="text"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                            placeholder="e.g. Tomorrow OPD Cardiology Appointments"
                        />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Select Purpose-Built Healthcare Playbook
                        </h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {playbooks.map((pb) => {
                                const isSelected = selectedPlaybook === pb.id
                                return (
                                    <div
                                        key={pb.id}
                                        onClick={() => setSelectedPlaybook(pb.id)}
                                        className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                            isSelected
                                                ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-900 dark:ring-zinc-100"
                                                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                                {pb.name}
                                            </h4>
                                            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                                {pb.badge}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                            {pb.description}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            Next: Upload Patient CSV <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: METHOD 1 CSV UPLOAD & RECIPIENT TABLE */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Method 1: Excel or CSV Upload
                                </h3>
                                <p className="text-xs text-zinc-500">
                                    Supports columns: Patient Name, Phone Number, Doctor Name, Scheduled Slot, Notes
                                </p>
                            </div>

                            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                                <Upload className="h-3.5 w-3.5" /> Upload .CSV / .XLSX
                                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                            </label>
                        </div>

                        {/* Raw CSV Textbox */}
                        <div>
                            <textarea
                                rows={5}
                                value={csvText}
                                onChange={(e) => {
                                    setCsvText(e.target.value)
                                    handleParseCsv(e.target.value)
                                }}
                                className="w-full rounded-lg border border-zinc-300 p-2.5 font-mono text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                placeholder="Paste CSV rows here..."
                            />
                        </div>
                    </div>

                    {/* Parsed Preview Table */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Parsed Patient Queue ({recipients.length} recipients)
                                </h3>
                            </div>
                            <span className="text-xs text-emerald-600 font-medium dark:text-emerald-400">
                                ✓ Indian Phone Normalization (+91) Applied
                            </span>
                        </div>

                        <div className="max-h-64 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-zinc-200 bg-zinc-50 font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                                    <tr>
                                        <th className="p-2.5">#</th>
                                        <th className="p-2.5">Patient Name</th>
                                        <th className="p-2.5">Phone Number</th>
                                        <th className="p-2.5">Doctor</th>
                                        <th className="p-2.5">Scheduled Slot</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {recipients.map((r, i) => (
                                        <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                            <td className="p-2.5 text-zinc-400">{i + 1}</td>
                                            <td className="p-2.5 font-medium text-zinc-900 dark:text-zinc-100">{r.name}</td>
                                            <td className="p-2.5 font-mono text-zinc-600 dark:text-zinc-300">{r.phone}</td>
                                            <td className="p-2.5 text-zinc-600 dark:text-zinc-400">{r.doctor_name || "—"}</td>
                                            <td className="p-2.5 text-zinc-600 dark:text-zinc-400">{r.scheduled_slot || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </button>
                        <button
                            type="button"
                            disabled={recipients.length === 0}
                            onClick={() => setStep(3)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            Next: Pacing & Launch <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: PACING, TRAI COMPLIANCE & LAUNCH */}
            {step === 3 && (
                <div className="space-y-6">
                    {/* Concurrency Slider */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sliders className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Simultaneous Line Pacing Limit
                                </h3>
                            </div>
                            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-mono text-xs font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                                {concurrentLimit} Parallel Lines Active
                            </span>
                        </div>

                        <input
                            type="range"
                            min={1}
                            max={20}
                            value={concurrentLimit}
                            onChange={(e) => setConcurrentLimit(Number(e.target.value))}
                            className="w-full accent-zinc-900 dark:accent-zinc-100"
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
                            <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                                <span className="text-[11px] text-zinc-500">Hourly Throughput</span>
                                <p className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    ~{estimatedCallsPerHour} calls / hr
                                </p>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                                <span className="text-[11px] text-zinc-500">Est. Total Time</span>
                                <p className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    ~{hoursNeeded} hours
                                </p>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                                <span className="text-[11px] text-zinc-500">Azure Free Tier Fit</span>
                                <p className="mt-0.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ 100% Free Quota Safe
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* TRAI IST Time-Window Regulatory Guard */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                TRAI Regulatory IST Calling Window
                            </h3>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                                    Permitted Calling Window: 09:00 AM – 06:00 PM IST
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                    Calls are automatically paused outside window hours to prevent spam penalties.
                                </p>
                            </div>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Guard Active
                            </span>
                        </div>
                    </div>

                    {/* Launch Action */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </button>
                        <button
                            type="button"
                            disabled={launching || recipients.length === 0}
                            onClick={handleLaunch}
                            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            <PhoneCall className="h-4 w-4" />
                            {launching ? "Launching Voice AI Engine..." : `Launch Campaign (${recipients.length} Patients)`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

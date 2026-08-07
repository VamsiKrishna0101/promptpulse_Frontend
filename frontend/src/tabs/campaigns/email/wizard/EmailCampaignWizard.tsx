import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle2, ChevronRight, Upload, Play } from "lucide-react"
import { type EmailTemplate, listEmailTemplates, createEmailCampaign, uploadEmailRecipients, launchEmailCampaign } from "@/lib/emailApi"

interface Props {
    projectId: string
    onBack: () => void
    onSuccess: () => void
}

export function EmailCampaignWizard({ projectId, onBack, onSuccess }: Props) {
    const [step, setStep] = useState(1)
    const [name, setName] = useState("")
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [selectedTemplateId, setSelectedTemplateId] = useState("")
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [campaignId, setCampaignId] = useState("")
    const [loading, setLoading] = useState(false)
    const [recipientCount, setRecipientCount] = useState(0)

    useEffect(() => {
        listEmailTemplates(projectId).then(setTemplates).catch(console.error)
    }, [projectId])

    async function handleNext() {
        setLoading(true)
        try {
            if (step === 1) {
                if (!name) return
                setStep(2)
            } else if (step === 2) {
                if (!selectedTemplateId) return
                // Create campaign draft
                const camp = await createEmailCampaign(projectId, { name, templateId: selectedTemplateId })
                setCampaignId(camp.id)
                setStep(3)
            } else if (step === 3) {
                if (!csvFile || !campaignId) return
                const text = await csvFile.text()
                const res = await uploadEmailRecipients(projectId, campaignId, text)
                setRecipientCount(res.count)
                setStep(4)
            } else if (step === 4) {
                if (!campaignId) return
                await launchEmailCampaign(projectId, campaignId)
                onSuccess()
            }
        } catch (error) {
            console.error("Step failed:", error)
            alert("An error occurred. Check console.")
        } finally {
            setLoading(false)
        }
    }

    const steps = [
        { num: 1, title: "Basics" },
        { num: 2, title: "Template" },
        { num: 3, title: "Audience" },
        { num: 4, title: "Launch" }
    ]

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pt-4 pb-20">
            <div className="flex items-center gap-2">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-600 transition shadow-sm"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                </button>
                <span className="text-xs text-zinc-300">/</span>
                <span className="text-xs font-semibold text-zinc-700">New Email Campaign</span>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between relative px-2">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-100 -z-10 rounded-full" />
                <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-900 -z-10 transition-all duration-500 rounded-full" 
                    style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                />
                
                {steps.map(s => (
                    <div key={s.num} className="flex flex-col items-center gap-2 bg-white px-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${
                            step > s.num 
                                ? 'bg-zinc-900 border-zinc-900 text-white' 
                                : step === s.num
                                    ? 'bg-white border-zinc-900 text-zinc-900 shadow-[0_0_0_4px_rgba(24,24,27,0.1)]'
                                    : 'bg-white border-zinc-200 text-zinc-400'
                        }`}>
                            {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= s.num ? 'text-zinc-900' : 'text-zinc-400'}`}>
                            {s.title}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 min-h-[400px]">
                {step === 1 && (
                    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-zinc-900">Campaign Basics</h2>
                            <p className="text-zinc-500 mt-2 text-sm">Give your email campaign a memorable name.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">Campaign Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-zinc-900 font-medium"
                                placeholder="e.g. June Monthly Newsletter"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-zinc-900">Select Template</h2>
                            <p className="text-zinc-500 mt-2 text-sm">Choose a rich HTML template for this campaign.</p>
                        </div>
                        
                        {templates.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-zinc-500 text-sm">No templates found. Go back and create one in Template Studio.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {templates.map(t => (
                                    <div 
                                        key={t.id}
                                        onClick={() => setSelectedTemplateId(t.id)}
                                        className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${selectedTemplateId === t.id ? 'border-zinc-900 bg-zinc-50 shadow-sm' : 'border-zinc-200 hover:border-zinc-300'}`}
                                    >
                                        <h3 className="font-bold text-zinc-900">{t.name}</h3>
                                        <p className="text-sm text-zinc-500 mt-1">{t.subject}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-zinc-900">Upload Audience</h2>
                            <p className="text-zinc-500 mt-2 text-sm">Upload a CSV containing your recipients. Make sure it has an 'Email' and optional 'Name' column.</p>
                        </div>
                        
                        <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-10 text-center hover:bg-zinc-50 transition cursor-pointer relative">
                            <input 
                                type="file" 
                                accept=".csv"
                                onChange={e => setCsvFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-10 h-10 text-zinc-400 mx-auto mb-4" />
                            {csvFile ? (
                                <div className="text-zinc-900 font-semibold">{csvFile.name}</div>
                            ) : (
                                <div>
                                    <span className="text-zinc-900 font-semibold">Click to upload</span>
                                    <span className="text-zinc-500"> or drag and drop</span>
                                    <p className="text-xs text-zinc-400 mt-2">CSV files only</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                        <div className="mb-8">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Play className="w-10 h-10 text-green-600 ml-1" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900">Ready to Launch</h2>
                            <p className="text-zinc-500 mt-2 text-sm">Your campaign is ready to be sent to {recipientCount} recipients via AWS SES.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={() => setStep(s => Math.max(1, s - 1))}
                    disabled={step === 1 || loading}
                    className="px-6 py-2.5 rounded-full font-semibold text-sm text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 transition"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={loading || (step === 1 && !name) || (step === 2 && !selectedTemplateId) || (step === 3 && !csvFile)}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-full font-semibold text-sm bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                    {loading ? "Processing..." : step === 4 ? "Launch Campaign" : "Continue"}
                    {step !== 4 && <ChevronRight className="w-4 h-4" />}
                </button>
            </div>
        </div>
    )
}

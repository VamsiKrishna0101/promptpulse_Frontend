import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import type { WhatsAppAccount, WhatsAppTemplate, WhatsAppTemplateCategory, ParsedContact } from "@/lib/whatsappApi"
import { listWhatsAppTemplates, createWhatsAppCampaign, calcCostLocally } from "@/lib/whatsappApi"
import { Step1Basics } from "./Step1Basics"
import { Step2Audience } from "./Step2Audience"
import { Step3Template } from "./Step3Template"
import { Step4Preview } from "./Step4Preview"
import { Step5Confirm } from "./Step5Confirm"

export interface WizardState {
    // Step 1
    campaignName: string
    objective: string
    category: WhatsAppTemplateCategory
    // Step 2
    recipients: ParsedContact[]
    csvHeaders: string[]
    // Step 3
    templateId: string
    template: WhatsAppTemplate | null
    variableMapping: Record<string, string>
    headerMediaFile: File | null
    headerMediaUrl: string
    headerMediaType: string
    // Step 5
    sendNow: boolean
    scheduledAt: string
    pacePerSecond: number
}

const STEPS = [
    { num: 1, label: "Campaign Basics" },
    { num: 2, label: "Audience" },
    { num: 3, label: "Template" },
    { num: 4, label: "Preview" },
    { num: 5, label: "Confirm & Send" },
]

interface Props {
    account: WhatsAppAccount | null
    projectId?: string
    onBack: () => void
    onSuccess: () => void
}

export function CreateCampaignWizard({ account, onBack, onSuccess }: Props) {
    const [step, setStep] = useState(1)
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [wizard, setWizard] = useState<WizardState>({
        campaignName: "",
        objective: "Promotion",
        category: "MARKETING",
        recipients: [],
        csvHeaders: [],
        templateId: "",
        template: null,
        variableMapping: {},
        headerMediaFile: null,
        headerMediaUrl: "",
        headerMediaType: "IMAGE",
        sendNow: true,
        scheduledAt: "",
        pacePerSecond: 10,
    })

    useEffect(() => {
        if (!account) return
        listWhatsAppTemplates(account.id)
            .then(setTemplates)
            .catch(() => null)
    }, [account?.id])

    function update(patch: Partial<WizardState>) {
        setWizard((w) => ({ ...w, ...patch }))
    }

    function next() { setStep((s) => Math.min(s + 1, 5)); setError(null) }
    function prev() { setStep((s) => Math.max(s - 1, 1)); setError(null) }

    async function handleSubmit() {
        if (!account) return
        setSubmitting(true)
        setError(null)
        try {
            const validRecipients = wizard.recipients.filter((r) => r.valid)
            const payload = {
                accountId: account.id,
                name: wizard.campaignName,
                objective: wizard.objective,
                templateId: wizard.templateId || undefined,
                headerMediaUrl: wizard.headerMediaUrl || undefined,
                headerMediaType: wizard.headerMediaType || undefined,
                variableMapping: Object.keys(wizard.variableMapping).length > 0 ? wizard.variableMapping : undefined,
                scheduledAt: !wizard.sendNow && wizard.scheduledAt ? wizard.scheduledAt : undefined,
                pacePerSecond: wizard.pacePerSecond,
                recipients: validRecipients.map((r) => ({
                    phone: r.phone,
                    name: r.name || undefined,
                    variables: Object.keys(r.extra || {}).length > 0 ? r.extra : undefined,
                })),
            }
            await createWhatsAppCampaign(payload)
            onSuccess()
        } catch (err: any) {
            setError(err?.response?.data?.error ?? "Failed to create campaign")
        } finally {
            setSubmitting(false)
        }
    }

    const validCount = wizard.recipients.filter((r) => r.valid).length
    const cost = calcCostLocally(validCount, wizard.category)

    if (!account) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center py-20 text-center">
                <span className="text-4xl">📲</span>
                <p className="text-[13px] font-medium text-zinc-600">You must connect a WhatsApp Business account first.</p>
                <button type="button" onClick={onBack} className="rounded-xl border border-zinc-200 px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 transition">
                    ← Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5 pb-10">
            {/* Back */}
            <div className="flex items-center gap-2">
                <button type="button" onClick={onBack} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition">
                    <ArrowLeft size={14} />
                </button>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">Campaigns / New Campaign</span>
            </div>

            {/* Progress Bar */}
            <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    {STEPS.map(({ num, label }) => (
                        <div key={num} className="flex flex-1 items-center">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                                        step > num
                                            ? "bg-green-500 text-white"
                                            : step === num
                                            ? "text-white"
                                            : "bg-zinc-100 text-zinc-400"
                                    }`}
                                    style={step === num ? { background: "#25D366" } : undefined}
                                >
                                    {step > num ? <Check size={12} /> : num}
                                </div>
                                <span className={`mt-1 hidden text-[10px] font-medium sm:block ${step === num ? "text-zinc-900" : "text-zinc-400"}`}>
                                    {label}
                                </span>
                            </div>
                            {num < 5 && (
                                <div className={`mx-1 h-0.5 flex-1 rounded-full transition-all ${step > num ? "bg-green-400" : "bg-zinc-200"}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                {step === 1 && <Step1Basics wizard={wizard} update={update} />}
                {step === 2 && <Step2Audience wizard={wizard} update={update} />}
                {step === 3 && <Step3Template wizard={wizard} update={update} templates={templates} />}
                {step === 4 && <Step4Preview wizard={wizard} account={account} />}
                {step === 5 && <Step5Confirm wizard={wizard} update={update} cost={cost} validCount={validCount} />}

                {error && (
                    <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[12.5px] text-red-600">{error}</div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={prev}
                    disabled={step === 1}
                    className="rounded-xl border border-zinc-200 px-5 py-2.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 transition disabled:opacity-40"
                >
                    ← Back
                </button>

                <div className="flex items-center gap-2">
                    {step < 5 ? (
                        <button
                            type="button"
                            onClick={next}
                            disabled={
                                (step === 1 && !wizard.campaignName.trim()) ||
                                (step === 2 && validCount === 0) ||
                                (step === 3 && !wizard.templateId)
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition disabled:opacity-40"
                            style={{ background: "#25D366" }}
                        >
                            Next Step <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting || validCount === 0}
                            className="inline-flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-[13px] font-semibold text-white transition disabled:opacity-40"
                            style={{ background: "#25D366" }}
                        >
                            {submitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    Creating…
                                </>
                            ) : (
                                <>🚀 {wizard.sendNow ? "Create & Launch" : "Schedule Campaign"}</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

import type { WizardState } from "./CreateCampaignWizard"
import type { WhatsAppTemplateCategory } from "@/lib/whatsappApi"

const OBJECTIVES = ["Promotion", "Product Update", "Re-engagement", "Festival Offer", "Payment Reminder", "Follow-up"]
const CATEGORIES: Array<{ value: WhatsAppTemplateCategory; label: string; desc: string; rate: number }> = [
    { value: "MARKETING", label: "📢 Marketing", desc: "Offers, promotions, product launches, re-engagement", rate: 0.87 },
    { value: "UTILITY", label: "🔔 Utility", desc: "Order updates, payment reminders, shipping info", rate: 0.12 },
    { value: "AUTHENTICATION", label: "🔐 Authentication", desc: "Account verification, OTPs", rate: 0.12 },
]

interface Props { wizard: WizardState; update: (p: Partial<WizardState>) => void }

export function Step1Basics({ wizard, update }: Props) {
    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-[16px] font-semibold text-zinc-900">Step 1 — Campaign Basics</h2>
                <p className="mt-1 text-[12.5px] text-zinc-500">Name your campaign and choose the message category.</p>
            </div>

            <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-zinc-600">Campaign Name *</label>
                <input
                    type="text"
                    value={wizard.campaignName}
                    onChange={(e) => update({ campaignName: e.target.value })}
                    placeholder="e.g. Diwali Sale 2026, August Reactivation"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] focus:border-green-400 focus:outline-none transition"
                />
            </div>

            <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-zinc-600">Objective</label>
                <div className="flex flex-wrap gap-2">
                    {OBJECTIVES.map((obj) => (
                        <button
                            key={obj}
                            type="button"
                            onClick={() => update({ objective: obj })}
                            className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                                wizard.objective === obj
                                    ? "border-zinc-800 bg-zinc-900 text-white"
                                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                            }`}
                        >
                            {obj}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="mb-2 block text-[11.5px] font-semibold text-zinc-600">Message Category</label>
                <div className="flex flex-col gap-2">
                    {CATEGORIES.map(({ value, label, desc, rate }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => update({ category: value })}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                                wizard.category === value
                                    ? "border-green-400 bg-green-50 ring-1 ring-green-300"
                                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                            }`}
                        >
                            <div>
                                <p className="text-[13px] font-semibold text-zinc-900">{label}</p>
                                <p className="text-[11.5px] text-zinc-500">{desc}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[13px] font-bold text-zinc-800">₹{rate}</p>
                                <p className="text-[10px] text-zinc-400">per message</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

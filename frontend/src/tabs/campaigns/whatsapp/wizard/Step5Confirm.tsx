import type { WizardState } from "./CreateCampaignWizard"
import type { CostEstimate } from "@/lib/whatsappApi"

interface Props {
    wizard: WizardState
    update: (p: Partial<WizardState>) => void
    cost: CostEstimate
    validCount: number
}

export function Step5Confirm({ wizard, update, cost, validCount }: Props) {
    const now = new Date()
    const minDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes() + 5).padStart(2, "0")}`

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-[16px] font-semibold text-zinc-900">Step 5 — Confirm & Send</h2>
                <p className="mt-1 text-[12.5px] text-zinc-500">Review the cost breakdown and choose when to send.</p>
            </div>

            {/* Cost Breakdown Card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-zinc-400">Cost Breakdown (₹ INR)</p>
                <div className="flex flex-col divide-y divide-zinc-100">
                    <div className="flex items-center justify-between py-2.5">
                        <span className="text-[13px] text-zinc-600">Recipients</span>
                        <span className="font-semibold text-zinc-900">{validCount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                        <span className="text-[13px] text-zinc-600">Category</span>
                        <span className="font-semibold text-zinc-900">{cost.category}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                        <span className="text-[13px] text-zinc-600">Rate per message</span>
                        <span className="font-semibold text-zinc-900">₹{cost.ratePerMsg.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                        <span className="text-[13px] text-zinc-600">Subtotal</span>
                        <span className="font-semibold text-zinc-900">₹{cost.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                        <span className="text-[13px] text-zinc-600">
                            GST @ 18%
                            <span className="ml-1 text-[10px] text-zinc-400">(Input credit if GSTIN registered)</span>
                        </span>
                        <span className="font-semibold text-zinc-900">+ ₹{cost.gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <span className="text-[14px] font-bold text-zinc-900">Total Estimated Cost</span>
                        <span className="text-[20px] font-bold text-zinc-900">₹{cost.totalInr.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-1 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-[11.5px] text-amber-700">
                    ⚠️ Actual cost depends on the messages delivered. Charged directly by Meta to your WABA payment method.
                    If you have a <strong>GSTIN</strong>, you can claim the 18% GST back as input tax credit.
                </div>
            </div>

            {/* Tiers for reference */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="mb-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Estimated costs at scale</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[1000, 3000, 5000, 10000].map((n) => {
                        const c = (n * cost.ratePerMsg * 1.18)
                        return (
                            <div key={n} className="rounded-lg bg-white border border-zinc-200 p-2.5 text-center">
                                <p className="text-[10.5px] text-zinc-400">{n.toLocaleString("en-IN")} msgs</p>
                                <p className="text-[15px] font-bold text-zinc-900">₹{c.toFixed(0)}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Sending Speed */}
            <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-zinc-600">Sending Speed (messages per second)</label>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min={1}
                        max={80}
                        step={1}
                        value={wizard.pacePerSecond}
                        onChange={(e) => update({ pacePerSecond: Number(e.target.value) })}
                        className="flex-1"
                        style={{ accentColor: "#25D366" }}
                    />
                    <span className="w-16 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-center text-[13px] font-semibold text-zinc-900">
                        {wizard.pacePerSecond}/sec
                    </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                    At {wizard.pacePerSecond}/sec, {validCount.toLocaleString("en-IN")} messages will take ~{Math.ceil(validCount / wizard.pacePerSecond)} seconds.
                    Keep it under 80/sec to stay within Meta limits.
                </p>
            </div>

            {/* When to send */}
            <div>
                <label className="mb-2 block text-[11.5px] font-semibold text-zinc-600">When to Send</label>
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => update({ sendNow: true })}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                            wizard.sendNow ? "border-green-400 bg-green-50 ring-1 ring-green-300" : "border-zinc-200 bg-white hover:bg-zinc-50"
                        }`}
                    >
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${wizard.sendNow ? "border-green-500" : "border-zinc-300"}`}>
                            {wizard.sendNow && <div className="h-2 w-2 rounded-full bg-green-500" />}
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-zinc-900">🚀 Send Immediately</p>
                            <p className="text-[11.5px] text-zinc-500">Campaign will start dispatching as soon as you click "Create & Launch"</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => update({ sendNow: false })}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                            !wizard.sendNow ? "border-green-400 bg-green-50 ring-1 ring-green-300" : "border-zinc-200 bg-white hover:bg-zinc-50"
                        }`}
                    >
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${!wizard.sendNow ? "border-green-500" : "border-zinc-300"}`}>
                            {!wizard.sendNow && <div className="h-2 w-2 rounded-full bg-green-500" />}
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-zinc-900">📅 Schedule for Later</p>
                            <p className="text-[11.5px] text-zinc-500">Set a future date & time to send the campaign</p>
                        </div>
                    </button>
                </div>

                {!wizard.sendNow && (
                    <div className="mt-3">
                        <label className="mb-1 block text-[11.5px] font-semibold text-zinc-600">Scheduled Date & Time (IST)</label>
                        <input
                            type="datetime-local"
                            min={minDateTime}
                            value={wizard.scheduledAt}
                            onChange={(e) => update({ scheduledAt: e.target.value })}
                            className="w-full max-w-xs rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] focus:border-green-400 focus:outline-none transition"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

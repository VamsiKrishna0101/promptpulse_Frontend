import { useRef, useState } from "react"
import { Upload } from "lucide-react"
import type { WizardState } from "./CreateCampaignWizard"
import { parseCSVContacts, calcCostLocally } from "@/lib/whatsappApi"

interface Props { wizard: WizardState; update: (p: Partial<WizardState>) => void }

export function Step2Audience({ wizard, update }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)

    function processCSV(text: string) {
        const parsed = parseCSVContacts(text)
        const headers = text.split("\n")[0]?.split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase()) ?? []
        update({
            recipients: parsed,
            csvHeaders: headers,
        })
    }

    async function handleFile(file: File) {
        const text = await file.text()
        processCSV(text)
    }

    const validCount = wizard.recipients.filter((r) => r.valid).length
    const invalidCount = wizard.recipients.filter((r) => !r.valid).length
    const cost = calcCostLocally(validCount, wizard.category)

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-[16px] font-semibold text-zinc-900">Step 2 — Audience</h2>
                <p className="mt-1 text-[12.5px] text-zinc-500">Upload a CSV file with your Indian customer contacts.</p>
            </div>

            {/* CSV Format info */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-[12px] font-semibold text-blue-700 mb-1">Required CSV format:</p>
                <p className="font-mono text-[11px] text-blue-600">name,phone,company,custom1,custom2</p>
                <p className="mt-1 text-[11px] text-blue-600">
                    Phone: Indian mobile numbers (e.g. 9876543210 or +919876543210). Numbers starting with 6–9 are valid.
                </p>
            </div>

            {/* Upload Zone */}
            <div
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-10 transition cursor-pointer ${
                    dragOver ? "border-green-400 bg-green-50" : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    const file = e.dataTransfer.files[0]
                    if (file?.name.endsWith(".csv")) void handleFile(file)
                }}
            >
                <Upload size={28} className="mb-3 text-zinc-400" />
                <p className="text-[13px] font-semibold text-zinc-700">Drop your CSV here or click to upload</p>
                <p className="mt-1 text-[11.5px] text-zinc-400">Only .csv files supported</p>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleFile(file)
                }}
            />

            {/* Stats after upload */}
            {wizard.recipients.length > 0 && (
                <>
                    <div className="flex flex-wrap gap-3">
                        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-center">
                            <p className="text-[10.5px] text-zinc-400">Total Rows</p>
                            <p className="text-[18px] font-bold text-zinc-900">{wizard.recipients.length}</p>
                        </div>
                        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-center">
                            <p className="text-[10.5px] text-green-600">✅ Valid Indian Numbers</p>
                            <p className="text-[18px] font-bold text-green-700">{validCount}</p>
                        </div>
                        {invalidCount > 0 && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center">
                                <p className="text-[10.5px] text-red-500">❌ Invalid / Non-Indian</p>
                                <p className="text-[18px] font-bold text-red-600">{invalidCount}</p>
                            </div>
                        )}
                    </div>

                    {/* Cost preview */}
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                        <p className="text-[11.5px] font-semibold text-zinc-700 mb-1">Estimated Campaign Cost</p>
                        <div className="flex flex-wrap gap-x-6 text-[12px] text-zinc-600">
                            <span>{validCount} recipients × ₹{cost.ratePerMsg} = <strong>₹{cost.subtotal.toFixed(2)}</strong></span>
                            <span>GST (18%) = <strong>₹{cost.gstAmount.toFixed(2)}</strong></span>
                            <span className="font-bold text-zinc-900">Total = ₹{cost.totalInr.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Preview table (first 10) */}
                    <div className="overflow-x-auto rounded-xl border border-zinc-200">
                        <table className="w-full text-[11.5px]">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50">
                                    <th className="px-3 py-2 text-left font-semibold text-zinc-400">Name</th>
                                    <th className="px-3 py-2 text-left font-semibold text-zinc-400">Phone (normalised)</th>
                                    <th className="px-3 py-2 text-left font-semibold text-zinc-400">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wizard.recipients.slice(0, 10).map((r, i) => (
                                    <tr key={i} className="border-b border-zinc-50">
                                        <td className="px-3 py-2 text-zinc-700">{r.name || "—"}</td>
                                        <td className="px-3 py-2 font-mono text-zinc-600">{r.phone}</td>
                                        <td className="px-3 py-2">
                                            {r.valid ? (
                                                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">✅ Valid</span>
                                            ) : (
                                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">❌ Invalid</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {wizard.recipients.length > 10 && (
                            <p className="px-3 py-2 text-[11px] text-zinc-400">…and {wizard.recipients.length - 10} more rows</p>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

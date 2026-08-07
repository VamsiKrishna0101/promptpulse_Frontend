import { useRef } from "react"
import type { WizardState } from "./CreateCampaignWizard"
import type { WhatsAppTemplate } from "@/lib/whatsappApi"
import { Image } from "lucide-react"

interface Props {
    wizard: WizardState
    update: (p: Partial<WizardState>) => void
    templates: WhatsAppTemplate[]
}

const STATUS_BADGE: Record<string, string> = {
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    REJECTED: "bg-red-50 text-red-600 border-red-200",
}

// Extract {{n}} variables from template body
function extractVariables(template: WhatsAppTemplate): string[] {
    const bodyComp = (template.components as any[]).find((c: any) => c.type === "BODY")
    if (!bodyComp?.text) return []
    const matches = bodyComp.text.match(/\{\{(\d+)\}\}/g) ?? []
    return Array.from(new Set<string>(matches.map((m: string) => m.replace(/\{\{|\}\}/g, ""))))
}

// Check if template has image header
function hasImageHeader(template: WhatsAppTemplate) {
    const header = (template.components as any[]).find((c: any) => c.type === "HEADER")
    return header?.format === "IMAGE"
}

export function Step3Template({ wizard, update, templates }: Props) {
    const mediaInputRef = useRef<HTMLInputElement>(null)

    function selectTemplate(t: WhatsAppTemplate) {
        update({ templateId: t.id, template: t, variableMapping: {} })
    }

    const vars = wizard.template ? extractVariables(wizard.template) : []
    const needsImage = wizard.template ? hasImageHeader(wizard.template) : false

    const approved = templates.filter((t) => t.status === "APPROVED")
    const other = templates.filter((t) => t.status !== "APPROVED")

    async function handleMediaFile(file: File) {
        const url = URL.createObjectURL(file)
        const mediaType = file.type.startsWith("video") ? "VIDEO" : file.type.startsWith("application") ? "DOCUMENT" : "IMAGE"
        update({ headerMediaFile: file, headerMediaUrl: url, headerMediaType: mediaType })
    }

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-[16px] font-semibold text-zinc-900">Step 3 — Message Template</h2>
                <p className="mt-1 text-[12.5px] text-zinc-500">Select a Meta-approved template for your campaign.</p>
            </div>

            {/* Template List */}
            {templates.length === 0 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-[12.5px] text-amber-700">
                    No templates found. Go to <strong>Message Templates</strong> and sync from Meta, or create a new template on Meta Business Manager.
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {approved.length > 0 && (
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Approved</p>
                    )}
                    {[...approved, ...other].map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            disabled={t.status !== "APPROVED"}
                            onClick={() => selectTemplate(t)}
                            className={`flex items-start justify-between rounded-xl border px-4 py-3 text-left transition disabled:opacity-40 disabled:cursor-not-allowed ${
                                wizard.templateId === t.id
                                    ? "border-green-400 bg-green-50 ring-1 ring-green-300"
                                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                            }`}
                        >
                            <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-zinc-900">{t.name}</p>
                                <p className="text-[11px] text-zinc-400">{t.language} · {t.category}</p>
                            </div>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE[t.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                                {t.status}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Header Media Upload */}
            {wizard.template && needsImage && (
                <div>
                    <label className="mb-1 block text-[11.5px] font-semibold text-zinc-600">
                        Header Image / Media <span className="text-red-500">*</span>
                    </label>
                    <div
                        className="flex items-center gap-3 cursor-pointer rounded-xl border-2 border-dashed border-zinc-200 px-4 py-3 hover:border-green-400 hover:bg-green-50 transition"
                        onClick={() => mediaInputRef.current?.click()}
                    >
                        <Image size={20} className="shrink-0 text-zinc-400" />
                        <div>
                            {wizard.headerMediaUrl ? (
                                <p className="text-[12.5px] font-medium text-green-700">✅ Media selected</p>
                            ) : (
                                <>
                                    <p className="text-[12.5px] font-medium text-zinc-700">Click to upload header image</p>
                                    <p className="text-[11px] text-zinc-400">JPG, PNG, MP4 — used as the campaign image header</p>
                                </>
                            )}
                        </div>
                        {wizard.headerMediaUrl && (
                            <img src={wizard.headerMediaUrl} alt="preview" className="ml-auto h-12 w-12 rounded-lg object-cover border border-zinc-200" />
                        )}
                    </div>
                    <input
                        ref={mediaInputRef}
                        type="file"
                        accept="image/*,video/mp4"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) void handleMediaFile(f)
                        }}
                    />
                </div>
            )}

            {/* Variable Mapping */}
            {vars.length > 0 && (
                <div>
                    <p className="mb-2 text-[11.5px] font-semibold text-zinc-600">Map CSV columns → Template Variables</p>
                    <div className="flex flex-col gap-2">
                        {vars.map((varNum) => (
                            <div key={varNum} className="flex items-center gap-3">
                                <span className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[11px] text-zinc-700 shrink-0">
                                    {`{{${varNum}}}`}
                                </span>
                                <select
                                    value={wizard.variableMapping[varNum] ?? ""}
                                    onChange={(e) => update({ variableMapping: { ...wizard.variableMapping, [varNum]: e.target.value } })}
                                    className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-[12.5px] focus:border-green-400 focus:outline-none transition"
                                >
                                    <option value="">— Select CSV column —</option>
                                    {wizard.csvHeaders.map((h) => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                    <p className="mt-2 text-[11px] text-zinc-400">These mappings define which CSV column value replaces each {`{{variable}}`} in the template body.</p>
                </div>
            )}
        </div>
    )
}

import type { WizardState } from "./CreateCampaignWizard"
import type { WhatsAppAccount } from "@/lib/whatsappApi"

interface Props { wizard: WizardState; account: WhatsAppAccount }

function renderBody(text: string, sample: Record<string, string>, mapping: Record<string, string>) {
    return text.replace(/\{\{(\d+)\}\}/g, (_: string, n: string) => {
        const col = mapping[n]
        const val = col ? (sample[col] ?? `[${col}]`) : `[var ${n}]`
        return `<strong class="text-zinc-900">${val}</strong>`
    })
}

export function Step4Preview({ wizard, account }: Props) {
    const template = wizard.template
    const firstRecipient = wizard.recipients.find((r) => r.valid)
    const sampleVars: Record<string, string> = firstRecipient?.extra ?? {}

    const bodyComp = template ? (template.components as any[]).find((c: any) => c.type === "BODY") : null
    const footerComp = template ? (template.components as any[]).find((c: any) => c.type === "FOOTER") : null
    const buttonsComp = template ? (template.components as any[]).find((c: any) => c.type === "BUTTONS") : null
    const headerComp = template ? (template.components as any[]).find((c: any) => c.type === "HEADER") : null

    const hasImage = headerComp?.format === "IMAGE"

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-[16px] font-semibold text-zinc-900">Step 4 — Message Preview</h2>
                <p className="mt-1 text-[12.5px] text-zinc-500">See how the message will look in a recipient's WhatsApp.</p>
            </div>

            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                {/* Phone mockup */}
                <div
                    className="relative mx-auto shrink-0"
                    style={{
                        width: 280,
                        height: 560,
                        borderRadius: 36,
                        border: "6px solid #1c1c1c",
                        background: "#ECE5DD",
                        overflow: "hidden",
                        boxShadow: "0 30px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
                    }}
                >
                    {/* WhatsApp header bar */}
                    <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: "#128C7E" }}>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold text-white">
                            {account.display_name[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-white">{account.display_name}</p>
                            <p className="text-[9px] text-white/60">Business account</p>
                        </div>
                    </div>

                    {/* Chat area */}
                    <div className="flex flex-col gap-3 p-3" style={{ minHeight: 430 }}>
                        {/* Bubble */}
                        <div className="max-w-[85%] self-end">
                            <div className="rounded-xl rounded-tr-sm bg-white shadow-sm overflow-hidden">
                                {/* Header image */}
                                {hasImage && wizard.headerMediaUrl ? (
                                    <img
                                        src={wizard.headerMediaUrl}
                                        alt="Header"
                                        className="h-28 w-full object-cover"
                                    />
                                ) : hasImage ? (
                                    <div className="flex h-20 w-full items-center justify-center bg-zinc-200 text-[10px] text-zinc-500">
                                        📷 Header Image
                                    </div>
                                ) : headerComp?.format === "TEXT" && headerComp.text ? (
                                    <div className="border-b border-zinc-100 px-3 pt-2.5 pb-1.5">
                                        <p className="text-[12px] font-bold text-zinc-900">{headerComp.text}</p>
                                    </div>
                                ) : null}

                                {/* Body */}
                                <div className="px-3 py-2.5">
                                    {bodyComp?.text ? (
                                        <p
                                            className="text-[11.5px] leading-5 text-zinc-700 whitespace-pre-line"
                                            dangerouslySetInnerHTML={{
                                                __html: renderBody(bodyComp.text, sampleVars, wizard.variableMapping),
                                            }}
                                        />
                                    ) : (
                                        <p className="text-[11px] italic text-zinc-400">No body text</p>
                                    )}
                                    {footerComp?.text && (
                                        <p className="mt-1.5 text-[10px] text-zinc-400">{footerComp.text}</p>
                                    )}
                                    <p className="mt-1.5 text-right text-[9px] text-zinc-400">
                                        {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} ✓✓
                                    </p>
                                </div>

                                {/* Buttons */}
                                {buttonsComp?.buttons?.map((btn: any, i: number) => (
                                    <div key={i} className="border-t border-zinc-100">
                                        <p className="py-2 text-center text-[11px] font-semibold text-blue-600">
                                            {btn.type === "URL" ? "🔗 " : btn.type === "PHONE_NUMBER" ? "📞 " : "↩ "}
                                            {btn.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview details */}
                <div className="flex-1">
                    <div className="rounded-xl border border-zinc-200 bg-white p-4">
                        <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-wider text-zinc-400">Campaign Summary</p>
                        <div className="flex flex-col gap-2 text-[12.5px]">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Campaign Name</span>
                                <span className="font-semibold text-zinc-900">{wizard.campaignName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Template</span>
                                <span className="font-semibold text-zinc-900">{wizard.template?.name ?? "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Category</span>
                                <span className="font-semibold text-zinc-900">{wizard.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Valid Recipients</span>
                                <span className="font-semibold text-zinc-900">{wizard.recipients.filter((r) => r.valid).length.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">From</span>
                                <span className="font-semibold text-zinc-900">{account.display_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Phone</span>
                                <span className="font-semibold text-zinc-900">{account.display_phone}</span>
                            </div>
                        </div>
                    </div>

                    {firstRecipient && (
                        <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                            <p className="text-[10.5px] font-semibold text-zinc-400 mb-1">Preview with first recipient</p>
                            <p className="text-[11.5px] text-zinc-600">{firstRecipient.name || "—"} · {firstRecipient.phone}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

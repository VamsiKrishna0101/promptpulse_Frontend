import { useState } from "react"
import { ArrowLeft, CheckCircle2, Circle, ShieldCheck } from "lucide-react"
import { ConnectAccountBanner } from "./ConnectAccountBanner"

interface Props {
    projectId: string
    onBack: () => void
    onConnected: () => Promise<void> | void
}

const STEPS = [
    ["Connect channel", "Link the verified WhatsApp Business number and Meta credentials."],
    ["Configure assistant", "Add your business identity, services, FAQs, and escalation team."],
    ["Test and enable", "Run the simulator, then verify a real WhatsApp message before launch."],
] as const

export function WhatsAppSetupWizard({ projectId, onBack, onConnected }: Props) {
    const [connected, setConnected] = useState(false)

    async function handleConnected() {
        setConnected(true)
        await onConnected()
    }

    return (
        <div className="flex flex-col gap-5 pb-10">
            <div className="flex items-center gap-2">
                <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50">
                    <ArrowLeft size={13} /> All Channels
                </button>
                <span className="text-xs text-zinc-300">/</span>
                <span className="text-xs font-semibold text-zinc-700">WhatsApp Chatbot Setup</span>
            </div>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Guided setup</p>
                        <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">Get your WhatsApp assistant ready</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Connect the channel first. Then we will take you through the assistant content and a safe test before anything is enabled for customers.</p>
                    </div>
                    <ShieldCheck className="text-emerald-600" size={25} />
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {STEPS.map(([title, description], index) => {
                        const done = index === 0 ? connected : false
                        const active = index === 0 && !connected
                        return <div key={title} className={`rounded-xl border p-4 ${active ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white"}`}>
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                                {done ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Circle size={15} className={active ? "text-zinc-900" : "text-zinc-300"} />}
                                {index + 1}. {title}
                            </div>
                            <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
                        </div>
                    })}
                </div>
            </section>

            {!connected ? <ConnectAccountBanner projectId={projectId} onConnected={handleConnected} /> : (
                <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-800"><CheckCircle2 size={17} /> Channel connected successfully</div>
                    <p className="mt-1 text-xs text-emerald-700">The account is now connected. Open the chatbot builder to configure your greeting, catalog, FAQs, and staff alerts.</p>
                </section>
            )}
        </div>
    )
}

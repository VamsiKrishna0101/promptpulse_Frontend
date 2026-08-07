import { useState } from "react"
import { ArrowLeft, CheckCircle2, KeyRound, TestTube2, X } from "lucide-react"
import { connectWhatsAppAccount, connectWhatsAppTestAccount } from "@/lib/whatsappApi"

interface Props {
    projectId: string
    onConnected: () => void
    onOpenProfile?: () => void
}

type Mode = "choose" | "manual"

export function ConnectAccountBanner({ projectId, onConnected }: Props) {
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<Mode>("choose")
    const [testLoading, setTestLoading] = useState(false)
    const [form, setForm] = useState({ wabaId: "", phoneNumberId: "", displayPhone: "", displayName: "", accessToken: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function close() {
        setOpen(false)
        setMode("choose")
        setError(null)
    }

    async function useTestNumber() {
        setTestLoading(true)
        setError(null)
        try { await connectWhatsAppTestAccount(projectId); close(); onConnected() }
        catch (err: any) { setError(err?.response?.data?.error ?? "Meta test sender is not configured") }
        finally { setTestLoading(false) }
    }

    async function handleManualConnect() {
        if (!form.wabaId || !form.phoneNumberId || !form.displayPhone || !form.displayName || !form.accessToken) {
            setError("Complete all developer connection fields first.")
            return
        }
        setLoading(true)
        setError(null)
        try { await connectWhatsAppAccount({ project_id: projectId, ...form }); close(); onConnected() }
        catch (err: any) { setError(err?.response?.data?.error ?? "Failed to connect WhatsApp account") }
        finally { setLoading(false) }
    }

    return (
        <>
            <div className="flex flex-col gap-4 rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 via-emerald-50/30 to-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Connect your WhatsApp channel</h3>
                    <p className="mt-1 text-xs text-slate-600">Use Meta’s test sender for development or connect a business number for production.</p>
                </div>
                <button type="button" onClick={() => setOpen(true)} className="shrink-0 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500">Choose connection method</button>
            </div>

            {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Connect WhatsApp</h2>
                            <p className="text-[11px] text-slate-500">Customers do not need to know Meta IDs or tokens.</p>
                        </div>
                        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={19} /></button>
                    </div>

                    <div className="p-6">
                        {mode === "choose" ? <>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <button type="button" onClick={() => void useTestNumber()} disabled={testLoading} className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 text-left hover:border-sky-400 disabled:opacity-60">
                                    <TestTube2 size={20} className="text-sky-700" />
                                    <h3 className="mt-3 text-sm font-bold text-slate-900">Use Meta test number</h3>
                                    <p className="mt-1 text-xs leading-5 text-slate-600">For development only. Uses the test sender configured by your platform administrator.</p>
                                    <span className="mt-3 inline-block text-xs font-semibold text-sky-700">{testLoading ? "Connecting…" : "Connect test sender"}</span>
                                </button>
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-left">
                                    <CheckCircle2 size={20} className="text-emerald-700" />
                                    <h3 className="mt-3 text-sm font-bold text-slate-900">Connect business number</h3>
                                    <p className="mt-1 text-xs leading-5 text-slate-600">The business owner must verify a number they control through Meta.</p>
                                    <button type="button" onClick={() => setMode("manual")} className="mt-3 text-xs font-semibold text-emerald-700">Admin connection →</button>
                                </div>
                            </div>
                            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800"><strong>Production note:</strong> Embedded Signup should be added for a customer-facing Meta login. The manual form below is an admin fallback only.</div>
                        </> : <>
                            <button type="button" onClick={() => { setMode("choose"); setError(null) }} className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={13} /> Back to connection methods</button>
                            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800"><KeyRound size={15} className="mt-0.5 shrink-0" /><span>This admin form is for Meta credentials only. Never ask a normal customer to fill it in.</span></div>
                            <div className="flex flex-col gap-3">
                                {[
                                    ["displayName", "Business display name", "e.g. Kims Hospital Hyderabad"],
                                    ["displayPhone", "Verified WhatsApp number", "e.g. +91 98765 43210"],
                                    ["phoneNumberId", "Meta Phone Number ID", "Provided by Meta"],
                                    ["wabaId", "Meta WhatsApp Business Account ID", "Provided by Meta"],
                                    ["accessToken", "Meta System User Access Token", "Provided by Meta"],
                                ].map(([key, label, placeholder]) => <label key={key} className="text-[11.5px] font-semibold text-slate-700">{label}<input type={key === "accessToken" ? "password" : "text"} value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-normal text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none" /></label>)}
                            </div>
                            <button type="button" onClick={() => void handleManualConnect()} disabled={loading} className="mt-5 w-full rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50">{loading ? "Connecting…" : "Connect admin account"}</button>
                        </>}
                        {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">{error}</p>}
                    </div>
                </div>
            </div>}
        </>
    )
}

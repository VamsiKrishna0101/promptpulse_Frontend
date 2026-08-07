import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw } from "lucide-react"
import type { WhatsAppAccount, WhatsAppHealthCheck } from "@/lib/whatsappApi"
import { checkWhatsAppHealth } from "@/lib/whatsappApi"

interface Props { account: WhatsAppAccount }

function StatusIcon({ status }: { status: "healthy" | "degraded" | "unhealthy" }) {
    if (status === "healthy") return <CheckCircle2 size={15} className="text-emerald-600" />
    if (status === "degraded") return <AlertCircle size={15} className="text-amber-600" />
    return <AlertCircle size={15} className="text-rose-600" />
}

export function WhatsAppConnectionHealth({ account }: Props) {
    const [health, setHealth] = useState<WhatsAppHealthCheck | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function runCheck() {
        setLoading(true)
        setError(null)
        try { setHealth(await checkWhatsAppHealth(account.id)) }
        catch (err: any) { setError(err?.response?.data?.error ?? "Could not check WhatsApp connection") }
        finally { setLoading(false) }
    }

    useEffect(() => { void runCheck() }, [account.id])

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        {health && <StatusIcon status={health.status} />}
                        <h2 className="text-sm font-bold text-zinc-950">WhatsApp connection health</h2>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                        Credentials, phone number, business profile, and webhook readiness.
                    </p>
                </div>
                <button type="button" onClick={() => void runCheck()} disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50">
                    {loading ? <LoaderCircle size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                    {loading ? "Checking…" : "Run check"}
                </button>
            </div>

            {error && <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
            {health && (
                <div className="mt-4 grid gap-2 sm:grid-cols-4">
                    {[
                        ["Meta credentials", health.credentials.status, health.credentials.message],
                        ["Phone number", health.phone.status, health.phone.displayPhone ?? health.phone.message ?? ""],
                        ["Business profile", health.profile.status, health.profile.message],
                        ["Webhook", health.webhook.status, health.webhook.message ?? (health.webhook.url ?? "Not configured")],
                    ].map(([label, status, message]) => (
                        <div key={label} className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700"><StatusIcon status={status as any} />{label}</div>
                            <p className="mt-1 text-[11px] capitalize text-zinc-500">{status}</p>
                            <p className="mt-1 line-clamp-2 text-[10px] text-zinc-400">{message}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

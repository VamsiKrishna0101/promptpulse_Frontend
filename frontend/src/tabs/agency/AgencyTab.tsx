import { useEffect, useState } from "react"
import { Building2, Mail, Users, UserPlus, WalletCards } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuth } from "@/hooks/useAuth"

type Member = { id: string; email: string; role: string; status: string }
type Client = { link_id: string; client_user_id: string; client_email: string; role: string; status: string; project_count: number }

export function AgencyTab() {
    const { user } = useAuth()
    const [members, setMembers] = useState<Member[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [email, setEmail] = useState("")
    const [inviteType, setInviteType] = useState<"TEAM_MEMBER" | "CLIENT_USER">("TEAM_MEMBER")
    const [role, setRole] = useState("ANALYST")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(true)

    async function refresh() {
        setLoading(true)
        try {
            const [membersResponse, clientsResponse] = await Promise.all([
                api.get<{ members: Member[] }>("/agency/members"),
                api.get<{ clients: Client[] }>("/agency/clients"),
            ])
            setMembers(membersResponse.data.members)
            setClients(clientsResponse.data.clients)
        } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load agency data") }
        finally { setLoading(false) }
    }

    useEffect(() => { void refresh() }, [])

    async function invite() {
        if (!email.trim()) return
        try {
            await api.post("/agency/invitations", { email, type: inviteType, role: inviteType === "CLIENT_USER" ? (role === "ANALYST" ? "CLIENT_ADMIN" : role) : role })
            setMessage(`Invitation sent to ${email.trim().toLowerCase()}`)
            setEmail("")
            await refresh()
        } catch (error) { setMessage(error instanceof Error ? error.message : "Could not send invitation") }
    }

    if (user?.account_type !== "AGENCY") return <div className="p-8 text-sm text-slate-500">This area is available for agency accounts.</div>

    return <div className="min-h-full bg-zinc-50/50 p-5 sm:p-8">
        <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">Agency workspace</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-zinc-950">Teams and client access</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Invite your team and your clients. Everyone signs in with their own account while the agency keeps one shared credit wallet.</p></div>
                <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800"><WalletCards size={17} /> Shared agency wallet</div>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
                <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_16px_44px_-34px_rgba(15,23,42,.28)] sm:p-6">
                    <div className="flex items-center gap-3"><div className="rounded-xl bg-zinc-950 p-2.5 text-white"><UserPlus size={17} /></div><div><h2 className="font-bold text-zinc-950">Invite someone</h2><p className="text-xs text-zinc-500">Choose whether they are part of your team or a client.</p></div></div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2"><Input label="Work email" value={email} onChange={e => setEmail(e.target.value)} placeholder="person@company.com" type="email" /><label className="flex flex-col gap-1.5 text-sm font-medium text-ink-700">Invite as<select className="h-11 rounded-lg border border-ink-200 bg-white px-3.5 text-sm" value={inviteType} onChange={e => { const next = e.target.value as typeof inviteType; setInviteType(next); setRole(next === "CLIENT_USER" ? "CLIENT_ADMIN" : "ANALYST") }}><option value="TEAM_MEMBER">Agency team member</option><option value="CLIENT_USER">Client user</option></select></label></div>
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end"><label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-ink-700">Permission<select className="h-11 rounded-lg border border-ink-200 bg-white px-3.5 text-sm" value={role} onChange={e => setRole(e.target.value)}>{inviteType === "TEAM_MEMBER" ? <><option value="ADMIN">Admin</option><option value="MANAGER">Manager</option><option value="ANALYST">Analyst</option></> : <><option value="CLIENT_ADMIN">Client admin</option><option value="CLIENT_VIEWER">Client viewer</option></>}</select></label><Button onClick={() => void invite()}><Mail size={15} /> Send invitation</Button></div>
                    {message && <p className="mt-4 rounded-lg bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">{message}</p>}
                </section>
                <section className="rounded-2xl border border-zinc-200 bg-zinc-950 p-6 text-white"><div className="flex items-center gap-3"><Building2 size={20} className="text-sky-300" /><h2 className="font-bold">How billing works</h2></div><p className="mt-4 text-sm leading-6 text-white/65">All agency team members and assigned clients use the same agency wallet. Razorpay top-ups are paid by the agency owner and every usage record is attributed to the client workspace and person who ran it.</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-2xl font-bold">{clients.length}</p><p className="mt-1 text-xs text-white/50">client workspaces</p></div><div className="rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-2xl font-bold">{members.length}</p><p className="mt-1 text-xs text-white/50">team members</p></div></div></section>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><Users size={17} className="text-sky-600" /><h2 className="font-bold text-zinc-950">Agency team</h2></div>{loading ? <p className="mt-5 text-sm text-zinc-500">Loading team…</p> : <div className="mt-5 divide-y divide-zinc-100">{members.map(member => <div key={member.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-800">{member.email}</p><p className="mt-1 text-xs text-zinc-500">{member.role.replace("_", " ").toLowerCase()}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">{member.status.toLowerCase()}</span></div>)}</div>}</section>
                <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><Building2 size={17} className="text-sky-600" /><h2 className="font-bold text-zinc-950">Client workspaces</h2></div>{loading ? <p className="mt-5 text-sm text-zinc-500">Loading clients…</p> : clients.length === 0 ? <p className="mt-5 text-sm text-zinc-500">No clients yet. Send your first client invitation above.</p> : <div className="mt-5 divide-y divide-zinc-100">{clients.map(client => <div key={client.link_id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-800">{client.client_email}</p><p className="mt-1 text-xs text-zinc-500">{client.project_count} project{client.project_count === 1 ? "" : "s"} · {client.role.replace("_", " ").toLowerCase()}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">{client.status.toLowerCase()}</span></div>)}</div>}</section>
            </div>
        </div>
    </div>
}

export default AgencyTab

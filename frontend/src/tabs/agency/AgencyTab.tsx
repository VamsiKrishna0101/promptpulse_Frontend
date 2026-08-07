import { useEffect, useState } from "react"
import {
    Building2,
    Mail,
    Users,
    UserPlus,
    LayoutGrid,
    Table as TableIcon,
    Palette,
    FileCheck,
    Coins,
    Shield,
    Plus,
    Lock,
    ChevronRight,
    RefreshCw,
    Settings2,
    CreditCard,
    Loader2,
} from "lucide-react"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuth } from "@/hooks/useAuth"
import { useProjects } from "@/hooks/useProjects"
import { ClientPortfolioGrid, type AgencyClient, type ClientProject } from "./components/ClientPortfolioGrid"
import { ClientPortfolioTable } from "./components/ClientPortfolioTable"
import { WhiteLabelBrandingForm, type AgencyBrandingData } from "./components/WhiteLabelBrandingForm"
import { ShareablePortalLinkModal } from "./components/ShareablePortalLinkModal"
import { ClientBudgetCapModal } from "./components/ClientBudgetCapModal"
import { ClientDeliverablesQueue } from "./components/ClientDeliverablesQueue"

type Member = { id: string; email: string; role: string; status: string }
type ActiveTab = "PORTFOLIO" | "TEAM_ACCESS" | "WHITE_LABEL" | "DELIVERABLES" | "BUDGET_CAPS"

const NAV_ITEMS: { id: ActiveTab; label: string; icon: React.FC<{ size?: number; className?: string }>, desc: string }[] = [
    { id: "PORTFOLIO", label: "Client Portfolio", icon: Building2, desc: "All brand workspaces" },
    { id: "TEAM_ACCESS", label: "Team & Access", icon: Users, desc: "Members & permissions" },
    { id: "WHITE_LABEL", label: "White-Label", icon: Palette, desc: "Branding & portal" },
    { id: "DELIVERABLES", label: "Deliverables", icon: FileCheck, desc: "Sign-offs & queue" },
    { id: "BUDGET_CAPS", label: "Credit Quotas", icon: Coins, desc: "Monthly limits" },
]

function AgencyLockedView() {
    return (
        <div className="flex h-80 flex-col items-center justify-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                <Lock size={22} />
            </div>
            <div className="text-center">
                <h3 className="text-sm font-bold text-slate-900">Agency Access Required</h3>
                <p className="mt-1 text-xs text-slate-500">This area is reserved for agency partners only.</p>
            </div>
        </div>
    )
}

export function AgencyTab() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<ActiveTab>("PORTFOLIO")
    const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID")
    const [members, setMembers] = useState<Member[]>([])
    const [clients, setClients] = useState<AgencyClient[]>([])
    const [branding, setBranding] = useState<AgencyBrandingData | undefined>()
    const [email, setEmail] = useState("")
    const [inviteType, setInviteType] = useState<"TEAM_MEMBER" | "CLIENT_USER">("TEAM_MEMBER")
    const [role, setRole] = useState("ANALYST")
    const [isInviting, setIsInviting] = useState(false)
    const [assignedProjectIds, setAssignedProjectIds] = useState<string[]>([])
    const { projects } = useProjects()
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [shareModalOpen, setShareModalOpen] = useState(false)
    const [budgetModalOpen, setBudgetModalOpen] = useState(false)
    const [activeClient, setActiveClient] = useState<AgencyClient | null>(null)
    const [activeProject, setActiveProject] = useState<ClientProject | null>(null)

    async function refresh(silent = false) {
        if (!silent) setLoading(true)
        else setRefreshing(true)
        try {
            const [membersRes, clientsRes, brandingRes] = await Promise.all([
                api.get<{ members: Member[] }>("/agency/members").catch(() => ({ data: { members: [] } })),
                api.get<{ clients: AgencyClient[] }>("/agency/clients").catch(() => ({ data: { clients: [] } })),
                api.get<AgencyBrandingData>("/agency/branding").catch(() => ({ data: undefined })),
            ])
            setMembers(membersRes.data.members || [])
            setClients(clientsRes.data.clients || [])
            if (brandingRes.data) setBranding(brandingRes.data)
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not load agency data")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => { void refresh() }, [])

    async function invite() {
        if (!email.trim() || isInviting) return
        setIsInviting(true)
        setMessage("")
        try {
            await api.post("/agency/invitations", {
                email: email.trim(),
                type: inviteType,
                role: inviteType === "CLIENT_USER" ? (role === "ANALYST" ? "CLIENT_ADMIN" : role) : role,
                assigned_project_ids: inviteType === "CLIENT_USER" ? assignedProjectIds : undefined,
            })
            setMessage(`Invitation sent to ${email.trim().toLowerCase()}`)
            setEmail("")
            await refresh(true)
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not send invitation")
        } finally {
            setIsInviting(false)
        }
    }

    function openShareModal(client: AgencyClient, project?: ClientProject) {
        setActiveClient(client)
        setActiveProject(project ?? client.projects[0] ?? null)
        setShareModalOpen(true)
    }

    function openBudgetModal(client: AgencyClient) {
        setActiveClient(client)
        setBudgetModalOpen(true)
    }

    if (user?.account_type !== "AGENCY") return <AgencyLockedView />

    const totalProjects = clients.reduce((sum, c) => sum + (c.project_count || c.projects.length), 0)
    const validScores = clients.flatMap(c => c.projects.map(p => p.ai_visibility_score).filter((s): s is number => typeof s === "number" && !isNaN(s)))
    const avgAiVisibility = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : null
    const primaryPreviewProject = clients[0]?.projects[0]
    const agencyName = branding?.brand_name || user?.email?.split("@")[1]?.split(".")[0] || "Agency"

    return (
        <div className="space-y-4">
            {/* ── Compact Header Row ─────────────────────────────────────── */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-bold flex-shrink-0">
                        {agencyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold text-slate-900">{branding?.brand_name || "Agency Portal"}</h1>
                            {branding?.enable_white_label && (
                                <span className="rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                                    White-Label
                                </span>
                            )}
                        </div>
                        {/* Slim stat pills */}
                        <div className="mt-1 flex items-center gap-3">
                            {[
                                { label: "Clients", value: clients.length },
                                { label: "Brands", value: totalProjects },
                                { label: "Team", value: members.length },
                                { label: "Pool", value: `${(user?.credits_balance ?? 0).toLocaleString()} cr` },
                            ].map(({ label, value }) => (
                                <span key={label} className="text-[11px] text-slate-500">
                                    <span className="font-semibold text-slate-800">{value}</span> {label}
                                </span>
                            ))}
                            {avgAiVisibility !== null && (
                                <span className="text-[11px] text-slate-500">
                                    <span className="font-semibold text-slate-800">{avgAiVisibility}%</span> Avg Visibility
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={() => void refresh(true)}
                        disabled={refreshing}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all"
                        title="Refresh"
                    >
                        <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                    </button>
                    <Link
                        to="/onboarding"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                    >
                        <Plus size={12} /> Add Brand
                    </Link>
                </div>
            </div>

            {/* ── Body: Left Nav + Content ───────────────────────────────── */}
            <div className="flex gap-4">
                {/* Left Sidebar Nav */}
                <div className="hidden lg:flex w-52 flex-shrink-0 flex-col gap-1">
                    {NAV_ITEMS.map(({ id, label, icon: Icon, desc }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                                activeTab === id
                                    ? "bg-white border border-slate-200 shadow-sm"
                                    : "hover:bg-white/70 border border-transparent"
                            }`}
                        >
                            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                                activeTab === id
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                            }`}>
                                <Icon size={13} />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-xs font-semibold leading-tight truncate ${activeTab === id ? "text-slate-900" : "text-slate-600"}`}>{label}</p>
                                <p className="text-[10px] text-slate-400 truncate">{desc}</p>
                            </div>
                            {activeTab === id && <ChevronRight size={12} className="ml-auto text-slate-400 flex-shrink-0" />}
                        </button>
                    ))}
                </div>

                {/* Mobile Top Tabs */}
                <div className="flex lg:hidden overflow-x-auto gap-1 mb-3 pb-1">
                    {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                activeTab === id
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-600"
                            }`}
                        >
                            <Icon size={12} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="min-w-0 flex-1">
                    {/* ── PORTFOLIO ── */}
                    {activeTab === "PORTFOLIO" && (
                        <div className="space-y-3">
                            {/* Toolbar row */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Client Portfolio</h2>
                                    <p className="text-[11px] text-slate-400">{totalProjects} brand workspace{totalProjects !== 1 ? "s" : ""} under management</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs">
                                        <button
                                            type="button"
                                            onClick={() => setViewMode("GRID")}
                                            title="Grid View"
                                            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${viewMode === "GRID" ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                                        >
                                            <LayoutGrid size={12} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode("TABLE")}
                                            title="Table View"
                                            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${viewMode === "TABLE" ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                                        >
                                            <TableIcon size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                                    <RefreshCw size={18} className="mx-auto animate-spin text-slate-300" />
                                    <p className="mt-3 text-xs text-slate-400">Loading client portfolio…</p>
                                </div>
                            ) : viewMode === "GRID" ? (
                                <ClientPortfolioGrid
                                    clients={clients}
                                    onOpenShareModal={openShareModal}
                                    onOpenBudgetModal={openBudgetModal}
                                    onOpenInviteModal={() => setActiveTab("TEAM_ACCESS")}
                                />
                            ) : (
                                <ClientPortfolioTable
                                    clients={clients}
                                    onOpenShareModal={openShareModal}
                                    onOpenBudgetModal={openBudgetModal}
                                />
                            )}
                        </div>
                    )}

                    {/* ── TEAM ACCESS ── */}
                    {activeTab === "TEAM_ACCESS" && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">Team & Access Control</h2>
                                <p className="text-[11px] text-slate-400">Invite agency staff or client stakeholders and assign permission levels</p>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                                {/* Invite Form */}
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                                    <div className="bg-slate-50 border-b border-slate-100 px-5 py-3.5 flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                                            <UserPlus size={13} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">Invite Stakeholder</p>
                                            <p className="text-[10px] text-slate-500">Send a scoped access invitation</p>
                                        </div>
                                    </div>

                                    <form onSubmit={(e) => { e.preventDefault(); void invite() }} className="p-5 space-y-4">
                                        <div>
                                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Account Type</label>
                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                                {(["TEAM_MEMBER", "CLIENT_USER"] as const).map((t) => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        disabled={isInviting}
                                                        onClick={() => setInviteType(t)}
                                                        className={`rounded-xl border p-3 text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                                                            inviteType === t
                                                                ? "border-slate-900 bg-slate-900 text-white shadow"
                                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                                        }`}
                                                    >
                                                        <p className="text-xs font-bold">{t === "TEAM_MEMBER" ? "Agency Staff" : "Client User"}</p>
                                                        <p className={`text-[10px] mt-0.5 ${inviteType === t ? "text-slate-300" : "text-slate-400"}`}>
                                                            {t === "TEAM_MEMBER" ? "Analyst, Manager, or Admin" : "Brand stakeholder / Viewer"}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Input
                                            label="Email Address"
                                            type="email"
                                            value={email}
                                            disabled={isInviting}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={inviteType === "TEAM_MEMBER" ? "colleague@agency.com" : "client@brand.com"}
                                            required
                                        />

                                        <div>
                                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Role</label>
                                            <select
                                                value={role}
                                                disabled={isInviting}
                                                onChange={(e) => setRole(e.target.value)}
                                                className="mt-2 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {inviteType === "TEAM_MEMBER" ? (
                                                    <>
                                                        <option value="ANALYST">Analyst — View & Run Audits</option>
                                                        <option value="MANAGER">Manager — Manage Clients & Budgets</option>
                                                        <option value="ADMIN">Admin — Full Control</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="CLIENT_ADMIN">Client Admin — Manage Brand Prompts</option>
                                                        <option value="CLIENT_VIEWER">Client Viewer — Read-only Reports</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>

                                        {inviteType === "CLIENT_USER" && projects.length > 0 && (
                                            <div>
                                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Assign Projects</label>
                                                <div className="mt-2 max-h-32 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                                                    {projects.map((p) => (
                                                        <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                disabled={isInviting}
                                                                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                                                checked={assignedProjectIds.includes(p.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) setAssignedProjectIds([...assignedProjectIds, p.id])
                                                                    else setAssignedProjectIds(assignedProjectIds.filter((id) => id !== p.id))
                                                                }}
                                                            />
                                                            <span className="text-xs text-slate-700">{p.brand_name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={isInviting || !email.trim()}
                                            className="bg-slate-900 hover:bg-slate-800 text-white w-full text-xs h-9 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {isInviting ? (
                                                <>
                                                    <Loader2 size={13} className="mr-1.5 animate-spin" /> Sending Invitation...
                                                </>
                                            ) : (
                                                <>
                                                    <Mail size={13} className="mr-1.5" /> Send Invitation Link
                                                </>
                                            )}
                                        </Button>
                                    </form>

                                    {message && (
                                        <div className={`mx-5 mb-5 rounded-xl px-3 py-2.5 text-xs font-medium border ${
                                            message.includes("sent") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                                        }`}>
                                            {message}
                                        </div>
                                    )}
                                </div>

                                {/* Permission Matrix */}
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                                    <div className="bg-slate-50 border-b border-slate-100 px-5 py-3.5 flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                                            <Shield size={13} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">Permission Hierarchy</p>
                                            <p className="text-[10px] text-slate-500">Role-based access control</p>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-2.5">
                                        {[
                                            { role: "Agency Owner", perms: "Full access, billing, white-label", color: "bg-slate-900 text-white" },
                                            { role: "Agency Admin", perms: "Manage clients, budgets, reports", color: "bg-slate-700 text-white" },
                                            { role: "Agency Manager", perms: "View & run, adjust caps", color: "bg-slate-100 text-slate-800" },
                                            { role: "Agency Analyst", perms: "View reports only", color: "bg-slate-50 text-slate-600" },
                                            { role: "Client Admin", perms: "Own workspace + prompts", color: "bg-sky-50 text-sky-700" },
                                            { role: "Client Viewer", perms: "Read-only portal access", color: "bg-sky-50/50 text-sky-600" },
                                        ].map(({ role: r, perms, color }) => (
                                            <div key={r} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                                                <span className={`mt-0.5 flex-shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold ${color}`}>{r}</span>
                                                <p className="text-[10px] text-slate-500 leading-relaxed">{perms}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Members Lists */}
                            <div className="grid gap-4 lg:grid-cols-2">
                                {/* Agency Team */}
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                                    <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users size={13} className="text-slate-600" />
                                            <p className="text-xs font-bold text-slate-900">Internal Team</p>
                                        </div>
                                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{members.length}</span>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {members.length === 0 ? (
                                            <p className="py-8 text-center text-xs text-slate-400">No team members invited yet.</p>
                                        ) : members.map((m) => (
                                            <div key={m.id} className="flex items-center justify-between px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                                        {m.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-900 leading-tight">{m.email}</p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5">{m.role.replace(/_/g, " ")}</p>
                                                    </div>
                                                </div>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                                                    m.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                                }`}>
                                                    {m.status.toLowerCase()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Client Stakeholders */}
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                                    <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={13} className="text-slate-600" />
                                            <p className="text-xs font-bold text-slate-900">Client Stakeholders</p>
                                        </div>
                                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{clients.length}</span>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {clients.length === 0 ? (
                                            <p className="py-8 text-center text-xs text-slate-400">No client accounts linked yet.</p>
                                        ) : clients.map((c) => (
                                            <div key={c.link_id} className="flex items-center justify-between px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                                        {(c.projects[0]?.brand_name || c.client_email).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-900 leading-tight">{c.client_email}</p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5">{c.projects.length} project(s) · {c.role.replace(/_/g, " ")}</p>
                                                    </div>
                                                </div>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                                                    c.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                                }`}>
                                                    {c.status.toLowerCase()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── WHITE LABEL ── */}
                    {activeTab === "WHITE_LABEL" && (
                        <div className="space-y-3">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">White-Label Branding</h2>
                                <p className="text-[11px] text-slate-400">Customize client portals with your agency brand identity</p>
                            </div>
                            <WhiteLabelBrandingForm
                                initialBranding={branding}
                                previewProject={primaryPreviewProject}
                                onSaved={(updated) => setBranding(updated)}
                            />
                        </div>
                    )}

                    {/* ── DELIVERABLES ── */}
                    {activeTab === "DELIVERABLES" && (
                        <div className="space-y-3">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">Deliverables & Sign-offs</h2>
                                <p className="text-[11px] text-slate-400">Track client-ready reports, briefs, and approval status</p>
                            </div>
                            <ClientDeliverablesQueue clients={clients} />
                        </div>
                    )}

                    {/* ── BUDGET CAPS ── */}
                    {activeTab === "BUDGET_CAPS" && (
                        <div className="space-y-3">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">Credit Quotas & Budget Guardrails</h2>
                                <p className="text-[11px] text-slate-400">Assign per-client monthly credit limits to prevent over-usage</p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                                <div className="bg-slate-50 border-b border-slate-100 px-5 py-3.5 flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                                        <CreditCard size={13} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Monthly Limits per Client</p>
                                        <p className="text-[10px] text-slate-500">Shared pool: {(user?.credits_balance ?? 0).toLocaleString()} credits available</p>
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-50">
                                    {clients.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <Coins size={24} className="mx-auto text-slate-200 mb-2" />
                                            <p className="text-xs text-slate-400">No client accounts to configure.</p>
                                        </div>
                                    ) : clients.map((client) => {
                                        const cap = client.monthly_credit_cap || 10000
                                        return (
                                            <div key={client.link_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 text-white font-bold text-sm shadow-sm">
                                                        {(client.projects[0]?.brand_name || client.client_email).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">
                                                            {client.projects[0]?.brand_name || client.client_email.split("@")[0]}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">{client.client_email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-slate-900">{cap.toLocaleString()}</p>
                                                        <p className="text-[10px] text-slate-400">credits / month</p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openBudgetModal(client)}
                                                        className="text-xs h-8 rounded-lg border-slate-200 hover:border-slate-300"
                                                    >
                                                        <Settings2 size={12} className="mr-1.5" />
                                                        Adjust Cap
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modals ───────────────────────────────────────────────────── */}
            <ShareablePortalLinkModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                client={activeClient}
                selectedProject={activeProject}
            />
            <ClientBudgetCapModal
                isOpen={budgetModalOpen}
                onClose={() => setBudgetModalOpen(false)}
                client={activeClient}
                onUpdated={() => void refresh(true)}
            />
        </div>
    )
}

export default AgencyTab

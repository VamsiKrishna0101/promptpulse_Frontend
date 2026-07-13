import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  Eye,
  FolderKanban,
  LifeBuoy,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react"

type Plan = "FREE" | "STARTER" | "GROWTH" | "PRO"
type Role = "USER" | "ADMIN"
type SubscriptionStatus = "INCOMPLETE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID"

type Page<T> = {
  data: T[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

type AdminOverview = {
  summary: {
    total_users: number
    new_users_7d: number
    total_projects: number
    total_prompts: number
    chats_30d: number
    open_tickets: number
    active_subscriptions: number
    estimated_mrr_cents: number
  }
  users_by_plan: Array<{ plan: Plan; count: number }>
  subscriptions_by_status: Array<{ status: SubscriptionStatus; count: number }>
  revenue_by_plan: Array<{ plan: Plan; subscriptions: number; amount_cents: number }>
  recent_users: Array<{
    id: string
    email: string
    role: Role
    plan: Plan
    is_verified: boolean
    created_at: string
    _count: { projects: number }
  }>
  recent_tickets: Array<{
    id: string
    email: string
    subject: string
    is_resolved: boolean
    created_at: string
  }>
}

type AdminUserRow = {
  id: string
  email: string
  role: Role
  plan: Plan
  account_type: string
  is_verified: boolean
  created_at: string
  latest_subscription: null | {
    plan: Plan
    status: SubscriptionStatus
    amount_cents: number
    current_period_end: string | null
    cancel_at_period_end: boolean
  }
  _count: { projects: number; subscriptions: number; helpcenter: number }
}

type AdminProjectRow = {
  id: string
  brand_name: string
  brand_url: string
  brand_location: string
  created_at: string
  user: { email: string; plan: Plan; role: Role }
  _count: {
    prompts: number
    competitors: number
    runs: number
    scrape_jobs: number
    sara_conversations: number
    topics: number
  }
}

type AdminSubscriptionRow = {
  id: string
  plan: Plan
  status: SubscriptionStatus
  amount_cents: number
  currency: string
  current_period_end: string | null
  cancel_at_period_end: boolean
  trial_ends_at: string | null
  created_at: string
  user: { email: string; plan: Plan; role: Role }
}

type AdminTicketRow = {
  id: string
  email: string
  subject: string
  message: string
  is_resolved: boolean
  created_at: string
  updated_at: string
  user: null | { email: string; plan: Plan }
}

type AdminUserDetail = {
  id: string
  email: string
  role: Role
  plan: Plan
  account_type: string
  is_verified: boolean
  created_at: string
  updated_at: string
  projects: Array<{
    id: string
    brand_name: string
    brand_url: string
    brand_location: string
    created_at: string
    _count: {
      prompts: number
      competitors: number
      runs: number
      sara_conversations: number
    }
  }>
  subscriptions: Array<{
    id: string
    plan: Plan
    status: SubscriptionStatus
    amount_cents: number
    currency: string
    current_period_start: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
    trial_starts_at: string | null
    trial_ends_at: string | null
    created_at: string
  }>
  plan_usages: Array<{
    id: string
    brands_used: number
    prompts_used: number
    competitors_used: number
    refreshes_used: number
    period_start: string
    period_end: string
  }>
  helpcenter: Array<{
    id: string
    subject: string
    message: string
    is_resolved: boolean
    created_at: string
  }>
  _count: {
    projects: number
    sara_conversations: number
    helpcenter: number
  }
}

const sections = [
  { label: "Overview", path: "/admin", icon: ShieldCheck },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Subscriptions", path: "/admin/subscriptions", icon: CreditCard },
  { label: "Tickets", path: "/admin/tickets", icon: LifeBuoy },
  { label: "Projects", path: "/admin/projects", icon: FolderKanban },
]

const PLAN_OPTIONS: Array<{ label: string; value: Plan | "" }> = [
  { label: "All plans", value: "" },
  { label: "Free", value: "FREE" },
  { label: "Starter", value: "STARTER" },
  { label: "Growth", value: "GROWTH" },
  { label: "Pro", value: "PRO" },
]

const ROLE_OPTIONS: Array<{ label: string; value: Role | "" }> = [
  { label: "All roles", value: "" },
  { label: "Users", value: "USER" },
  { label: "Admins", value: "ADMIN" },
]

const SUBSCRIPTION_STATUS_OPTIONS: Array<{ label: string; value: SubscriptionStatus | "" }> = [
  { label: "All statuses", value: "" },
  { label: "Trialing", value: "TRIALING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Past due", value: "PAST_DUE" },
  { label: "Canceled", value: "CANCELED" },
  { label: "Incomplete", value: "INCOMPLETE" },
  { label: "Unpaid", value: "UNPAID" },
]

const TICKET_STATUS_OPTIONS = [
  { label: "Open", value: "open" },
  { label: "Resolved", value: "resolved" },
  { label: "All", value: "all" },
] as const

function formatDate(value?: string | null) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
}

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format((cents || 0) / 100)
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "blue" | "amber" | "red" | "dark" }) {
  const tones = {
    slate: "border-[#E2E5EA] bg-[#F7F8FA] text-[#667085]",
    green: "border-[#B7EFCF] bg-[#ECFDF3] text-[#047857]",
    blue: "border-[#DCE8FD] bg-[#EFF6FF] text-[#1D4ED8]",
    amber: "border-[#FEDF89]/60 bg-[#FFFAEB] text-[#B54708]",
    red: "border-[#FDA29B]/50 bg-[#FEF3F2] text-[#B42318]",
    dark: "border-[#DCE8FD] bg-[#2563EB] text-white",
  }

  return <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em]", tones[tone])}>{children}</span>
}

function planTone(plan: Plan): "slate" | "green" | "blue" | "amber" | "dark" {
  if (plan === "PRO") return "dark"
  if (plan === "GROWTH") return "green"
  if (plan === "STARTER") return "blue"
  return "slate"
}

function statusTone(status: SubscriptionStatus): "slate" | "green" | "amber" | "red" | "blue" {
  if (status === "ACTIVE" || status === "TRIALING") return "green"
  if (status === "PAST_DUE" || status === "INCOMPLETE") return "amber"
  if (status === "CANCELED" || status === "UNPAID") return "red"
  return "slate"
}

function AdminShell({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string
  eyebrow: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  const location = useLocation()

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="relative border-b border-[#E7E9EC] bg-[#FBFBFC] px-6 py-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_35%)]" />
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div>
              <Badge tone="dark">{eyebrow}</Badge>
              <h1 className="mt-4 max-w-3xl text-[26px] font-semibold tracking-[-0.02em] text-[#0F172A]">{title}</h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#667085]">
                Monitor customers, usage, subscriptions, and support health without exposing any unsafe role update action.
              </p>
              {action && <div className="mt-4">{action}</div>}
            </div>
            <div className="hidden rounded-xl border border-[#E2E5EA] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] md:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">Admin mode</p>
              <p className="mt-1 text-[13px] font-semibold text-[#0F172A]">Read-only controls</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-[#E7E9EC] bg-white px-4 py-2.5">
          {sections.map((section) => {
            const Icon = section.icon
            const active = section.path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(section.path)
            return (
              <Link
                key={section.path}
                to={section.path}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition",
                  active ? "bg-[#2563EB] text-white shadow-[0_1px_2px_rgba(37,99,235,0.3)]" : "text-[#667085] hover:bg-[#F7F8FA] hover:text-[#0F172A]",
                )}
              >
                <Icon size={14} />
                {section.label}
              </Link>
            )
          })}
        </div>

        <div className="bg-[#F7F8FA] p-5">{children}</div>
      </div>
    </section>
  )
}

function LoadingCard() {
  return (
    <div className="rounded-2xl border border-[#E2E5EA] bg-white p-8 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <RefreshCw className="mx-auto animate-spin text-[#98A2B3]" size={20} />
      <p className="mt-3 text-[13px] font-medium text-[#667085]">Loading admin data…</p>
    </div>
  )
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-[#FDA29B] bg-[#FEF3F2] p-5 text-[#B42318]">
      <div className="flex items-center gap-2 text-[13px] font-semibold">
        <AlertCircle size={17} />
        {message}
      </div>
      <button onClick={onRetry} className="mt-4 rounded-lg bg-white px-4 py-2 text-[11.5px] font-semibold text-[#B42318] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        Try again
      </button>
    </div>
  )
}

function MetricCard({ label, value, helper, icon }: { label: string; value: string | number; helper: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">{label}</p>
          <p className="mt-2.5 text-[26px] font-semibold tracking-[-0.02em] text-[#0F172A]">{value}</p>
          <p className="mt-1.5 text-[12.5px] font-medium leading-5 text-[#667085]">{helper}</p>
        </div>
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)]"
          style={{ background: "radial-gradient(120% 120% at 20% 15%, #60A5FA 0%, #2563EB 55%, #1D4ED8 100%)" }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" size={15} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-[#E2E5EA] bg-white pl-9 pr-3 text-[12.5px] font-medium text-[#344054] outline-none transition placeholder:text-[#98A2B3] focus:border-[#93B8F8] focus:ring-4 focus:ring-[#2563EB]/10"
      />
    </div>
  )
}

function SelectFilter<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: Array<{ label: string; value: T }>
  onChange: (value: T) => void
}) {
  return (
    <label className="flex min-w-[150px] flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-9 rounded-lg border border-[#E2E5EA] bg-white px-3 text-[12.5px] font-semibold text-[#344054] outline-none transition focus:border-[#93B8F8] focus:ring-4 focus:ring-[#2563EB]/10"
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between border-t border-[#E7E9EC] bg-white px-5 py-3.5">
      <p className="text-[11.5px] font-medium text-[#667085]">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-[#E2E5EA] px-3 py-1.5 text-[11.5px] font-semibold text-[#475467] transition hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-[11.5px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function AdminOverviewPage() {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function load() {
    setLoading(true)
    setError("")
    try {
      const response = await api.get<AdminOverview>("/admin/overview")
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin overview")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  if (loading) return <LoadingCard />
  if (error || !data) return <ErrorCard message={error || "No overview data"} onRetry={load} />

  return (
    <AdminShell title="Admin command center" eyebrow="Platform health">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Users" value={data.summary.total_users} helper={`${data.summary.new_users_7d} joined in 7 days`} icon={<Users size={18} />} />
        <MetricCard label="Active subs" value={data.summary.active_subscriptions} helper={`${money(data.summary.estimated_mrr_cents)} estimated MRR`} icon={<CreditCard size={18} />} />
        <MetricCard label="Projects" value={data.summary.total_projects} helper={`${data.summary.total_prompts} prompts tracked`} icon={<FolderKanban size={18} />} />
        <MetricCard label="Open tickets" value={data.summary.open_tickets} helper={`${data.summary.chats_30d} chats in 30 days`} icon={<LifeBuoy size={18} />} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_400px]">
        <div className="rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="border-b border-[#EEF0F3] px-5 py-4">
            <h2 className="text-[14px] font-semibold text-[#0F172A]">Revenue by plan</h2>
          </div>
          <div className="divide-y divide-[#EEF0F3]">
            {data.revenue_by_plan.map((row) => (
              <div key={row.plan} className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[#FBFBFC]">
                <div className="flex items-center gap-3">
                  <Badge tone={planTone(row.plan)}>{row.plan}</Badge>
                  <span className="text-[12.5px] font-medium text-[#667085]">{row.subscriptions} subscriptions</span>
                </div>
                <span className="text-[15px] font-semibold text-[#0F172A]">{money(row.amount_cents)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="border-b border-[#EEF0F3] px-5 py-4">
            <h2 className="text-[14px] font-semibold text-[#0F172A]">Recent tickets</h2>
          </div>
          <div className="divide-y divide-[#EEF0F3]">
            {data.recent_tickets.map((ticket) => (
              <div key={ticket.id} className="px-5 py-3.5 transition-colors hover:bg-[#FBFBFC]">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-[13px] font-semibold text-[#0F172A]">{ticket.subject}</p>
                  <Badge tone={ticket.is_resolved ? "green" : "amber"}>{ticket.is_resolved ? "Resolved" : "Open"}</Badge>
                </div>
                <p className="mt-1 truncate text-[11.5px] font-medium text-[#98A2B3]">{ticket.email} · {formatDate(ticket.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

function AdminListPage<T>({
  title,
  eyebrow,
  endpoint,
  placeholder,
  params,
  filters,
  renderHeader,
  renderRow,
}: {
  title: string
  eyebrow: string
  endpoint: string
  placeholder: string
  params?: Record<string, string | undefined>
  filters?: React.ReactNode
  renderHeader: React.ReactNode
  renderRow: (row: T) => React.ReactNode
}) {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [data, setData] = useState<Page<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const paramsKey = JSON.stringify(params ?? {})

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedQuery(query)
      setPage(1)
    }, 250)
    return () => window.clearTimeout(id)
  }, [query])

  async function load() {
    setLoading(true)
    setError("")
    try {
      const response = await api.get<Page<T>>(endpoint, {
        params: {
          page,
          page_size: 12,
          q: debouncedQuery || undefined,
          ...(params ?? {}),
        },
      })
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load ${title.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [endpoint, page, debouncedQuery, paramsKey])

  return (
    <AdminShell title={title} eyebrow={eyebrow}>
      <div className="rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col gap-4 border-b border-[#EEF0F3] p-5">
          <div>
            <h2 className="text-[14px] font-semibold text-[#0F172A]">{title}</h2>
            <p className="mt-1 text-[12.5px] font-medium text-[#667085]">{data?.total ?? 0} records found</p>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-3 sm:grid-cols-2 lg:flex">
              {filters}
            </div>
            <div className="w-full lg:w-[340px]">
              <SearchBar value={query} onChange={setQuery} placeholder={placeholder} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-5"><LoadingCard /></div>
        ) : error || !data ? (
          <div className="p-5"><ErrorCard message={error || "No data"} onRetry={load} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="bg-[#F7F8FA] text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">
                  {renderHeader}
                </thead>
                <tbody className="divide-y divide-[#EEF0F3] bg-white">
                  {data.data.map(renderRow)}
                </tbody>
              </table>
            </div>
            {data.data.length === 0 && (
              <div className="px-5 py-12 text-center">
                <p className="text-[13px] font-semibold text-[#344054]">No matching records</p>
                <p className="mt-1 text-[12.5px] text-[#98A2B3]">Try a different search.</p>
              </div>
            )}
            <Pagination page={data.page} totalPages={data.total_pages} onPage={setPage} />
          </>
        )}
      </div>
    </AdminShell>
  )
}

function UserDetailPage({ userId }: { userId: string }) {
  const [data, setData] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function load() {
    setLoading(true)
    setError("")
    try {
      const response = await api.get<AdminUserDetail>(`/admin/users/${userId}`)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customer")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [userId])

  if (loading) return <LoadingCard />
  if (error || !data) return <ErrorCard message={error || "Customer not found"} onRetry={load} />

  const latestSubscription = data.subscriptions[0]
  const latestUsage = data.plan_usages[0]

  return (
    <AdminShell
      title="Customer profile"
      eyebrow="User detail"
      action={<Link to="/admin/users" className="inline-flex rounded-lg border border-[#E2E5EA] bg-white px-3 py-2 text-[12px] font-semibold text-[#344054] transition hover:bg-[#F7F8FA]">Back to users</Link>}
    >
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white">
                <UserRound size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-[#0F172A]">{data.email}</p>
                <p className="mt-1 text-[12px] font-medium text-[#667085]">Joined {formatDate(data.created_at)}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Badge tone={data.role === "ADMIN" ? "dark" : "slate"}>{data.role}</Badge>
              <Badge tone={planTone(data.plan)}>{data.plan}</Badge>
              <Badge tone={data.is_verified ? "green" : "amber"}>{data.is_verified ? "Verified" : "Unverified"}</Badge>
              <Badge tone="slate">{data.account_type}</Badge>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="text-[13px] font-semibold text-[#0F172A]">Account totals</h3>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#F7F8FA] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">Projects</p>
                <p className="mt-1 text-xl font-semibold text-[#0F172A]">{data._count.projects}</p>
              </div>
              <div className="rounded-xl bg-[#F7F8FA] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">Sara</p>
                <p className="mt-1 text-xl font-semibold text-[#0F172A]">{data._count.sara_conversations}</p>
              </div>
              <div className="rounded-xl bg-[#F7F8FA] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">Tickets</p>
                <p className="mt-1 text-xl font-semibold text-[#0F172A]">{data._count.helpcenter}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="text-[13px] font-semibold text-[#0F172A]">Current subscription</h3>
            {latestSubscription ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge tone={planTone(latestSubscription.plan)}>{latestSubscription.plan}</Badge>
                  <Badge tone={statusTone(latestSubscription.status)}>{latestSubscription.status}</Badge>
                </div>
                <p className="text-[22px] font-semibold tracking-[-0.02em] text-[#0F172A]">{money(latestSubscription.amount_cents, latestSubscription.currency)}</p>
                <p className="text-[12px] font-medium text-[#667085]">Renews/end: {formatDate(latestSubscription.current_period_end)}</p>
                {latestSubscription.cancel_at_period_end && <Badge tone="amber">Cancel at period end</Badge>}
              </div>
            ) : (
              <p className="mt-3 text-[12.5px] font-medium text-[#98A2B3]">No subscription found.</p>
            )}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="border-b border-[#EEF0F3] px-5 py-4">
              <h3 className="text-[14px] font-semibold text-[#0F172A]">Projects</h3>
            </div>
            <div className="divide-y divide-[#EEF0F3]">
              {data.projects.map((project) => (
                <div key={project.id} className="grid gap-3 px-5 py-4 transition-colors hover:bg-[#FBFBFC] md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-semibold text-[#0F172A]">{project.brand_name}</p>
                    <p className="mt-1 text-[12px] font-medium text-[#98A2B3]">{project.brand_url} · {project.brand_location}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11.5px] font-semibold text-[#667085]">
                    <span className="rounded-lg bg-[#F7F8FA] px-2.5 py-1">{project._count.prompts} prompts</span>
                    <span className="rounded-lg bg-[#F7F8FA] px-2.5 py-1">{project._count.competitors} competitors</span>
                    <span className="rounded-lg bg-[#F7F8FA] px-2.5 py-1">{project._count.runs} runs</span>
                  </div>
                </div>
              ))}
              {data.projects.length === 0 && <p className="px-5 py-6 text-[12.5px] font-medium text-[#98A2B3]">No projects yet.</p>}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <h3 className="text-[14px] font-semibold text-[#0F172A]">Latest usage window</h3>
              {latestUsage ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MetricMini label="Brands" value={latestUsage.brands_used} />
                  <MetricMini label="Prompts" value={latestUsage.prompts_used} />
                  <MetricMini label="Competitors" value={latestUsage.competitors_used} />
                  <MetricMini label="Refreshes" value={latestUsage.refreshes_used} />
                </div>
              ) : (
                <p className="mt-3 text-[12.5px] font-medium text-[#98A2B3]">No usage period recorded.</p>
              )}
            </div>

            <div className="rounded-2xl border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <h3 className="text-[14px] font-semibold text-[#0F172A]">Recent tickets</h3>
              <div className="mt-3 space-y-2">
                {data.helpcenter.map((ticket) => (
                  <div key={ticket.id} className="rounded-xl border border-[#EEF0F3] bg-[#FBFBFC] p-3 transition-colors hover:border-[#D0D5DD] hover:bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[12.5px] font-semibold text-[#0F172A]">{ticket.subject}</p>
                      <Badge tone={ticket.is_resolved ? "green" : "amber"}>{ticket.is_resolved ? "Resolved" : "Open"}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12px] text-[#667085]">{ticket.message}</p>
                  </div>
                ))}
                {data.helpcenter.length === 0 && <p className="text-[12.5px] font-medium text-[#98A2B3]">No support tickets.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

function MetricMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#F7F8FA] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#0F172A]">{value}</p>
    </div>
  )
}

function UsersPage() {
  const [plan, setPlan] = useState<Plan | "">("")
  const [role, setRole] = useState<Role | "">("")

  return (
    <AdminListPage<AdminUserRow>
      title="Users"
      eyebrow="Accounts"
      endpoint="/admin/users"
      placeholder="Search email or brand…"
      params={{ plan: plan || undefined, role: role || undefined }}
      filters={(
        <>
          <SelectFilter label="Plan" value={plan} options={PLAN_OPTIONS} onChange={setPlan} />
          <SelectFilter label="Role" value={role} options={ROLE_OPTIONS} onChange={setRole} />
        </>
      )}
      renderHeader={(
        <tr>
          <th className="px-5 py-3.5">User</th>
          <th className="px-5 py-3.5">Role</th>
          <th className="px-5 py-3.5">Plan</th>
          <th className="px-5 py-3.5">Projects</th>
          <th className="px-5 py-3.5">Subscription</th>
          <th className="px-5 py-3.5">Joined</th>
          <th className="px-5 py-3.5 text-right">Action</th>
        </tr>
      )}
      renderRow={(user) => (
        <tr key={user.id} className="text-[12.5px] transition-colors hover:bg-[#FBFBFC]">
          <td className="px-5 py-3.5">
            <p className="font-semibold text-[#0F172A]">{user.email}</p>
            <p className="mt-0.5 text-[11px] font-medium text-[#98A2B3]">{user.account_type}</p>
          </td>
          <td className="px-5 py-3.5"><Badge tone={user.role === "ADMIN" ? "dark" : "slate"}>{user.role}</Badge></td>
          <td className="px-5 py-3.5"><Badge tone={planTone(user.plan)}>{user.plan}</Badge></td>
          <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{user._count.projects}</td>
          <td className="px-5 py-3.5">
            {user.latest_subscription ? <Badge tone={statusTone(user.latest_subscription.status)}>{user.latest_subscription.status}</Badge> : <span className="text-[12px] font-medium text-[#98A2B3]">None</span>}
          </td>
          <td className="px-5 py-3.5 font-medium text-[#667085]">{formatDate(user.created_at)}</td>
          <td className="px-5 py-3.5 text-right">
            <Link to={`/admin/users/${user.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E5EA] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[#344054] transition hover:bg-[#F7F8FA]">
              <Eye size={13} />
              View
            </Link>
          </td>
        </tr>
      )}
    />
  )
}

function SubscriptionsPage() {
  const [plan, setPlan] = useState<Plan | "">("")
  const [status, setStatus] = useState<SubscriptionStatus | "">("")

  return (
    <AdminListPage<AdminSubscriptionRow>
      title="Subscriptions"
      eyebrow="Billing"
      endpoint="/admin/subscriptions"
      placeholder="Search customer or Stripe id…"
      params={{ plan: plan || undefined, status: status || undefined }}
      filters={(
        <>
          <SelectFilter label="Plan" value={plan} options={PLAN_OPTIONS} onChange={setPlan} />
          <SelectFilter label="Status" value={status} options={SUBSCRIPTION_STATUS_OPTIONS} onChange={setStatus} />
        </>
      )}
      renderHeader={(
        <tr>
          <th className="px-5 py-3.5">Customer</th>
          <th className="px-5 py-3.5">Plan</th>
          <th className="px-5 py-3.5">Status</th>
          <th className="px-5 py-3.5">Amount</th>
          <th className="px-5 py-3.5">Period end</th>
          <th className="px-5 py-3.5">Canceling</th>
        </tr>
      )}
      renderRow={(subscription) => (
        <tr key={subscription.id} className="text-[12.5px] transition-colors hover:bg-[#FBFBFC]">
          <td className="px-5 py-3.5">
            <p className="font-semibold text-[#0F172A]">{subscription.user.email}</p>
            <p className="mt-0.5 text-[11px] font-medium text-[#98A2B3]">{formatDate(subscription.created_at)}</p>
          </td>
          <td className="px-5 py-3.5"><Badge tone={planTone(subscription.plan)}>{subscription.plan}</Badge></td>
          <td className="px-5 py-3.5"><Badge tone={statusTone(subscription.status)}>{subscription.status}</Badge></td>
          <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{money(subscription.amount_cents, subscription.currency)}</td>
          <td className="px-5 py-3.5 font-medium text-[#667085]">{formatDate(subscription.current_period_end)}</td>
          <td className="px-5 py-3.5">{subscription.cancel_at_period_end ? <Badge tone="amber">Yes</Badge> : <Badge tone="green">No</Badge>}</td>
        </tr>
      )}
    />
  )
}

function TicketsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [status, setStatus] = useState<"open" | "resolved" | "all">("open")

  async function resolveTicket(id: string, isResolved: boolean) {
    await api.patch(`/admin/tickets/${id}/resolve`, { is_resolved: isResolved })
    setRefreshKey((key) => key + 1)
  }

  return (
    <AdminListPage<AdminTicketRow>
      key={refreshKey}
      title="Support tickets"
      eyebrow="Help center"
      endpoint="/admin/tickets"
      placeholder="Search ticket, email, message…"
      params={{ status }}
      filters={<SelectFilter label="Status" value={status} options={[...TICKET_STATUS_OPTIONS]} onChange={setStatus} />}
      renderHeader={(
        <tr>
          <th className="px-5 py-3.5">Ticket</th>
          <th className="px-5 py-3.5">Customer</th>
          <th className="px-5 py-3.5">Status</th>
          <th className="px-5 py-3.5">Created</th>
          <th className="px-5 py-3.5 text-right">Action</th>
        </tr>
      )}
      renderRow={(ticket) => (
        <tr key={ticket.id} className="text-[12.5px] transition-colors hover:bg-[#FBFBFC]">
          <td className="max-w-[400px] px-5 py-3.5">
            <p className="font-semibold text-[#0F172A]">{ticket.subject}</p>
            <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-5 text-[#667085]">{ticket.message}</p>
          </td>
          <td className="px-5 py-3.5">
            <p className="font-medium text-[#344054]">{ticket.email}</p>
            {ticket.user?.plan && <p className="mt-0.5 text-[11px] font-medium text-[#98A2B3]">{ticket.user.plan}</p>}
          </td>
          <td className="px-5 py-3.5"><Badge tone={ticket.is_resolved ? "green" : "amber"}>{ticket.is_resolved ? "Resolved" : "Open"}</Badge></td>
          <td className="px-5 py-3.5 font-medium text-[#667085]">{formatDate(ticket.created_at)}</td>
          <td className="px-5 py-3.5 text-right">
            <button
              onClick={() => void resolveTicket(ticket.id, !ticket.is_resolved)}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition",
                ticket.is_resolved ? "border border-[#E2E5EA] bg-white text-[#344054] hover:bg-[#F7F8FA]" : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]",
              )}
            >
              <CheckCircle2 size={13} />
              {ticket.is_resolved ? "Reopen" : "Resolve"}
            </button>
          </td>
        </tr>
      )}
    />
  )
}

function ProjectsPage() {
  return (
    <AdminListPage<AdminProjectRow>
      title="Projects"
      eyebrow="Workspaces"
      endpoint="/admin/projects"
      placeholder="Search brand, domain, owner…"
      renderHeader={(
        <tr>
          <th className="px-5 py-3.5">Brand</th>
          <th className="px-5 py-3.5">Owner</th>
          <th className="px-5 py-3.5">Prompts</th>
          <th className="px-5 py-3.5">Competitors</th>
          <th className="px-5 py-3.5">Runs</th>
          <th className="px-5 py-3.5">Created</th>
        </tr>
      )}
      renderRow={(project) => (
        <tr key={project.id} className="text-[12.5px] transition-colors hover:bg-[#FBFBFC]">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#E2E5EA] bg-white">
                <Building2 size={16} className="text-[#667085]" />
              </div>
              <div>
                <p className="font-semibold text-[#0F172A]">{project.brand_name}</p>
                <p className="mt-0.5 text-[11px] font-medium text-[#98A2B3]">{project.brand_url} · {project.brand_location}</p>
              </div>
            </div>
          </td>
          <td className="px-5 py-3.5">
            <p className="font-medium text-[#344054]">{project.user.email}</p>
            <Badge tone={planTone(project.user.plan)}>{project.user.plan}</Badge>
          </td>
          <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{project._count.prompts}</td>
          <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{project._count.competitors}</td>
          <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{project._count.runs}</td>
          <td className="px-5 py-3.5 font-medium text-[#667085]">{formatDate(project.created_at)}</td>
        </tr>
      )}
    />
  )
}

export function AdminTab() {
  const { user } = useAuth()
  const location = useLocation()
  const userDetailMatch = location.pathname.match(/^\/admin\/users\/([^/]+)$/)
  const section = useMemo(() => {
    if (userDetailMatch) return "user-detail"
    if (location.pathname.startsWith("/admin/users")) return "users"
    if (location.pathname.startsWith("/admin/subscriptions")) return "subscriptions"
    if (location.pathname.startsWith("/admin/tickets")) return "tickets"
    if (location.pathname.startsWith("/admin/projects")) return "projects"
    return "overview"
  }, [location.pathname, userDetailMatch])

  if (user?.role !== "ADMIN") return <Navigate to="/dashboard" replace />
  if (section === "user-detail" && userDetailMatch?.[1]) return <UserDetailPage userId={decodeURIComponent(userDetailMatch[1])} />
  if (section === "users") return <UsersPage />
  if (section === "subscriptions") return <SubscriptionsPage />
  if (section === "tickets") return <TicketsPage />
  if (section === "projects") return <ProjectsPage />
  return <AdminOverviewPage />
}

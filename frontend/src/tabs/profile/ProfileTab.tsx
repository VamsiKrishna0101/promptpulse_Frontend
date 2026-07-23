import {
  useEffect,
  useState,
} from "react"
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  FolderKanban,
  Globe2,
  Loader2,
  Mail,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react"
import { useProfile } from "@/hooks/useProfile"

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set"
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function BrandLogo({ domain, name, size = "md" }: { domain?: string | null; name: string; size?: "md" | "lg" }) {
  const [failed, setFailed] = useState(false)
  const logoDomain = domain?.trim() || "promptpulse.com"
  const logoSrc = failed ? "/favicon.svg" : `https://www.google.com/s2/favicons?domain=${encodeURIComponent(logoDomain)}&sz=64`
  const shellClass = size === "lg" ? "h-14 w-14 rounded-xl" : "h-10 w-10 rounded-[10px]"
  const imageClass = size === "lg" ? "h-8 w-8" : "h-5 w-5"

  useEffect(() => {
    setFailed(false)
  }, [logoDomain])

  return (
    <div className={`flex flex-shrink-0 items-center justify-center border border-[#E2E5EA] bg-white ${shellClass}`}>
      <img
        src={logoSrc}
        alt={`${name} logo`}
        className={`${imageClass} object-contain`}
        onError={() => setFailed(true)}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  caption,
  icon,
}: {
  label: string
  value: string | number
  caption: string
  icon: React.ReactNode
}) {
  return (
    <div className="profile-stat-card rounded-lg border border-[#E2E5EA] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A94A6]">{label}</p>
        <span className="text-[#B4BBC7]">{icon}</span>
      </div>
      <p className="mt-3 text-[26px] font-semibold leading-none tracking-[-0.02em] text-[#101828]">{value}</p>
      <p className="mt-2 text-[12.5px] font-medium leading-5 text-[#667085]">{caption}</p>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#EEF0F3] py-3.5 last:border-b-0">
      <div className="flex items-center gap-2.5 text-[13px] font-medium text-[#667085]">
        <span className="text-[#98A2B3]">{icon}</span>
        {label}
      </div>
      <p className="max-w-[55%] truncate text-right text-[13px] font-semibold text-[#101828]">{value}</p>
    </div>
  )
}

export function ProfileTab() {
  const { data, isLoading, error, refresh } = useProfile()
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 rounded-lg border border-[#E2E5EA] bg-white px-4 py-3 text-[12.5px] font-medium text-[#667085]">
          <Loader2 size={16} className="animate-spin" />
          Loading profile…
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-[#FDA29B] bg-[#FEF3F2] p-5 text-[13px] font-semibold text-[#B42318]">
        {error ?? "Profile data is unavailable."}
      </div>
    )
  }

  const projects = data.projects ?? []
  const wallet = data.wallet ?? { balance: 0, used: 0 }
  const usage = data.usage ?? {
    prompt_count: 0,
    project_count: projects.length,
    competitor_count: 0,
    monthly_runs_used: 0,
    period_start: null,
    period_end: null,
  }
  const primaryProject = projects[0]

  return (
    <div className="space-y-5">
      <style>{`
        .profile-stat-card {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .profile-stat-card:hover {
          border-color: #C9CEDA;
          box-shadow: 0 1px 3px rgba(16,24,40,0.06);
        }
        .profile-refresh-btn {
          transition: background 0.12s ease, border-color 0.12s ease;
        }
        .profile-plan-pill {
          border: 1px solid #C7D2FE;
          background: #EEF2FF;
          color: #3730A3;
        }
        .profile-project-row {
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .profile-project-row:hover {
          border-color: #C9CEDA;
          background: #FAFBFC;
        }
      `}</style>

      {/* ── Header ── */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#E2E5EA] bg-white px-6 py-5">
        <div className="flex min-w-0 items-center gap-4">
          <BrandLogo domain={primaryProject?.brand_url} name={primaryProject?.brand_name ?? "PromptPulse"} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-[20px] font-semibold tracking-[-0.01em] text-[#101828]">Profile</h1>
              {data.user.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[#B7EFCF] bg-[#ECFDF3] px-2 py-0.5 text-[11px] font-semibold text-[#067647]">
                  <BadgeCheck size={12} />
                  Verified
                </span>
              )}
              <span className="profile-plan-pill inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                PAYG WALLET
              </span>
            </div>
            <p className="mt-1 truncate text-[13px] font-medium text-[#667085]">{data.user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="profile-refresh-btn flex h-9 items-center gap-2 rounded-md border border-[#D0D5DD] bg-white px-3.5 text-[12.5px] font-semibold text-[#344054] hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          <RefreshCcw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </section>

      {/* ── Stats ── */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<CreditCard size={15} />} label="Wallet balance" value={wallet.balance.toLocaleString()} caption="Credits available to use" />
        <StatCard
          icon={<Sparkles size={15} />}
          label="Credits used"
          value={wallet.used.toLocaleString()}
          caption="All-time wallet usage"
        />
        <StatCard icon={<FolderKanban size={15} />} label="Projects" value={usage.project_count} caption={`${projects.length} workspace records`} />
        <StatCard icon={<Sparkles size={15} />} label="Prompts" value={usage.prompt_count} caption="Tracked prompts in this period" />
      </section>

      {/* ── Details + Workspaces ── */}
      <section className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <div className="rounded-lg border border-[#E2E5EA] bg-white p-5">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold tracking-[-0.005em] text-[#101828]">Account details</p>
              <p className="mt-0.5 text-[12px] font-medium text-[#98A2B3]">Identity and wallet access</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F9FAFB] text-[#667085]">
              <UserRound size={15} />
            </span>
          </div>

          <DetailRow icon={<Mail size={14} />} label="Email" value={data.user.email} />
          <DetailRow icon={<ShieldCheck size={14} />} label="Account type" value={data.user.account_type} />
          <DetailRow icon={<CalendarDays size={14} />} label="Joined" value={formatDate(data.user.created_at)} />
          <DetailRow icon={<CreditCard size={14} />} label="Billing model" value="Pay-As-You-Go" />
          <DetailRow icon={<Sparkles size={14} />} label="Trial allowance" value="105 credits" />
        </div>

        <div className="rounded-lg border border-[#E2E5EA] bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold tracking-[-0.005em] text-[#101828]">Brand workspaces</p>
              <p className="mt-0.5 text-[12px] font-medium text-[#98A2B3]">Projects attached to this profile</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F9FAFB] text-[#667085]">
              <FolderKanban size={15} />
            </span>
          </div>

          <div className="space-y-2.5">
            {projects.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#E2E5EA] bg-[#FAFBFC] px-4 py-8 text-center">
                <p className="text-[13px] font-semibold text-[#344054]">No projects yet</p>
                <p className="mt-1 text-[12px] text-[#98A2B3]">Create a brand workspace to start tracking visibility.</p>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="profile-project-row flex items-center justify-between gap-4 rounded-md border border-[#E2E5EA] bg-white px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <BrandLogo domain={project.brand_url} name={project.brand_name} />
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold text-[#101828]">{project.brand_name}</p>
                      <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-[#667085]">
                        <Globe2 size={12} className="flex-shrink-0 text-[#98A2B3]" />
                        <span className="truncate">{project.brand_url}</span>
                      </div>
                    </div>
                  </div>
                  <span className="flex-shrink-0 rounded-md border border-[#E2E5EA] bg-[#FAFBFC] px-2 py-1 text-[11px] font-semibold text-[#667085]">
                    {project.brand_location}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

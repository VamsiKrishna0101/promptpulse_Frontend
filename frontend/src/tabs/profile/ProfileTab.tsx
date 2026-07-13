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

function formatMoney(amountCents?: number, currency = "usd") {
  if (amountCents === undefined) return "$0"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amountCents / 100)
}

function formatStatus(status?: string) {
  if (!status) return "Free"
  return status.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function BrandLogo({ domain, name, size = "md" }: { domain?: string | null; name: string; size?: "md" | "lg" }) {
  const [failed, setFailed] = useState(false)
  const logoDomain = domain?.trim() || "refractone.com"
  const logoSrc = failed ? "/favicon.svg" : `https://www.google.com/s2/favicons?domain=${encodeURIComponent(logoDomain)}&sz=64`
  const shellClass = size === "lg" ? "h-16 w-16 rounded-2xl" : "h-10 w-10 rounded-xl"
  const imageClass = size === "lg" ? "h-10 w-10" : "h-6 w-6"

  useEffect(() => {
    setFailed(false)
  }, [logoDomain])

  return (
    <div className={`flex flex-shrink-0 items-center justify-center border border-[#E2E5EA] bg-white shadow-[0_8px_20px_-12px_rgba(37,99,235,0.45)] ${shellClass}`}>
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
  tone,
}: {
  label: string
  value: string | number
  caption: string
  tone: "blue" | "green" | "amber" | "slate"
}) {
  // Solid dot colors — distinct from the pale badge tints so the dot is actually visible.
  const dotClass = {
    blue: "bg-[#2563EB]",
    green: "bg-[#12B76A]",
    amber: "bg-[#F79009]",
    slate: "bg-[#98A2B3]",
  }[tone]

  return (
    <div className="rounded-2xl border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">{label}</p>
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      </div>
      <p className="mt-4 text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#0F172A]">{value}</p>
      <p className="mt-2 text-[12.5px] font-medium leading-5 text-[#667085]">{caption}</p>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#EEF0F3] py-3 last:border-b-0">
      <div className="flex items-center gap-2.5 text-[13px] font-medium text-[#667085]">
        <span className="text-[#98A2B3]">{icon}</span>
        {label}
      </div>
      <p className="max-w-[55%] truncate text-right text-[13px] font-semibold text-[#0F172A]">{value}</p>
    </div>
  )
}

export function ProfileTab() {
  const { data, isLoading, error, refresh } = useProfile()

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 rounded-xl border border-[#E2E5EA] bg-white px-4 py-3 text-[12.5px] font-medium text-[#667085] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <Loader2 size={16} className="animate-spin" />
          Loading profile…
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-[#FDA29B] bg-[#FEF3F2] p-5 text-[13px] font-semibold text-[#B42318]">
        {error ?? "Profile data is unavailable."}
      </div>
    )
  }

  const subscription = data.subscription
  const activePlan = subscription?.plan ?? data.user.plan ?? "FREE"
  const status = subscription?.status ?? "FREE"
  const primaryProject = data.projects[0]

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-[#E2E5EA] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_18%_0%,rgba(37,99,235,0.08),transparent_22rem)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <BrandLogo domain={primaryProject?.brand_url} name={primaryProject?.brand_name ?? "Refractone"} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-[24px] font-semibold tracking-[-0.02em] text-[#0F172A]">Profile</h1>
                {data.user.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#B7EFCF] bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-semibold text-[#047857]">
                    <BadgeCheck size={12} />
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-[13px] font-medium text-[#667085]">{data.user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void refresh()}
            className="flex h-9 items-center gap-2 rounded-lg border border-[#E2E5EA] bg-white px-3 text-[12px] font-semibold text-[#475467] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:bg-[#F7F8FA]"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current plan" value={activePlan} caption={formatStatus(status)} tone="blue" />
        <StatCard
          label="Trial"
          value={data.trial.trial_active ? `${data.trial.trial_days_left}d` : "Ended"}
          caption={`Ends ${formatDate(data.trial.trial_ends_at)}`}
          tone={data.trial.trial_active ? "green" : "slate"}
        />
        <StatCard label="Projects" value={data.usage.project_count} caption={`${data.projects.length} workspace records`} tone="amber" />
        <StatCard label="Prompts" value={data.usage.prompt_count} caption="Tracked prompts in this period" tone="slate" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <div className="rounded-2xl border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">Account details</p>
              <p className="mt-1 text-[12px] font-medium text-[#98A2B3]">Identity and billing status</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F7F8FA] text-[#667085]">
              <UserRound size={16} />
            </span>
          </div>

          <DetailRow icon={<Mail size={14} />} label="Email" value={data.user.email} />
          <DetailRow icon={<ShieldCheck size={14} />} label="Account type" value={data.user.account_type} />
          <DetailRow icon={<CalendarDays size={14} />} label="Joined" value={formatDate(data.user.created_at)} />
          <DetailRow icon={<CreditCard size={14} />} label="Billing" value={`${formatMoney(subscription?.amount_cents, subscription?.currency)} / month`} />
          <DetailRow icon={<Sparkles size={14} />} label="Trial started" value={formatDate(data.trial.trial_starts_at)} />
        </div>

        <div className="rounded-2xl border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">Brand workspaces</p>
              <p className="mt-1 text-[12px] font-medium text-[#98A2B3]">Projects attached to this profile</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <FolderKanban size={16} />
            </span>
          </div>

          <div className="space-y-3">
            {data.projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E2E5EA] bg-[#F7F8FA] px-4 py-8 text-center">
                <p className="text-[13px] font-semibold text-[#344054]">No projects yet</p>
                <p className="mt-1 text-[12px] text-[#98A2B3]">Create a brand workspace to start tracking visibility.</p>
              </div>
            ) : (
              data.projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#E2E5EA] bg-[#F7F8FA] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <BrandLogo domain={project.brand_url} name={project.brand_name} />
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold text-[#0F172A]">{project.brand_name}</p>
                      <div className="mt-1 flex min-w-0 items-center gap-2 text-[12px] font-medium text-[#667085]">
                        <Globe2 size={13} className="flex-shrink-0 text-[#98A2B3]" />
                        <span className="truncate">{project.brand_url}</span>
                      </div>
                    </div>
                  </div>
                  <span className="flex-shrink-0 rounded-full border border-[#E2E5EA] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#667085]">
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

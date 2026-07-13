import { Check, ChevronRight, CreditCard, Loader2, RefreshCcw, ShieldCheck, Sparkles, X } from "lucide-react"
import { useState } from "react"
import { useSubscription, type PlanName } from "@/hooks/useSubscription"

type PaidPlan = Exclude<PlanName, "FREE">

const PLANS: {
  id: PaidPlan
  name: string
  price: number
  tagline: string
  badge?: string
  features: string[]
}[] = [
    {
      id: "STARTER",
      name: "Starter",
      price: 29,
      tagline: "For validating one brand.",
      features: [
        "1 brand workspace",
        "20 tracked prompts",
        "Track 5 AI surfaces",
        "3 competitors",
        "2 refreshes / week",
        "Weekly email report",
        "Chat support",
      ],
    },
    {
      id: "GROWTH",
      name: "Growth",
      price: 39,
      tagline: "Best for serious founders.",
      badge: "Most popular",
      features: [
        "2 brand workspaces",
        "50 tracked prompts",
        "Track 5 AI surfaces",
        "6 competitors",
        "Daily refresh",
        "Full Sara assistance",
        "CSV and PDF exports",
        "Weekly email report",
      ],
    },
    {
      id: "PRO",
      name: "Pro",
      price: 99,
      tagline: "For more markets and teams.",
      features: [
        "5 brand workspaces",
        "125 tracked prompts",
        "Track 5 AI surfaces",
        "15 competitors",
        "Daily refresh",
        "Advanced Sara strategy",
        "Advanced exports",
        "Priority chat support",
      ],
    },
  ]

const COMPARISON_ROWS: {
  section?: string
  label: string
  values: Record<PaidPlan, string | boolean>
}[] = [
    { section: "Monitoring and analytics", label: "Brands / projects", values: { STARTER: "1", GROWTH: "2", PRO: "5" } },
    { label: "Tracked prompts", values: { STARTER: "20", GROWTH: "50", PRO: "125" } },
    { label: "Tracked AI surfaces", values: { STARTER: "5 surfaces", GROWTH: "5 surfaces", PRO: "5 surfaces" } },
    { label: "Competitors", values: { STARTER: "3", GROWTH: "6", PRO: "15" } },
    { label: "Refresh rate", values: { STARTER: "2x / week", GROWTH: "Daily", PRO: "Daily" } },
    { label: "Country-level tracking", values: { STARTER: true, GROWTH: true, PRO: true } },
    { section: "Sara and insights", label: "Sara assistant", values: { STARTER: false, GROWTH: "Full", PRO: "Advanced" } },
    { label: "Source opportunity recommendations", values: { STARTER: "Basic", GROWTH: true, PRO: true } },
    { label: "Competitor movement analysis", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Prompt evidence and citations", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Advanced strategic recommendations", values: { STARTER: false, GROWTH: false, PRO: true } },
    { section: "Reports and support", label: "Weekly email reports", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "CSV exports", values: { STARTER: false, GROWTH: true, PRO: true } },
    { label: "PDF exports", values: { STARTER: false, GROWTH: true, PRO: true } },
    { label: "Chat support", values: { STARTER: true, GROWTH: true, PRO: "Priority" } },
    { label: "Export history", values: { STARTER: false, GROWTH: "30 days", PRO: "Unlimited" } },
  ]

function formatStatus(status: string) {
  if (status === "FREE") return "Free"
  return status.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function periodDate(value: string | null) {
  if (!value) return "No billing period yet"
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function SegmentedControl({ value, onChange }: { value: "monthly" | "annual"; onChange: (value: "monthly" | "annual") => void }) {
  return (
    <div className="inline-flex rounded-full border border-[#E2E5EA] bg-[#F7F8FA] p-1">
      {(["monthly", "annual"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={[
            "rounded-full px-4 py-1.5 text-[12.5px] font-semibold capitalize transition",
            value === option
              ? "bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
              : "text-[#667085] hover:text-[#344054]",
          ].join(" ")}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

// Compact inline stat — used inside the status strip, not a standalone card anymore.
function UsageStat({ label, used, limit }: { label: string; used: number; limit: number | string }) {
  return (
    <div className="flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-[13px] font-semibold text-[#0F172A]">{used}</span>
      <span className="text-[11.5px] text-[#98A2B3]">/ {limit} {label}</span>
    </div>
  )
}

function PlanCard({
  plan,
  billing,
  currentPlan,
  checkoutPlan,
  onSelect,
}: {
  plan: typeof PLANS[number]
  billing: "monthly" | "annual"
  currentPlan: PlanName
  checkoutPlan: PlanName | null
  onSelect: (plan: PaidPlan) => void
}) {
  const isCurrent = currentPlan === plan.id
  const isLoading = checkoutPlan === plan.id
  const displayedPrice = billing === "annual" ? Math.round(plan.price * 0.8) : plan.price
  const featured = plan.id === "GROWTH"

  return (
    <article
      className={[
        "relative flex flex-col rounded-2xl border bg-white p-7 transition",
        featured
          ? "border-[#2563EB] shadow-[0_24px_56px_-24px_rgba(37,99,235,0.32)] md:-translate-y-3"
          : "border-[#E2E5EA] shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
      ].join(" ")}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)]">
          {plan.badge}
        </span>
      )}

      <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#0F172A]">{plan.name}</h3>
      <p className="mt-1.5 min-h-[36px] text-[12.5px] leading-5 text-[#667085]">{plan.tagline}</p>

      <div className="mt-6 flex items-end gap-1">
        <span className="text-[36px] font-semibold leading-none tracking-[-0.02em] text-[#0F172A]">${displayedPrice}</span>
        <span className="pb-1 text-[12.5px] font-medium text-[#667085]">/monthly</span>
      </div>
      <p className="mt-1.5 h-4 text-[11.5px] font-semibold text-[#2563EB]">
        {billing === "annual" ? "Billed annually · 20% off" : "\u00A0"}
      </p>

      <button
        type="button"
        disabled={isCurrent || isLoading}
        onClick={() => onSelect(plan.id)}
        className={[
          "mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-semibold transition",
          isCurrent
            ? "border border-[#B7EFCF] bg-[#ECFDF3] text-[#047857]"
            : featured
              ? "bg-[#2563EB] text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] hover:bg-[#1D4ED8]"
              : "border border-[#E2E5EA] bg-white text-[#344054] hover:border-[#D0D5DD] hover:bg-[#F7F8FA]",
        ].join(" ")}
      >
        {isLoading ? <Loader2 size={15} className="animate-spin" /> : isCurrent ? "Current plan" : "Get started"}
        {!isCurrent && !isLoading && <ChevronRight size={14} />}
      </button>

      <div className="mt-7 space-y-3 border-t border-[#EEF0F3] pt-6">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2.5 text-[13px] text-[#344054]">
            <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
              <Check size={10} strokeWidth={3} />
            </span>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function ValueCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-[#ECFDF3] text-[#047857]">
        <Check size={14} strokeWidth={2.4} />
      </span>
    )
  }
  if (value === false) {
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-[#F1F3F6] text-[#98A2B3]">
        <X size={13} strokeWidth={2.2} />
      </span>
    )
  }
  return <span className="text-[13px] font-semibold text-[#0F172A]">{value}</span>
}

export function SubscriptionTab() {
  const { data, isLoading, error, checkoutPlan, startCheckout, refresh } = useSubscription()
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")
  const currentPlan = data?.plan ?? "FREE"

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 rounded-xl border border-[#E2E5EA] bg-white px-4 py-3 text-[12.5px] font-medium text-[#667085] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <Loader2 size={16} className="animate-spin" />
          Loading subscription…
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ── Status strip — compact, single row, doesn't compete with the headline ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E2E5EA] bg-white px-5 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#1D4ED8]">
            <CreditCard size={15} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0F172A]">
              {currentPlan} <span className="font-medium text-[#98A2B3]">· {formatStatus(data?.status ?? "FREE")}</span>
            </p>
            <p className="text-[11.5px] text-[#98A2B3]">Period ends: {periodDate(data?.subscription?.current_period_end ?? null)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <UsageStat label="brands" used={data?.usage.project_count ?? 0} limit={data?.limits.projects ?? 0} />
          <UsageStat label="prompts" used={data?.usage.prompt_count ?? 0} limit={data?.limits.prompts ?? 0} />
          <UsageStat label="competitors" used={data?.usage.competitor_count ?? 0} limit={data?.limits.competitors ?? 0} />
          <UsageStat label="refreshes" used={data?.usage.monthly_runs_used ?? 0} limit={data?.limits.refreshes_per_week ?? 0} />
          <button
            type="button"
            onClick={() => void refresh()}
            className="flex h-7 items-center gap-1.5 rounded-md border border-[#E2E5EA] bg-white px-2.5 text-[11.5px] font-semibold text-[#475467] transition hover:bg-[#F7F8FA]"
          >
            <RefreshCcw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-[12.5px] font-medium text-[#B42318]">
          {error}
        </div>
      )}

      {/* ── Headline + toggle, centered, the actual hero ── */}
      <div className="flex flex-col items-center gap-5 text-center">
        <h1 className="max-w-[560px] text-[30px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#0F172A]">
          Simple plans for AI visibility monitoring.
        </h1>
        <p className="max-w-[540px] text-[13.5px] leading-6 text-[#667085]">
          Track your brand across AI answers, competitor mentions, source citations, exports, weekly reports, and Sara strategy.
        </p>
        <SegmentedControl value={billing} onChange={setBilling} />
      </div>

      {/* ── Plan cards — real separated cards, featured one lifted ── */}
      <div className="grid grid-cols-1 gap-5 pt-3 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billing={billing}
            currentPlan={currentPlan}
            checkoutPlan={checkoutPlan}
            onSelect={startCheckout}
          />
        ))}
      </div>

      {/* ── Comparison table ── */}
      <section className="overflow-hidden rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-[#E7E9EC] bg-[#FBFBFC]">
          <div className="px-6 py-5">
            <p className="text-[12.5px] font-semibold text-[#0F172A]">Features</p>
            <p className="mt-1 text-[11.5px] text-[#98A2B3]">Compare plan capabilities</p>
          </div>
          {PLANS.map((plan) => (
            <div key={plan.id} className="px-6 py-5 text-center">
              <p className="text-[12.5px] font-semibold text-[#0F172A]">{plan.name}</p>
              <p className="mt-1 text-[12px] font-medium text-[#667085]">
                ${plan.price}<span className="text-[#98A2B3]">/monthly</span>
              </p>
            </div>
          ))}
        </div>

        {COMPARISON_ROWS.map((row, index) => (
          <div key={`${row.label}-${index}`}>
            {row.section && (
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-[#E7E9EC] bg-[#F7F8FA]">
                <div className="flex items-center gap-2 px-6 py-4">
                  <ShieldCheck size={14} className="text-[#667085]" />
                  <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#0F172A]">{row.section}</p>
                </div>
                <div />
                <div />
                <div />
              </div>
            )}
            <div className="grid min-h-[60px] grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-[#E7E9EC] last:border-b-0">
              <div className="flex items-center px-6 text-[12.5px] font-medium text-[#667085]">
                <span className="border-b border-dashed border-[#D0D5DD]">{row.label}</span>
              </div>
              {PLANS.map((plan) => (
                <div key={plan.id} className="flex items-center justify-center px-4 text-center">
                  <ValueCell value={row.values[plan.id]} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Footnote ── */}
      <section className="rounded-2xl border border-[#E2E5EA] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]">
            <Sparkles size={16} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0F172A]">No agency tier yet</h3>
            <p className="mt-0.5 text-[12.5px] leading-5 text-[#667085]">
              This stays solo-founder safe: fixed plans, no surprise usage billing, no unlimited promises.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

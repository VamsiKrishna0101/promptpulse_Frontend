import { Check, ChevronRight, CreditCard, Loader2, RefreshCcw, ShieldCheck, Sparkles, X, Zap } from "lucide-react"
import { useState } from "react"
import { useSubscription, type PlanName } from "@/hooks/useSubscription"

type PaidPlan = Exclude<PlanName, "FREE">
type PlanFeature = { label: string; included?: boolean }

const PLANS: {
  id: PaidPlan
  name: string
  price: number
  oldPrice?: number
  tagline: string
  badge?: string
  features: PlanFeature[]
}[] = [
    {
      id: "STARTER",
      name: "Starter",
      price: 29,
      oldPrice: 49,
      tagline: "Essentials for one brand getting serious about AI visibility",
      features: [
        { label: "1 project" },
        { label: "20 shared prompts" },
        { label: "Up to 480 AI responses per month" },
        { label: "Twice a week refresh" },
        { label: "ChatGPT, Gemini, Perplexity" },
        { label: "5 tracked competitors" },
        { label: "30 monthly credits for reports and premium actions" },
        { label: "Visibility, position, sentiment" },
        { label: "Sources, citations, and chat evidence" },
        { label: "Weekly email report" },
        { label: "Google AI Mode and Copilot", included: false },
        { label: "Sara core assistant" },
        { label: "Action queue", included: false },
        { label: "CSV and PDF exports", included: false },
      ],
    },
    {
      id: "GROWTH",
      name: "Growth",
      price: 59,
      oldPrice: 79,
      tagline: "Perfect for growing SaaS teams that need daily monitoring",
      badge: "79% pick this option",
      features: [
        { label: "2 projects" },
        { label: "50 shared prompts" },
        { label: "Up to 7,500 AI responses per month" },
        { label: "Daily refresh" },
        { label: "All Starter models + Google AI Mode and Copilot" },
        { label: "12 tracked competitors" },
        { label: "100 monthly credits for reports and premium actions" },
        { label: "Source enrichment" },
        { label: "Action queue" },
        { label: "Sara strategy assistant" },
        { label: "GEO article briefs" },
        { label: "CSV and PDF exports" },
        { label: "Weekly email report" },
      ],
    },
    {
      id: "PRO",
      name: "Pro",
      price: 129,
      oldPrice: 219,
      tagline: "For agencies and teams managing more markets and competitors",
      features: [
        { label: "5 projects" },
        { label: "125 shared prompts" },
        { label: "Up to 18,750 AI responses per month" },
        { label: "Daily refresh" },
        { label: "All Growth AI surfaces" },
        { label: "Unlimited tracked competitors" },
        { label: "275 monthly credits for reports and premium actions" },
        { label: "Advanced source and competitor intelligence" },
        { label: "Advanced Sara strategy" },
        { label: "Advanced GEO article briefs" },
        { label: "Advanced exports" },
        { label: "Priority chat support" },
      ],
    },
  ]

const COMPARISON_ROWS: {
  section?: string
  label: string
  values: Record<PaidPlan, string | boolean>
}[] = [
    { section: "Monitoring and analytics", label: "Projects", values: { STARTER: "1", GROWTH: "2", PRO: "5" } },
    { label: "Tracked prompts", values: { STARTER: "20 shared", GROWTH: "50 shared", PRO: "125 shared" } },
    { label: "Estimated AI responses / month", values: { STARTER: "480", GROWTH: "7,500", PRO: "18,750" } },
    { label: "Tracked AI surfaces", values: { STARTER: "3 surfaces", GROWTH: "5 surfaces", PRO: "5 surfaces" } },
    { label: "Competitors", values: { STARTER: "5", GROWTH: "12", PRO: "Unlimited" } },
    { label: "Monthly credits for reports, exports, briefs, and premium AI actions", values: { STARTER: "30", GROWTH: "100", PRO: "275" } },
    { label: "Refresh rate", values: { STARTER: "2x / week", GROWTH: "Daily", PRO: "Daily" } },
    { label: "14-day free trial", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Country-level tracking", values: { STARTER: true, GROWTH: true, PRO: true } },
    { section: "AI surfaces", label: "ChatGPT, Gemini, Perplexity", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Google AI Mode", values: { STARTER: false, GROWTH: true, PRO: true } },
    { label: "Microsoft Copilot", values: { STARTER: false, GROWTH: true, PRO: true } },
    { section: "Sara and insights", label: "Sara assistant", values: { STARTER: "Core", GROWTH: "Strategy", PRO: "Advanced" } },
    { label: "Source opportunity recommendations", values: { STARTER: "Basic", GROWTH: true, PRO: true } },
    { label: "Source enrichment", values: { STARTER: "Basic", GROWTH: true, PRO: "Advanced" } },
    { label: "Action queue", values: { STARTER: false, GROWTH: true, PRO: "Advanced" } },
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

function planHeadline(data: ReturnType<typeof useSubscription>["data"]) {
  if (!data) return "FREE"
  if (data.trial?.active) return "FREE TRIAL"
  return data.plan
}

function planSubline(data: ReturnType<typeof useSubscription>["data"]) {
  if (!data) return "Free"
  if (data.trial?.active) return `Growth preview - ${data.trial.days_left} day${data.trial.days_left === 1 ? "" : "s"} left`
  if (data.trial?.expired) return "Trial ended"
  return formatStatus(data.status)
}

function periodLabel(data: ReturnType<typeof useSubscription>["data"]) {
  if (!data) return "No billing period yet"
  if (data.trial?.active || data.trial?.expired) {
    return `${periodDate(data.trial.starts_at)} - ${periodDate(data.trial.ends_at)}`
  }
  return periodDate(data.subscription?.current_period_end ?? null)
}

function SegmentedControl({ value, onChange }: { value: "monthly" | "annual"; onChange: (value: "monthly" | "annual") => void }) {
  return (
    <div className="inline-flex rounded-md border border-[#E2E5EA] bg-[#F7F8FA] p-1">
      {(["monthly", "annual"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={[
            "rounded-[6px] px-4 py-1.5 text-[12.5px] font-semibold capitalize transition",
            value === option
              ? "bg-white text-[#101828] shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
              : "text-[#667085] hover:text-[#344054]",
          ].join(" ")}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function UsageStat({ label, used, limit }: { label: string; used: number; limit: number | string }) {
  return (
    <div className="flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-[13px] font-semibold text-[#101828]">{used}</span>
      <span className="text-[11.5px] text-[#98A2B3]">/ {limit} {label}</span>
    </div>
  )
}

function PromptPulseMark() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F9FAFB] ring-1 ring-[#EEF0F3]">
      <div className="flex h-5 items-end gap-[3px]">
        {[13, 18, 23].map((height) => (
          <span key={height} className="block w-[4px] -skew-y-[28deg] rounded-[2px] bg-[#101828]" style={{ height }} />
        ))}
      </div>
    </div>
  )
}

function FeatureRow({ feature }: { feature: PlanFeature }) {
  const included = feature.included !== false
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={[
          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
          included ? "bg-[#EDFAF1] text-[#067647]" : "bg-transparent text-[#C9CEDA]",
        ].join(" ")}
      >
        {included ? <Check size={12} strokeWidth={3} /> : <X size={13} strokeWidth={2.6} />}
      </span>
      <span className={["text-[13px] leading-5", included ? "text-[#344054]" : "text-[#98A2B3] line-through"].join(" ")}>
        {feature.label}
      </span>
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
  const displayedOldPrice = plan.oldPrice ? (billing === "annual" ? Math.round(plan.oldPrice * 0.8) : plan.oldPrice) : null
  const featured = plan.id === "GROWTH"

  return (
    <article
      className={[
        "subscription-plan-card relative flex flex-col rounded-lg border bg-white p-6 md:p-7",
        featured ? "border-[#101828]" : "border-[#E2E5EA]",
      ].join(" ")}
    >
      {featured && (
        <span className="absolute -top-3 left-6 rounded-full bg-[#101828] px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-white">
          Most popular
        </span>
      )}

      <PromptPulseMark />

      <div className="mb-6 mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[16px] font-semibold text-[#667085]">{plan.name}</h3>
          {plan.badge && (
            <span className="inline-flex items-center rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#3730A3]">
              {plan.badge}
            </span>
          )}
        </div>
        <p className="mt-1.5 min-h-[44px] text-[15px] leading-[1.4] text-[#344054]">{plan.tagline}</p>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-[36px] font-semibold leading-none tracking-[-0.03em] text-[#101828]">${displayedPrice}</span>
        <span className="pb-1 text-[18px] font-normal text-[#667085]">/mo</span>
        {displayedOldPrice && <span className="pb-1.5 text-[15px] font-normal text-[#98A2B3] line-through">${displayedOldPrice}/mo</span>}
      </div>
      <p className="mt-1.5 h-4 text-[11.5px] font-semibold text-[#98A2B3]">
        {billing === "annual" ? "Billed annually - 20% off" : "\u00A0"}
      </p>

      <button
        type="button"
        disabled={isCurrent || isLoading}
        onClick={() => onSelect(plan.id)}
        className={[
          "subscription-cta-btn mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md text-[13.5px] font-semibold transition disabled:cursor-not-allowed",
          isCurrent ? "border border-[#B7EFCF] bg-[#ECFDF3] text-[#067647]" : "bg-[#101828] text-white hover:bg-[#1D2939]",
        ].join(" ")}
      >
        {isLoading ? <Loader2 size={15} className="animate-spin" /> : isCurrent ? "Current plan" : "Try free for 14 days"}
        {!isCurrent && !isLoading && <ChevronRight size={14} />}
      </button>

      <div className="mt-5 space-y-2 border-t border-[#EEF0F3] pt-5">
        {plan.features.map((feature) => (
          <FeatureRow key={feature.label} feature={feature} />
        ))}
      </div>
    </article>
  )
}

function ValueCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#EDFAF1] text-[#067647]">
        <Check size={11} strokeWidth={3} />
      </span>
    )
  }
  if (value === false) {
    return <span className="mx-auto text-[13px] font-medium leading-none text-[#C9CEDA]">—</span>
  }
  return <span className="text-[13px] font-semibold text-[#101828]">{value}</span>
}

export function SubscriptionTab() {
  const { data, isLoading, error, checkoutPlan, startCheckout, refresh } = useSubscription()
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")
  const [refreshing, setRefreshing] = useState(false)
  const currentPlan = data?.plan ?? "FREE"

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
          Loading subscription...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <style>{`
        .subscription-plan-card {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 1px 2px rgba(16,24,40,0.04);
        }
        .subscription-plan-card:hover {
          border-color: #C9CEDA;
          box-shadow: 0 4px 14px -8px rgba(16,24,40,0.12);
        }
        .subscription-cta-btn {
          transition: background 0.12s ease;
        }
        .subscription-refresh-btn {
          transition: background 0.12s ease, border-color 0.12s ease;
        }
      `}</style>

      {/* ── Usage bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#E2E5EA] bg-white px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#F9FAFB] text-[#344054]">
            <CreditCard size={15} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#101828]">
              {planHeadline(data)} <span className="font-medium text-[#98A2B3]">- {planSubline(data)}</span>
            </p>
            <p className="text-[11.5px] text-[#98A2B3]">
              {data?.trial?.active || data?.trial?.expired ? "Trial period" : "Period ends"}: {periodLabel(data)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <UsageStat label="brands" used={data?.usage.project_count ?? 0} limit={data?.limits.projects ?? 0} />
          <UsageStat label="prompts" used={data?.usage.prompt_count ?? 0} limit={data?.limits.prompts ?? 0} />
          <UsageStat label="competitors" used={data?.usage.competitor_count ?? 0} limit={data?.limits.competitors ?? 0} />
          <UsageStat label="credits left" used={data?.usage.credits_remaining ?? 0} limit={data?.limits.credits ?? 0} />
          <UsageStat label="refreshes" used={data?.usage.monthly_runs_used ?? 0} limit={data?.limits.refreshes_per_week ?? 0} />
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className="subscription-refresh-btn flex h-7 items-center gap-1.5 rounded-md border border-[#D0D5DD] bg-white px-2.5 text-[11.5px] font-semibold text-[#344054] hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            <RefreshCcw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-[12.5px] font-medium text-[#B42318]">
          {error}
        </div>
      )}

      {/* ── Heading ── */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E5EA] bg-[#F9FAFB] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#475467]">
          <Zap size={11} />
          14-day free trial - launch pricing
        </div>
        <h1 className="max-w-[680px] text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#101828]">
          Choose the plan that fits your AI visibility motion.
        </h1>
        <p className="max-w-[600px] text-[13px] leading-5 text-[#667085]">
          Prompt monitoring is included in your plan. Credits cover reports, exports, and premium actions.
        </p>
        <SegmentedControl value={billing} onChange={setBilling} />
      </div>

      {/* ── Plan cards ── */}
      <div className="grid grid-cols-1 gap-4 pt-1 md:grid-cols-3">
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
      <section className="overflow-hidden rounded-lg border border-[#E2E5EA] bg-white">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-[#E7E9EC] bg-[#FBFBFC]">
          <div className="px-6 py-5">
            <p className="text-[12.5px] font-semibold text-[#101828]">Features</p>
            <p className="mt-1 text-[11.5px] text-[#98A2B3]">Compare plan capabilities</p>
          </div>
          {PLANS.map((plan) => (
            <div key={plan.id} className="px-6 py-5 text-center">
              <p className="text-[12.5px] font-semibold text-[#101828]">{plan.name}</p>
              <p className="mt-1 text-[12px] font-medium text-[#667085]">
                {plan.oldPrice && <span className="mr-1 text-[#98A2B3] line-through">${billing === "annual" ? Math.round(plan.oldPrice * 0.8) : plan.oldPrice}</span>}
                ${billing === "annual" ? Math.round(plan.price * 0.8) : plan.price}<span className="text-[#98A2B3]">/mo</span>
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
                  <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#101828]">{row.section}</p>
                </div>
                <div />
                <div />
                <div />
              </div>
            )}
            <div className="grid min-h-[56px] grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-[#E7E9EC] last:border-b-0">
              <div className="flex items-center px-6 text-[12.5px] font-medium text-[#667085]">
                <span>{row.label}</span>
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
      <section className="rounded-lg border border-[#E2E5EA] bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[#F9FAFB] text-[#344054]">
            <Sparkles size={16} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#101828]">Launch pricing with real usage limits</h3>
            <p className="mt-0.5 text-[12.5px] leading-5 text-[#667085]">
              We cover the core PromptPulse workflow today: monitoring, citations, source enrichment, competitors,
              exports, reports, action queue, and Sara. Credits are separate from prompt monitoring, so daily runs do not burn report credits.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

import { useState } from "react"
import { Check, ChevronRight, X, Zap } from "lucide-react"
import { Link } from "react-router-dom"
import { faviconUrl } from "@/lib/aiModels"

type PaidPlan = "STARTER" | "GROWTH" | "PRO"
type ModelKey = "chatgpt" | "gemini" | "perplexity" | "googleMode" | "copilot"
type PlanFeature = { label: string; included?: boolean }

function annualMonthlyPrice(monthlyPrice: number) {
    return (monthlyPrice * 0.8).toFixed(2).replace(/\.00$/, "")
}

const MODEL_CATALOG: Record<ModelKey, { name: string; domain: string }> = {
    chatgpt: { name: "ChatGPT", domain: "chatgpt.com" },
    gemini: { name: "Gemini", domain: "gemini.google.com" },
    perplexity: { name: "Perplexity", domain: "perplexity.ai" },
    googleMode: { name: "Google AI Mode", domain: "google.com" },
    copilot: { name: "Copilot", domain: "copilot.microsoft.com" },
}

const PLANS: Array<{
    id: PaidPlan
    name: string
    price: number
    oldPrice?: number
    tagline: string
    badge?: string
    models: ModelKey[]
    features: PlanFeature[]
}> = [
    {
        id: "STARTER",
        name: "Starter",
        price: 29,
        oldPrice: 49,
        tagline: "Essentials for one brand getting serious about AI visibility",
        models: ["chatgpt", "gemini", "perplexity"],
        features: [
            { label: "1 project" },
            { label: "20 prompts" },
            { label: "Up to 480 AI responses per month" },
            { label: "Twice a week refresh" },
            { label: "ChatGPT, Gemini, Perplexity" },
            { label: "5 tracked competitors" },
            { label: "Visibility, position, sentiment" },
            { label: "Sources, citations, and chat evidence" },
            { label: "30 monthly credits for reports and premium actions" },
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
        models: ["chatgpt", "gemini", "perplexity", "googleMode", "copilot"],
        features: [
            { label: "2 projects" },
            { label: "50 prompts" },
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
        models: ["chatgpt", "gemini", "perplexity", "googleMode", "copilot"],
        features: [
            { label: "5 projects" },
            { label: "125 prompts" },
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

const COMPARISON_ROWS: Array<{
    section?: string
    label: string
    values: Record<PaidPlan, string | boolean>
}> = [
    { section: "Monitoring", label: "Projects", values: { STARTER: "1", GROWTH: "2", PRO: "5" } },
    { label: "Tracked prompts", values: { STARTER: "20", GROWTH: "50", PRO: "125" } },
    { label: "Estimated AI responses / month", values: { STARTER: "480", GROWTH: "7,500", PRO: "18,750" } },
    { label: "Tracked competitors", values: { STARTER: "5", GROWTH: "12", PRO: "Unlimited" } },
    { label: "Refresh rate", values: { STARTER: "2x / week", GROWTH: "Daily", PRO: "Daily" } },
    { label: "14-day free trial", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Monthly credits for reports, exports, briefs, and premium AI actions", values: { STARTER: "30", GROWTH: "100", PRO: "275" } },
    { section: "AI Surfaces", label: "ChatGPT", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Gemini", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Perplexity", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Google AI Mode", values: { STARTER: false, GROWTH: true, PRO: true } },
    { label: "Microsoft Copilot", values: { STARTER: false, GROWTH: true, PRO: true } },
    { section: "Insights", label: "Visibility, position, sentiment", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Source intelligence", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Source enrichment", values: { STARTER: "Basic", GROWTH: true, PRO: "Advanced" } },
    { label: "Top sources and citations", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Chat evidence", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Competitor movement analysis", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "Opportunity engine", values: { STARTER: false, GROWTH: true, PRO: true } },
    { label: "Action queue", values: { STARTER: false, GROWTH: true, PRO: "Advanced" } },
    { label: "Sara assistant", values: { STARTER: "Core", GROWTH: "Strategy", PRO: "Advanced" } },
    { label: "GEO article briefs", values: { STARTER: false, GROWTH: true, PRO: "Advanced" } },
    { section: "Reports and support", label: "Weekly email reports", values: { STARTER: true, GROWTH: true, PRO: true } },
    { label: "CSV exports", values: { STARTER: false, GROWTH: true, PRO: true } },
    { label: "PDF exports", values: { STARTER: false, GROWTH: true, PRO: true } },
    { label: "Chat support", values: { STARTER: true, GROWTH: true, PRO: "Priority" } },
]

function ValueCell({ value }: { value: string | boolean }) {
    if (value === true) {
        return (
            <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#35b934] text-white">
                <Check size={11} strokeWidth={3} />
            </span>
        )
    }
    if (value === false) {
        return <span className="mx-auto text-[17px] font-medium leading-none text-[#ff4d4f]">x</span>
    }
    return <span className="text-[12.5px] font-semibold text-zinc-800">{value}</span>
}

function ModelBadge({ model }: { model: ModelKey }) {
    const item = MODEL_CATALOG[model]
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
            <img src={faviconUrl(item.domain, 64) ?? ""} alt="" className="h-3.5 w-3.5 rounded-[3px]" />
            {item.name}
        </span>
    )
}

function PromptPulseMark({ featured }: { featured: boolean }) {
    return (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/70 ring-1 ring-zinc-100">
            <div className="flex h-5 items-end gap-[3px]">
                {[13, 18, 23].map((height) => (
                <span
                    key={height}
                    className={[
                        "block w-[4px] -skew-y-[28deg] rounded-[2px]",
                        featured ? "bg-[#111111]" : "bg-[#111111]",
                    ].join(" ")}
                    style={{ height }}
                />
            ))}
            </div>
        </div>
    )
}

function PlanFeatureRow({ feature }: { feature: PlanFeature }) {
    const included = feature.included !== false
    return (
        <div className="flex items-start gap-2.5">
            <span
                className={[
                    "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
                    included ? "bg-[#35b934] text-white" : "bg-transparent text-[#ff4d4f]",
                ].join(" ")}
            >
                {included ? <Check size={12} strokeWidth={3} /> : <X size={13} strokeWidth={2.6} />}
            </span>
            <span className={["text-[13px] leading-5", included ? "text-zinc-700" : "text-zinc-400 line-through"].join(" ")}>
                {feature.label}
            </span>
        </div>
    )
}

export function Pricing() {
    const [billing, setBilling] = useState<"monthly" | "annual">("monthly")

    return (
        <section className="relative min-h-screen overflow-hidden bg-[#fbfbfa] px-4 py-16 sm:px-6 lg:px-8">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(24,24,27,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.045) 1px, transparent 1px)",
                    backgroundSize: "72px 72px",
                }}
            />

            <div className="mx-auto max-w-7xl">
                <div className="mb-10 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm">
                        <Zap size={11} className="text-zinc-800" />
                        <span className="text-[11.5px] font-semibold text-zinc-800">14-day free trial - launch pricing</span>
                    </div>
                    <h2 className="mx-auto max-w-3xl text-[34px] font-extrabold leading-[1.05] tracking-[-0.045em] text-zinc-950 md:text-[46px]">
                        Choose the plan that fits your AI visibility motion
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-[1.65] text-zinc-500">
                        Track prompts, competitors, sources, citations, reports, and action recommendations across the AI
                        surfaces PromptPulse supports today.
                    </p>
                    <p className="mx-auto mt-2 max-w-2xl text-[12.5px] leading-5 text-zinc-400">
                        Prompt monitoring is included in your plan limits. Credits are used for reports, exports, content briefs,
                        and premium AI actions.
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-3">
                        <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1">
                            {(["monthly", "annual"] as const).map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setBilling(opt)}
                                    className={[
                                        "rounded-full px-4 py-1.5 text-[12.5px] font-semibold capitalize transition-all",
                                        billing === opt
                                            ? "bg-white text-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.10)]"
                                            : "text-zinc-500 hover:text-zinc-700",
                                    ].join(" ")}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                        {billing === "annual" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                                Save 20%
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {PLANS.map((plan) => {
                        const price = billing === "annual" ? annualMonthlyPrice(plan.price) : String(plan.price)
                        const oldPrice = plan.oldPrice ? (billing === "annual" ? annualMonthlyPrice(plan.oldPrice) : String(plan.oldPrice)) : null
                        const featured = plan.id === "GROWTH"

                        return (
                            <div
                                key={plan.id}
                                className={[
                                    "relative flex flex-col rounded-[10px] border bg-white transition-all duration-300",
                                    featured
                                        ? "border-zinc-300 shadow-[0_28px_70px_-34px_rgba(15,23,42,0.55)] md:-translate-y-3"
                                        : "border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(15,23,42,0.18)]",
                                ].join(" ")}
                            >
                                <div className="relative z-10 flex flex-1 flex-col p-6 md:p-7">
                                    <PromptPulseMark featured={featured} />

                                    <div className="mb-6 mt-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-[16px] font-semibold text-zinc-500">{plan.name}</h3>
                                            {plan.badge && (
                                                <span className="inline-flex items-center rounded-full bg-[#2563ff] px-2.5 py-0.5 text-[12px] font-bold text-white">
                                                    {plan.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1.5 min-h-[44px] text-[16px] leading-[1.4] text-zinc-700">{plan.tagline}</p>
                                    </div>

                                    <div className="mb-1 flex items-end gap-2">
                                        <span className="text-[40px] font-medium leading-none tracking-[-0.055em] text-zinc-950">
                                            ${price}
                                        </span>
                                        <span className="pb-1.5 text-[21px] font-normal text-zinc-500">/mo</span>
                                        {oldPrice && (
                                            <span className="pb-2 text-[18px] font-normal text-zinc-400 line-through">${oldPrice}/mo</span>
                                        )}
                                    </div>
                                    <p className="mb-5 h-4 text-[11px] font-semibold text-zinc-400">
                                        {billing === "annual" ? "Billed annually - 20% off" : "\u00A0"}
                                    </p>

                                    <Link
                                        to={`/signup?plan=${plan.id.toLowerCase()}`}
                                        className="relative mb-5 flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-[7px] bg-[#191919] text-[14px] font-bold text-white transition-all hover:bg-black"
                                    >
                                        Try free for 14 days
                                        <ChevronRight size={15} />
                                        <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#2563EB] via-[#0EA5E9] to-[#14B8A6]" />
                                    </Link>

                                    <div className="mb-4 h-px bg-zinc-100" />

                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Models included</p>
                                    <div className="mb-4 flex flex-wrap gap-1.5">
                                        {plan.models.map((model) => (
                                            <ModelBadge key={model} model={model} />
                                        ))}
                                    </div>

                                    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">What's included</p>
                                    <div className="flex-1 space-y-2">
                                        {plan.features.map((feature) => (
                                            <PlanFeatureRow key={feature.label} feature={feature} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-14 md:mt-20">
                    <div className="mb-8 text-center">
                        <h3 className="text-[22px] font-bold tracking-[-0.03em] text-zinc-950">Compare plans</h3>
                        <p className="mt-2 text-[13.5px] text-zinc-500">Everything side-by-side so you can pick exactly what you need.</p>
                    </div>

                    <div className="space-y-3 md:hidden">
                        {COMPARISON_ROWS.map((row, index) => (
                            <div key={`${row.label}-mobile-${index}`}>
                                {row.section && (
                                    <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-widest text-zinc-400 first:mt-0">
                                        {row.section}
                                    </p>
                                )}
                                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                                    <p className="text-[13px] font-bold text-zinc-900">{row.label}</p>
                                    <div className="mt-3 space-y-2">
                                        {PLANS.map((plan) => (
                                            <div key={plan.id} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2">
                                                <span className="text-[12px] font-semibold text-zinc-500">{plan.name}</span>
                                                <ValueCell value={row.values[plan.id]} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:block">
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-zinc-100 bg-zinc-50/80">
                            <div className="px-6 py-5">
                                <p className="text-[12.5px] font-semibold text-zinc-950">Features</p>
                                <p className="mt-0.5 text-[11.5px] text-zinc-400">Compare plan capabilities</p>
                            </div>
                            {PLANS.map((plan) => (
                                <div key={plan.id} className="px-6 py-5 text-center">
                                    <p className="text-[13px] font-bold text-zinc-950">{plan.name}</p>
                                    <p className="mt-1 text-[12px] font-medium text-zinc-400">
                                        {plan.oldPrice && (
                                            <span className="mr-1 text-zinc-300 line-through">
                                                ${billing === "annual" ? annualMonthlyPrice(plan.oldPrice) : plan.oldPrice}
                                            </span>
                                        )}
                                        ${billing === "annual" ? annualMonthlyPrice(plan.price) : plan.price}
                                        <span className="text-zinc-300">/mo</span>
                                    </p>
                                </div>
                            ))}
                        </div>

                        {COMPARISON_ROWS.map((row, index) => (
                            <div key={`${row.label}-${index}`}>
                                {row.section && (
                                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-zinc-100 bg-zinc-50">
                                        <div className="col-span-4 px-6 py-3">
                                            <p className="text-[11.5px] font-bold uppercase tracking-widest text-zinc-400">{row.section}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="grid min-h-[52px] grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-zinc-100 transition-colors last:border-b-0 hover:bg-zinc-50/60">
                                    <div className="flex items-center px-6 text-[12.5px] font-medium text-zinc-600">{row.label}</div>
                                    {PLANS.map((plan) => (
                                        <div key={plan.id} className="flex items-center justify-center px-4 text-center">
                                            <ValueCell value={row.values[plan.id]} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

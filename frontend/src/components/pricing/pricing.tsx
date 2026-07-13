import { useState } from "react"
import { Check, ChevronRight, X, Zap } from "lucide-react"
import { Link } from "react-router-dom"

type PaidPlan = "STARTER" | "GROWTH" | "PRO"
type ModelKey = "chatgpt" | "gemini" | "perplexity" | "googleOverview" | "googleMode" | "copilot"

const MODEL_CATALOG: Record<ModelKey, { name: string; domain: string }> = {
    chatgpt: { name: "ChatGPT", domain: "chatgpt.com" },
    gemini: { name: "Gemini", domain: "gemini.google.com" },
    perplexity: { name: "Perplexity", domain: "perplexity.ai" },
    googleOverview: { name: "Google AI Overview", domain: "google.com" },
    googleMode: { name: "Google AI Mode", domain: "google.com" },
    copilot: { name: "Copilot", domain: "microsoft.com" },
}

const PLANS: Array<{
    id: PaidPlan
    name: string
    price: number
    tagline: string
    badge?: string
    models: ModelKey[]
    features: string[]
}> = [
        {
            id: "STARTER",
            name: "Starter",
            price: 29,
            tagline: "For validating one brand in AI search.",
            models: ["chatgpt", "gemini", "perplexity"],
            features: [
                "1 brand workspace",
                "20 tracked prompts",
                "3 tracked competitors",
                "2 refreshes per week",
                "Visibility, position, sentiment",
                "Top sources and chat evidence",
                "Agent workspace",
                "Weekly email report",
                "Chat support",
            ],
        },
        {
            id: "GROWTH",
            name: "Growth",
            price: 39,
            tagline: "Best for serious founders and growing teams.",
            badge: "Most popular",
            models: ["chatgpt", "gemini", "perplexity", "googleOverview", "googleMode", "copilot"],
            features: [
                "2 brand workspaces",
                "50 tracked prompts",
                "6 tracked competitors",
                "Daily refresh",
                "Agent workspace",
                "Opportunity engine",
                "GEO article briefs",
                "CSV and PDF exports",
                "Weekly email report",
            ],
        },
        {
            id: "PRO",
            name: "Pro",
            price: 99,
            tagline: "For teams tracking more markets and competitors.",
            models: ["chatgpt", "gemini", "perplexity", "googleOverview", "googleMode", "copilot"],
            features: [
                "5 brand workspaces",
                "125 tracked prompts",
                "15 tracked competitors",
                "Daily refresh",
                "Advanced agent workspace",
                "Advanced opportunity analysis",
                "Advanced GEO article briefs",
                "Advanced exports",
                "Priority chat support",
            ],
        },
    ]

const COMPARISON_ROWS: Array<{
    section?: string
    label: string
    values: Record<PaidPlan, string | boolean>
}> = [
        { section: "Monitoring", label: "Brands / projects", values: { STARTER: "1", GROWTH: "2", PRO: "5" } },
        { label: "Tracked prompts", values: { STARTER: "20", GROWTH: "50", PRO: "125" } },
        { label: "Tracked competitors", values: { STARTER: "3", GROWTH: "6", PRO: "15" } },
        { label: "Refresh rate", values: { STARTER: "2x / week", GROWTH: "Daily", PRO: "Daily" } },
        { label: "Agent workspace", values: { STARTER: "Basic", GROWTH: true, PRO: "Advanced" } },
        { section: "AI Surfaces", label: "ChatGPT", values: { STARTER: true, GROWTH: true, PRO: true } },
        { label: "Gemini", values: { STARTER: true, GROWTH: true, PRO: true } },
        { label: "Perplexity", values: { STARTER: true, GROWTH: true, PRO: true } },
        { label: "Google AI Overview", values: { STARTER: false, GROWTH: true, PRO: true } },
        { label: "Google AI Mode", values: { STARTER: false, GROWTH: true, PRO: true } },
        { label: "Microsoft Copilot", values: { STARTER: false, GROWTH: true, PRO: true } },
        { section: "Insights", label: "Visibility, position, sentiment", values: { STARTER: true, GROWTH: true, PRO: true } },
        { label: "Source intelligence", values: { STARTER: true, GROWTH: true, PRO: true } },
        { label: "Top sources", values: { STARTER: true, GROWTH: true, PRO: true } },
        { label: "Chat evidence", values: { STARTER: true, GROWTH: true, PRO: true } },
        { label: "Competitor movement analysis", values: { STARTER: true, GROWTH: true, PRO: true } },
        { label: "Opportunity engine", values: { STARTER: false, GROWTH: true, PRO: true } },
        { label: "GEO article briefs", values: { STARTER: false, GROWTH: true, PRO: "Advanced" } },
        { section: "Reports & Support", label: "Weekly email reports", values: { STARTER: true, GROWTH: true, PRO: true } },
        { label: "CSV exports", values: { STARTER: false, GROWTH: true, PRO: true } },
        { label: "PDF exports", values: { STARTER: false, GROWTH: true, PRO: true } },
        { label: "Chat support", values: { STARTER: true, GROWTH: true, PRO: "Priority" } },
    ]

function ValueCell({ value }: { value: string | boolean }) {
    if (value === true) {
        return (
            <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                <Check size={11} strokeWidth={3} />
            </span>
        )
    }
    if (value === false) {
        return (
            <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                <X size={10} strokeWidth={2.5} />
            </span>
        )
    }
    return <span className="text-[12.5px] font-semibold text-zinc-800">{value}</span>
}

function ModelBadge({ model, featured }: { model: ModelKey; featured: boolean }) {
    const item = MODEL_CATALOG[model]
    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                featured
                    ? "border-white/10 bg-white/[0.08] text-zinc-200"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700",
            ].join(" ")}
        >
            <img
                src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=32`}
                alt=""
                className="h-3.5 w-3.5 rounded-[3px]"
            />
            {item.name}
        </span>
    )
}

export function Pricing() {
    const [billing, setBilling] = useState<"monthly" | "annual">("monthly")

    return (
        <section className="relative min-h-screen overflow-hidden bg-white px-4 py-24 sm:px-6 lg:px-8">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(24,24,27,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.035) 1px, transparent 1px)",
                    backgroundSize: "72px 72px",
                }}
            />

            <div className="mx-auto max-w-7xl">
                <div className="mb-14 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm">
                        <Zap size={11} className="text-zinc-800" />
                        <span className="text-[11.5px] font-semibold text-zinc-800">Transparent Pricing</span>
                    </div>
                    <h2 className="mx-auto max-w-2xl text-[34px] font-extrabold leading-[1.08] tracking-[-0.04em] text-zinc-950 md:text-[44px]">
                        Simple plans for AI visibility
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.7] text-zinc-500">
                        Starter covers ChatGPT, Gemini, and Perplexity. Growth and Pro add Google AI Overview,
                        Google AI Mode, and Microsoft Copilot.
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-3">
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

                <div className="grid gap-6 md:grid-cols-3">
                    {PLANS.map((plan) => {
                        const price = billing === "annual" ? Math.round(plan.price * 0.8) : plan.price
                        const featured = plan.id === "GROWTH"

                        return (
                            <div
                                key={plan.id}
                                className={[
                                    "relative flex flex-col rounded-2xl transition-all duration-300",
                                    featured
                                        ? "border border-zinc-800 bg-[#0f0f10] text-white shadow-[0_32px_80px_-24px_rgba(15,23,42,0.65)] md:-translate-y-3"
                                        : "border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(15,23,42,0.18)]",
                                ].join(" ")}
                            >
                                {featured && plan.badge && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest text-zinc-950 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.7)]">
                                            <Zap size={9} />
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}

                                <div className="relative z-10 flex flex-1 flex-col p-7">
                                    <div className="mb-5">
                                        <h3 className={`text-[17px] font-bold ${featured ? "text-white" : "text-zinc-950"}`}>
                                            {plan.name}
                                        </h3>
                                        <p className={`mt-1.5 text-[13px] leading-relaxed ${featured ? "text-zinc-400" : "text-zinc-500"}`}>
                                            {plan.tagline}
                                        </p>
                                    </div>

                                    <div className="mb-1 flex items-end gap-1">
                                        <span className={`text-[42px] font-extrabold leading-none tracking-tight ${featured ? "text-white" : "text-zinc-950"}`}>
                                            ${price}
                                        </span>
                                        <span className={`pb-1.5 text-[13px] font-medium ${featured ? "text-zinc-500" : "text-zinc-400"}`}>
                                            /mo
                                        </span>
                                    </div>
                                    <p className="mb-5 h-4 text-[11px] font-semibold text-zinc-400">
                                        {billing === "annual" ? "Billed annually · 20% off" : "\u00A0"}
                                    </p>

                                    <Link
                                        to={`/signup?plan=${plan.id.toLowerCase()}`}
                                        className={[
                                            "mb-6 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg text-[13px] font-bold transition-all",
                                            featured
                                                ? "bg-white text-zinc-950 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.65)] hover:bg-zinc-100"
                                                : "border border-zinc-200 bg-white text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-zinc-300 hover:bg-zinc-50",
                                        ].join(" ")}
                                    >
                                        Get started
                                        <ChevronRight size={14} />
                                    </Link>

                                    <div className={`mb-5 h-px ${featured ? "bg-zinc-800" : "bg-zinc-100"}`} />

                                    <p className={`mb-2.5 text-[10.5px] font-bold uppercase tracking-widest ${featured ? "text-zinc-500" : "text-zinc-400"}`}>
                                        Models included
                                    </p>
                                    <div className="mb-5 flex flex-wrap gap-1.5">
                                        {plan.models.map((model) => (
                                            <ModelBadge key={model} model={model} featured={featured} />
                                        ))}
                                    </div>

                                    <p className={`mb-3.5 text-[10.5px] font-bold uppercase tracking-widest ${featured ? "text-zinc-500" : "text-zinc-400"}`}>
                                        What&apos;s included
                                    </p>

                                    <div className="flex-1 space-y-2.5">
                                        {plan.features.map((feature) => (
                                            <div key={feature} className="flex items-center gap-2.5">
                                                <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${featured ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-700"}`}>
                                                    <Check size={10} strokeWidth={3} />
                                                </span>
                                                <span className={`text-[13px] ${featured ? "text-zinc-300" : "text-zinc-600"}`}>
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-20">
                    <div className="mb-8 text-center">
                        <h3 className="text-[22px] font-bold tracking-[-0.03em] text-zinc-950">Compare plans</h3>
                        <p className="mt-2 text-[13.5px] text-zinc-500">Everything side-by-side so you can pick exactly what you need.</p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-zinc-100 bg-zinc-50/80">
                            <div className="px-6 py-5">
                                <p className="text-[12.5px] font-semibold text-zinc-950">Features</p>
                                <p className="mt-0.5 text-[11.5px] text-zinc-400">Compare plan capabilities</p>
                            </div>
                            {PLANS.map((plan) => (
                                <div key={plan.id} className="px-6 py-5 text-center">
                                    <p className="text-[13px] font-bold text-zinc-950">{plan.name}</p>
                                    <p className="mt-1 text-[12px] font-medium text-zinc-400">
                                        ${billing === "annual" ? Math.round(plan.price * 0.8) : plan.price}
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
                                    <div className="flex items-center px-6 text-[12.5px] font-medium text-zinc-600">
                                        {row.label}
                                    </div>
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

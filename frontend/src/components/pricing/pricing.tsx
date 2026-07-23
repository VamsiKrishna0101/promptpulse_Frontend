import { useEffect, useState } from "react"
import { Check, ChevronRight, X, Zap } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

type PaidPlan = "STARTER" | "GROWTH" | "PRO"
type ModelKey = "chatgpt" | "gemini" | "perplexity" | "googleMode" | "copilot"

type CreateOrderResponse = {
  razorpay_order_id: string
  amount_inr_paise: number
  credits_to_award: number
  key_id: string
  plan?: PaidPlan | null
}

declare global {
  interface Window {
    Razorpay?: new (options: object) => {
      open(): void
      on(event: "payment.failed", handler: (response: { error?: { description?: string; reason?: string } }) => void): void
    }
  }
}

function useRazorpayScript() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (document.getElementById("razorpay-script")) { setLoaded(true); return }
    const script = document.createElement("script")
    script.id = "razorpay-script"
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => setLoaded(true)
    document.body.appendChild(script)
  }, [])

  return loaded
}

const RAZORPAY_PAYMENT_DISPLAY_CONFIG = {
  display: {
    blocks: {
      upi: {
        name: "Pay with UPI",
        instruments: [
          { method: "upi" },
        ],
      },
      cards: {
        name: "Cards",
        instruments: [
          { method: "card" },
        ],
      },
    },
    sequence: ["block.upi", "block.cards", "netbanking", "wallet"],
    preferences: {
      show_default_blocks: true,
    },
  },
}

const MODEL_CATALOG: Record<ModelKey, { name: string; domain: string }> = {
  chatgpt: { name: "ChatGPT", domain: "chatgpt.com" },
  gemini: { name: "Gemini", domain: "gemini.google.com" },
  perplexity: { name: "Perplexity", domain: "perplexity.ai" },
  googleMode: { name: "Google AI Mode", domain: "google.com" },
  copilot: { name: "Copilot", domain: "microsoft.com" },
}

const PLANS: Array<{
  id: PaidPlan
  name: string
  price: number
  tagline: string
  badge?: string
  baseCredits: number
  bonusCredits: number
  models: ModelKey[]
  features: string[]
}> = [
  {
    id: "STARTER",
    name: "Starter",
    price: 2499,
    tagline: "For validating one brand in AI search.",
    baseCredits: 2250,
    bonusCredits: 0,
    models: ["chatgpt", "gemini", "perplexity", "googleMode", "copilot"],
    features: [
      "1 brand workspace",
      "15 tracked prompts",
      "3 tracked competitors",
      "Daily tracking",
      "All dashboards and visibility insights",
      "Source intelligence and chat evidence",
      "Competitor analysis and gap discovery",
      "Web analytics and crawler analytics",
      "Sara assistant and AI Workspace",
      "Opportunity engine and action queue",
      "GEO article briefs and Reddit Intelligence",
      "AI visibility reports and weekly reports",
      "CSV, PDF, and client-ready exports",
      "Internal MCP context and tools",
    ],
  },
  {
    id: "GROWTH",
    name: "Growth",
    price: 4999,
    tagline: "Best for serious founders and growing teams.",
    badge: "Most popular",
    baseCredits: 4500,
    bonusCredits: 500,
    models: ["chatgpt", "gemini", "perplexity", "googleMode", "copilot"],
    features: [
      "2 brand workspaces",
      "30 tracked prompts",
      "6 tracked competitors",
      "Daily tracking",
      "All dashboards and visibility insights",
      "Source intelligence and chat evidence",
      "Competitor analysis and gap discovery",
      "Web analytics and crawler analytics",
      "Sara assistant and AI Workspace",
      "Opportunity engine and action queue",
      "GEO article briefs and Reddit Intelligence",
      "AI visibility reports and weekly reports",
      "CSV, PDF, and client-ready exports",
      "Internal MCP context and tools",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 9999,
    tagline: "For teams tracking more markets and AI surfaces.",
    baseCredits: 11250,
    bonusCredits: 1750,
    models: ["chatgpt", "gemini", "perplexity", "googleMode", "copilot"],
    features: [
      "5 brand workspaces",
      "75 tracked prompts",
      "15 tracked competitors",
      "Daily tracking",
      "All dashboards and visibility insights",
      "Source intelligence and chat evidence",
      "Competitor analysis and gap discovery",
      "Web analytics and crawler analytics",
      "Sara assistant and AI Workspace",
      "Opportunity engine and action queue",
      "GEO article briefs and Reddit Intelligence",
      "AI visibility reports and weekly reports",
      "CSV, PDF, and client-ready exports",
      "Internal MCP context and tools",
    ],
  },
]

const COMPARISON_ROWS: Array<{
  section?: string
  label: string
  values: Record<PaidPlan, string | boolean>
}> = [
  { section: "Tracking capacity", label: "Included monthly credits", values: { STARTER: "2,250", GROWTH: "4,500", PRO: "11,250" } },
  { label: "Plan bonus credits", values: { STARTER: "-", GROWTH: "+500", PRO: "+1,750" } },
  { label: "Total monthly wallet added", values: { STARTER: "2,250", GROWTH: "5,000", PRO: "13,000" } },
  { label: "Brand workspaces", values: { STARTER: "1", GROWTH: "2", PRO: "5" } },
  { label: "Tracked prompts", values: { STARTER: "15", GROWTH: "30", PRO: "75" } },
  { label: "Tracked competitors", values: { STARTER: "3", GROWTH: "6", PRO: "15" } },
  { label: "Tracking schedule", values: { STARTER: "Daily", GROWTH: "Daily", PRO: "Daily" } },
  { section: "AI surfaces", label: "ChatGPT", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "Gemini", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "Perplexity", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "Google AI Mode", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "Microsoft Copilot", values: { STARTER: true, GROWTH: true, PRO: true } },
  { section: "Insights and reports", label: "Visibility, position, sentiment", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "Source intelligence and chat evidence", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "Competitor movement analysis", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "Sara workspace", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "AI visibility reports", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "Opportunity engine and action queue", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "GEO article briefs and Reddit Intelligence", values: { STARTER: true, GROWTH: true, PRO: true } },
  { section: "Exports and support", label: "CSV and PDF exports", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "Weekly email reports", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "Internal MCP context and tools", values: { STARTER: true, GROWTH: true, PRO: true } },
  { label: "Support", values: { STARTER: "Included", GROWTH: "Included", PRO: "Included" } },
]

function ValueCell({ value }: { value: string | boolean }) {
  if (value === true) return <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"><Check size={11} strokeWidth={3} /></span>
  if (value === false) return <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-400"><X size={10} strokeWidth={2.5} /></span>
  return <span className="text-[12.5px] font-semibold text-zinc-800">{value}</span>
}

function ModelBadge({ model, featured }: { model: ModelKey; featured: boolean }) {
  const item = MODEL_CATALOG[model]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${featured ? "border-white/10 bg-white/[0.08] text-zinc-200" : "border-zinc-200 bg-zinc-50 text-zinc-700"}`}>
      <img src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=32`} alt="" className="h-3.5 w-3.5 rounded-[3px]" />
      {item.name}
    </span>
  )
}

export function Pricing() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const razorpayReady = useRazorpayScript()
  const [purchaseLoading, setPurchaseLoading] = useState<PaidPlan | null>(null)

  async function handlePlanPurchase(plan: PaidPlan) {
    if (!isAuthenticated) {
      navigate(`/signup?plan=${plan.toLowerCase()}`)
      return
    }

    if (!razorpayReady || !window.Razorpay) {
      alert("Razorpay is still loading. Please wait a moment.")
      return
    }

    setPurchaseLoading(plan)
    try {
      const { data } = await api.post<CreateOrderResponse>("/payments/razorpay/create-order", { plan_id: plan })
      const options = {
        key: data.key_id,
        amount: data.amount_inr_paise,
        currency: "INR",
        name: "PromptPulse",
        description: `${data.credits_to_award.toLocaleString("en-IN")} monthly credits`,
        order_id: data.razorpay_order_id,
        prefill: { email: user?.email },
        theme: { color: "#0f172a" },
        config: RAZORPAY_PAYMENT_DISPLAY_CONFIG,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verified = await api.post<{ credits_awarded: number; new_balance: number; plan?: PaidPlan | null }>("/payments/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            const rawUser = localStorage.getItem("promptpulse_user")
            if (rawUser) {
              localStorage.setItem("promptpulse_user", JSON.stringify({
                ...JSON.parse(rawUser),
                plan: verified.data.plan ?? plan,
                effective_plan: verified.data.plan ?? plan,
                credits_balance: verified.data.new_balance,
              }))
            }
            window.dispatchEvent(new Event("credits:changed"))
            alert(`${plan} activated. ${verified.data.new_balance.toLocaleString("en-IN")} credits are now in your wallet.`)
          } catch (error) {
            console.error("Payment verification failed", error)
            alert("Payment succeeded, but verification failed. Please contact support with your payment ID.")
          } finally {
            setPurchaseLoading(null)
          }
        },
        modal: {
          ondismiss: () => setPurchaseLoading(null),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", (response) => {
        const message = response.error?.description || response.error?.reason || "Payment failed. Please try again."
        alert(message)
        setPurchaseLoading(null)
      })
      rzp.open()
    } catch (error) {
      console.error("Plan purchase failed", error)
      alert("Failed to start payment. Please try again.")
      setPurchaseLoading(null)
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: "linear-gradient(to right, rgba(24,24,27,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.035) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm"><Zap size={11} className="text-zinc-800" /><span className="text-[11.5px] font-semibold text-zinc-800">Transparent pricing</span></div>
          <h2 className="mx-auto max-w-2xl text-[34px] font-extrabold leading-[1.08] tracking-[-0.04em] text-zinc-950 md:text-[44px]">Simple plans for AI visibility</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.7] text-zinc-500">Track your brand every day across the AI surfaces that matter. Every paid plan includes the complete PromptPulse product—features never disappear behind a tier; only capacity changes.</p>
          <div className="mx-auto mt-5 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200">7-day trial · 5 prompts · 3 engines · 2 AI reports</div>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const featured = plan.id === "GROWTH"
            return (
              <article key={plan.id} className={`relative flex flex-col rounded-[10px] bg-white transition-all duration-300 ${featured ? "border-2 border-blue-600 shadow-[0_12px_28px_-18px_rgba(37,99,235,0.45)]" : "border border-zinc-200 shadow-[0_2px_8px_rgba(15,23,42,0.05)] hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(15,23,42,0.14)]"}`}>
                {featured && <div className="absolute -top-3.5 right-5"><span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-[10.5px] font-bold text-white shadow-sm">{plan.badge}</span></div>}
                <div className="relative z-10 flex flex-1 flex-col p-7">
                  <div className="mb-5 flex items-start gap-3"><div className="flex h-7 w-7 items-end gap-[2px] pt-1" aria-hidden="true">{[11, 16, 21].map((height) => <span key={height} className="block w-[5px] -skew-y-[28deg] rounded-[2px] bg-zinc-950" style={{ height }} />)}</div><div><h3 className="text-[17px] font-bold text-zinc-900">{plan.name}</h3><p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">{plan.tagline}</p></div></div>
                  <div className="mb-1 flex items-end gap-1"><span className="text-[42px] font-extrabold leading-none tracking-tight text-zinc-950">₹{plan.price.toLocaleString("en-IN")}</span><span className="pb-1.5 text-[13px] font-medium text-zinc-400">/mo</span></div>
                  {plan.bonusCredits > 0 ? (
                    <div className="mb-5">
                      <p className="text-[22px] font-extrabold leading-none tracking-tight text-zinc-950">
                        {plan.baseCredits.toLocaleString("en-IN")}
                        <span className="mx-1 text-[18px] text-zinc-300">+</span>
                        <span className="text-emerald-600">{plan.bonusCredits.toLocaleString("en-IN")}</span>
                        <span className="ml-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">bonus</span>
                      </p>
                      <p className="mt-1.5 text-[12px] font-semibold text-zinc-500">
                        = {(plan.baseCredits + plan.bonusCredits).toLocaleString("en-IN")} total credits / month
                      </p>
                    </div>
                  ) : (
                    <p className="mb-5 inline-flex w-fit rounded-full bg-zinc-50 px-2.5 py-1 text-[11px] font-bold text-zinc-500 ring-1 ring-zinc-200">
                      {plan.baseCredits.toLocaleString("en-IN")} included credits
                    </p>
                  )}
                  <button type="button" onClick={() => void handlePlanPurchase(plan.id)} disabled={purchaseLoading !== null} className="mb-6 flex h-11 w-full items-center justify-center gap-1.5 rounded-md border-b-4 border-b-sky-300 bg-[#191919] text-[13px] font-bold text-white shadow-[0_5px_14px_rgba(56,189,248,0.35)] transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60">
                    {purchaseLoading === plan.id ? "Opening checkout..." : isAuthenticated ? `Buy ${plan.name}` : "Start free trial"} <ChevronRight size={14} />
                  </button>
                  <div className="mb-5 h-px bg-zinc-100" />
                  <p className="mb-2.5 text-[10.5px] font-bold uppercase tracking-widest text-zinc-400">AI surfaces included</p>
                  <div className="mb-5 flex flex-wrap gap-1.5">{plan.models.map((model) => <ModelBadge key={model} model={model} featured={false} />)}</div>
                  <p className="mb-3.5 text-[10.5px] font-bold uppercase tracking-widest text-zinc-400">What&apos;s included</p>
                  <div className="flex-1 space-y-2.5">{plan.features.map((feature) => <div key={feature} className="flex items-center gap-2.5"><span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-[0_0_0_2px_rgba(34,197,94,0.08)]"><Check size={10} strokeWidth={3.5} /></span><span className="text-[13px] text-zinc-700">{feature}</span></div>)}</div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-16 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">For agencies and growing teams</p><h3 className="mt-2 text-[22px] font-bold tracking-[-0.03em] text-zinc-950">One shared PAYG wallet when you need more capacity.</h3><p className="mt-2 max-w-2xl text-[13.5px] leading-6 text-zinc-500">Top up any amount from 1,000 credits and use the balance across client workspaces. Failed provider requests and retries are never charged.</p></div><Link to="/signup" className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-zinc-950 px-5 py-3 text-[13px] font-bold text-white hover:bg-zinc-800">Explore PAYG <ChevronRight size={14} /></Link></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-zinc-200 bg-white p-4"><p className="text-lg font-bold text-zinc-950">1,000</p><p className="mt-1 text-[12px] text-zinc-500">minimum custom top-up</p></div><div className="rounded-xl border border-zinc-200 bg-white p-4"><p className="text-lg font-bold text-zinc-950">₹0.999</p><p className="mt-1 text-[12px] text-zinc-500">custom price per credit</p></div><div className="rounded-xl border border-zinc-200 bg-white p-4"><p className="text-lg font-bold text-zinc-950">1 credit</p><p className="mt-1 text-[12px] text-zinc-500">per successful prompt × engine</p></div></div></div>

        <div className="mt-24"><div className="mb-8 text-center"><div className="mx-auto mb-3 h-1 w-10 rounded-full bg-sky-300 shadow-[0_0_16px_rgba(125,211,252,0.7)]" /><h3 className="text-[24px] font-bold tracking-[-0.035em] text-zinc-950">Compare plans</h3><p className="mt-2 text-[13.5px] text-zinc-500">Everything side-by-side so you can pick the right tracking capacity.</p></div><div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_22px_70px_-38px_rgba(15,23,42,0.28)]"><div className="overflow-x-auto"><div className="min-w-[720px]"><div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] border-b border-zinc-700 bg-[#111827]"><div className="px-6 py-5"><p className="text-[12.5px] font-semibold text-white">Features</p><p className="mt-0.5 text-[11.5px] text-slate-400">Compare plan capabilities</p></div>{PLANS.map((plan) => <div key={plan.id} className={`px-6 py-5 text-center ${plan.id === "GROWTH" ? "bg-white/[0.06]" : ""}`}><p className="text-[13px] font-bold text-white">{plan.name}</p><p className="mt-1 text-[12px] font-medium text-slate-400">₹{plan.price.toLocaleString("en-IN")}<span className="text-slate-500">/mo</span></p></div>)}</div>{COMPARISON_ROWS.map((row, index) => <div key={`${row.label}-${index}`}>{row.section && <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] border-b border-sky-100 bg-sky-50/70"><div className="col-span-4 px-6 py-3"><p className="text-[11.5px] font-bold uppercase tracking-widest text-sky-700">{row.section}</p></div></div>}<div className="grid min-h-[52px] grid-cols-[1.6fr_1fr_1fr_1fr] border-b border-zinc-100 last:border-b-0 odd:bg-zinc-50/35 hover:bg-sky-50/40"><div className="flex items-center px-6 text-[12.5px] font-medium text-zinc-700">{row.label}</div>{PLANS.map((plan) => <div key={plan.id} className={`flex items-center justify-center px-4 text-center ${plan.id === "GROWTH" ? "bg-sky-50/25" : ""}`}><ValueCell value={row.values[plan.id]} /></div>)}</div></div>)}</div></div></div></div>

        <div className="mt-16 text-center"><h3 className="text-[22px] font-bold tracking-[-0.03em] text-zinc-950">Try the full product before you pay.</h3><p className="mt-2 text-[13.5px] text-zinc-500">7 days · 5 prompts · 3 engines · 2 AI reports · limited Sara access.</p><Link to="/signup" className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-5 py-3 text-[13px] font-bold text-white hover:bg-zinc-800">Start free trial <ChevronRight size={14} /></Link></div>
      </div>
    </section>
  )
}

export const PricingSection = Pricing

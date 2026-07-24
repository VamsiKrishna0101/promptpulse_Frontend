import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

// ── Types ─────────────────────────────────────────────────────────────────────

type CreditPack = {
  id: string
  label: string
  amount_inr: number
  credits: number
  bonus_credits: number
}

type PaidPlan = "STARTER" | "GROWTH" | "PRO"

const CREDIT_PLANS: Array<{ id: PaidPlan; name: string; amount_inr: number; baseCredits: number; bonus: number; detail: string; expiry: string }> = [
  { id: "STARTER", name: "Starter", amount_inr: 2499, baseCredits: 2250, bonus: 0, detail: "For validating one brand", expiry: "Included credits reset each month" },
  { id: "GROWTH", name: "Growth", amount_inr: 4999, baseCredits: 4500, bonus: 500, detail: "Best-value monthly bundle", expiry: "Unused included credits roll over" },
  { id: "PRO", name: "Pro", amount_inr: 9999, baseCredits: 11250, bonus: 1750, detail: "For higher-capacity teams", expiry: "Unused included credits roll over" },
]

type Transaction = {
  id: string
  amount: number
  action: string
  description: string | null
  metadata?: {
    run_id?: string
    batch_id?: string
    source?: string
    successful_checks?: number
    engines?: string[]
  } | null
  created_at: string
}

type BalanceResponse = {
  credits_balance: number
  low_balance: boolean
}

type CreateOrderResponse = {
  razorpay_order_id: string
  amount_inr_paise: number
  credits_to_award: number
  key_id: string
  pack: CreditPack
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

// ── Razorpay Script Loader ────────────────────────────────────────────────────

function useRazorpayScript() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (document.getElementById("razorpay-script")) { setLoaded(true); return }
    const script = document.createElement("script")
    script.id  = "razorpay-script"
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => setLoaded(true)
    document.body.appendChild(script)
  }, [])

  return loaded
}

// ── Billing Tab ───────────────────────────────────────────────────────────────

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

export function BillingTab() {
  const { user } = useAuth()
  const razorpayReady = useRazorpayScript()

  const [balance, setBalance]           = useState<BalanceResponse | null>(null)
  const [packs, setPacks]               = useState<CreditPack[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [deductions, setDeductions]     = useState<Transaction[]>([])
  const [total, setTotal]               = useState(0)
  const [deductionTotal, setDeductionTotal] = useState(0)
  const [page, setPage]                 = useState(1)
  const [loading, setLoading]           = useState(true)
  const [loadError, setLoadError]       = useState<string | null>(null)
  const [creditsModalOpen, setCreditsModalOpen] = useState(false)
  const [deductionsLoading, setDeductionsLoading] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)
  const [customCredits, setCustomCredits] = useState("1000")
  const [activePlan, setActivePlan] = useState<PaidPlan | null>(() => {
    const plan = user?.effective_plan ?? user?.plan
    return plan === "STARTER" || plan === "GROWTH" || plan === "PRO" ? plan : null
  })

  useEffect(() => {
    const plan = user?.effective_plan ?? user?.plan
    if (plan === "STARTER" || plan === "GROWTH" || plan === "PRO") setActivePlan(plan)
  }, [user?.effective_plan, user?.plan])

  const fetchBalance = useCallback(async () => {
    const res = await api.get<BalanceResponse>("/payments/balance")
    setBalance(res.data)
  }, [])

  const fetchTransactions = useCallback(async (p = 1) => {
    const res = await api.get<{ transactions: Transaction[]; total: number }>(`/payments/transactions?page=${p}&limit=20`)
    setTransactions(res.data.transactions ?? [])
    setTotal(res.data.total ?? 0)
    setPage(p)
  }, [])

  const fetchDeductions = useCallback(async () => {
    setDeductionsLoading(true)
    try {
      const res = await api.get<{ transactions: Transaction[]; total: number }>("/payments/transactions?days=30&type=debit&page=1&limit=100")
      setDeductions(res.data.transactions ?? [])
      setDeductionTotal(res.data.total ?? 0)
    } finally {
      setDeductionsLoading(false)
    }
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      setLoadError(null)
      try {
        await Promise.all([
          fetchBalance(),
          api.get<{ packs: CreditPack[] }>("/payments/packs").then(r => setPacks(r.data.packs ?? [])),
          fetchTransactions(1),
        ])
      } catch (error) {
        console.error("Billing data failed to load", error)
        setLoadError("Billing routes are not available on this backend deployment yet. Please redeploy the latest backend image.")
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [fetchBalance, fetchTransactions])

  async function handlePurchase(pack: CreditPack, customAmount?: number) {
    if (!razorpayReady || !window.Razorpay) { alert("Razorpay is still loading. Please wait a moment."); return }
    const purchaseKey = customAmount ? `custom-${customAmount}` : pack.id
    setPurchaseLoading(purchaseKey)
    try {
      const { data } = await api.post<CreateOrderResponse>("/payments/razorpay/create-order", customAmount ? { custom_credits: customAmount } : { pack_id: pack.id })

      const options = {
        key:         data.key_id,
        amount:      data.amount_inr_paise,
        currency:    "INR",
        name:        "PromptPulse",
        description: `${data.credits_to_award} Credits`,
        order_id:    data.razorpay_order_id,
        prefill:     { email: user?.email },
        theme:       { color: "#6366F1" },
        config:      RAZORPAY_PAYMENT_DISPLAY_CONFIG,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await api.post("/payments/razorpay/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            })
            await fetchBalance()
            await fetchTransactions(1)
          } catch (error) {
            console.error("Payment verification failed", error)
            alert("Payment succeeded, but verification failed. Please contact support with your payment ID.")
          }
        },
        modal: {
          ondismiss: () => {
            setPurchaseLoading(null)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", (response) => {
        const message = response.error?.description || response.error?.reason || "Payment failed. Please try again."
        alert(message)
        setPurchaseLoading(null)
      })
      rzp.open()
    } catch (err) {
      console.error("Purchase failed", err)
      alert("Failed to initiate payment. Please try again.")
    } finally {
      setPurchaseLoading(null)
    }
  }

  async function openCreditsModal() {
    setCreditsModalOpen(true)
    await fetchDeductions()
  }

  async function handlePlanPurchase(plan: PaidPlan) {
    if (!razorpayReady || !window.Razorpay) { alert("Razorpay is still loading. Please wait a moment."); return }
    setPurchaseLoading(`plan-${plan}`)
    try {
      const { data } = await api.post<CreateOrderResponse>("/payments/razorpay/create-order", { plan_id: plan })

      const options = {
        key:         data.key_id,
        amount:      data.amount_inr_paise,
        currency:    "INR",
        name:        "PromptPulse",
        description: `${data.credits_to_award.toLocaleString("en-IN")} Monthly Credits`,
        order_id:    data.razorpay_order_id,
        prefill:     { email: user?.email },
        theme:       { color: "#0F172A" },
        config:      RAZORPAY_PAYMENT_DISPLAY_CONFIG,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verified = await api.post<{ credits_awarded: number; new_balance: number; plan?: PaidPlan | null }>("/payments/razorpay/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            })
            await fetchBalance()
            await fetchTransactions(1)
            if (verified.data.plan) {
              setActivePlan(verified.data.plan)
              const rawUser = localStorage.getItem("promptpulse_user")
              if (rawUser) {
                localStorage.setItem("promptpulse_user", JSON.stringify({
                  ...JSON.parse(rawUser),
                  plan: verified.data.plan,
                  effective_plan: verified.data.plan,
                  credits_balance: verified.data.new_balance,
                }))
              }
            }
            window.dispatchEvent(new Event("credits:changed"))
          } catch (error) {
            console.error("Payment verification failed", error)
            alert("Payment succeeded, but verification failed. Please contact support with your payment ID.")
          } finally {
            setPurchaseLoading(null)
          }
        },
        modal: {
          ondismiss: () => {
            setPurchaseLoading(null)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", (response) => {
        const message = response.error?.description || response.error?.reason || "Payment failed. Please try again."
        alert(message)
        setPurchaseLoading(null)
      })
      rzp.open()
    } catch (err) {
      console.error("Plan purchase failed", err)
      alert("Failed to initiate payment. Please try again.")
      setPurchaseLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">Workspace finance</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950">Billing &amp; credits</h1><p className="mt-2 text-sm text-slate-500">Choose a monthly capacity bundle or add credits whenever you need them.</p></div><span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">Secure payments by Razorpay</span></div>
      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {loadError}
        </div>
      )}
      {/* ── Low-balance Warning ── */}
      {balance?.low_balance && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800">Your credit balance is running low</p>
            <p className="text-sm text-amber-700">You have fewer than 50 credits remaining. Top up to continue using the platform without interruption.</p>
          </div>
        </div>
      )}

      {/* ── Balance Card ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_42px_-32px_rgba(15,23,42,.38)] sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-sky-100/80 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1.9fr] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">Available wallet</p>
            <button
              type="button"
              onClick={() => void openCreditsModal()}
              className="mt-2 block text-left transition hover:opacity-80"
              aria-label="View deducted credits from the last 30 days"
            >
              <span className="text-5xl font-bold tracking-[-0.05em] text-slate-950 sm:text-6xl">{(balance?.credits_balance ?? 0).toLocaleString()}</span>
              <span className="ml-2 text-xl font-semibold tracking-normal text-slate-400">credits</span>
            </button>
            <p className="mt-2 text-sm text-slate-500">Use your balance across brands, prompts, and engines.</p>
            <button
              type="button"
              onClick={() => void openCreditsModal()}
              className="mt-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-sky-700 hover:border-sky-200 hover:bg-sky-50"
            >
              View deductions
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Starter</p><p className="mt-2 text-sm font-semibold text-slate-800">Resets monthly</p><p className="mt-1 text-xs leading-5 text-slate-500">Unused included credits expire at period end.</p></div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Growth + Pro</p><p className="mt-2 text-sm font-semibold text-slate-800">Roll over</p><p className="mt-1 text-xs leading-5 text-slate-500">Unused included credits stay available.</p></div>
            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-sky-700">PAYG</p><p className="mt-2 text-sm font-semibold text-slate-800">Never expires</p><p className="mt-1 text-xs leading-5 text-slate-500">Top up from 1,000 credits anytime.</p></div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-lg font-bold text-slate-950">Monthly credit bundles</h2>
        <p className="mb-4 text-sm text-slate-500">Every plan includes the full PromptPulse product.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CREDIT_PLANS.map(plan => {
            const isActive = activePlan === plan.id
            return (
            <button
              key={plan.id}
              type="button"
              onClick={() => void handlePlanPurchase(plan.id)}
              disabled={purchaseLoading !== null}
              className={`group relative flex flex-col items-start rounded-2xl border p-6 text-left shadow-[0_14px_30px_-26px_rgba(15,23,42,.55)] transition hover:-translate-y-0.5 disabled:opacity-50 ${
                isActive
                  ? "border-sky-400 bg-sky-50/70 ring-2 ring-sky-100"
                  : "border-slate-200 bg-white hover:border-sky-300"
              }`}
            >
              <div className="absolute right-3 top-3 flex items-center gap-2">
                {isActive && (
                  <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Current plan
                  </span>
                )}
                {!isActive && plan.bonus > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Best value
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-slate-500">{plan.name}</p>
              {plan.bonus > 0 ? (
                <>
                  <p className="mt-1 text-3xl font-bold text-slate-950">
                    {plan.baseCredits.toLocaleString("en-IN")}
                    <span className="mx-1 text-2xl text-slate-300">+</span>
                    <span className="text-emerald-600">{plan.bonus.toLocaleString("en-IN")}</span>
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    {plan.bonus.toLocaleString("en-IN")} bonus credits
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    = {(plan.baseCredits + plan.bonus).toLocaleString("en-IN")} total credits / month
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-3xl font-bold text-slate-950">
                    {plan.baseCredits.toLocaleString("en-IN")}
                    <span className="ml-1 text-sm font-normal text-slate-500">credits</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Included credits / month
                  </p>
                </>
              )}
              <p className="mt-2 text-xs text-slate-500">{plan.detail}</p>
              <p className="mt-2 text-xs font-semibold text-sky-700">{plan.expiry}</p>
              <p className="mt-3 text-xl font-bold text-sky-700">₹{plan.amount_inr.toLocaleString("en-IN")}<span className="text-sm font-medium text-slate-500">/mo</span></p>
              <div className={`mt-4 w-full rounded-xl py-2 text-center text-sm font-bold transition ${
                isActive
                  ? "bg-sky-600 text-white"
                  : "bg-slate-950 text-white group-hover:bg-slate-800"
              }`}>
                {purchaseLoading === `plan-${plan.id}` ? "Processing..." : isActive ? "Current monthly bundle" : "Buy monthly bundle"}
              </div>
            </button>
          )})}
        </div>
      </div>

      {/* ── Top-up Packs ── */}
      <div>
        <h2 className="mb-1 text-lg font-bold text-slate-950">PAYG top-ups</h2>
        <p className="mb-4 text-sm text-slate-500">Add capacity anytime. PAYG credits do not expire.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {packs.map(pack => (
            <button
              key={pack.id}
              id={`topup-${pack.id}`}
              onClick={() => void handlePurchase(pack)}
              disabled={purchaseLoading === pack.id}
              className="group relative flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-[0_14px_30px_-26px_rgba(15,23,42,.55)] transition hover:-translate-y-0.5 hover:border-sky-300 disabled:opacity-50"
            >
              {pack.bonus_credits > 0 && (
                <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  +{pack.bonus_credits} bonus
                </span>
              )}
              <p className="text-sm font-bold text-slate-500">{pack.label}</p>
              <p className="mt-1 text-3xl font-bold text-slate-950">
                {(pack.credits + pack.bonus_credits).toLocaleString()}
                <span className="ml-1 text-sm font-normal text-slate-500">credits</span>
              </p>
              <p className="mt-3 text-xl font-bold text-sky-700">₹{pack.amount_inr.toLocaleString("en-IN")}</p>
              <div className="mt-4 w-full rounded-xl bg-sky-600 py-2.5 text-center text-sm font-bold text-white transition group-hover:bg-sky-700">
                {purchaseLoading === pack.id ? "Processing…" : "Buy with UPI / Card"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_30px_-26px_rgba(15,23,42,.45)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Custom top-up</h2>
            <p className="mt-1 text-sm text-slate-500">Choose any amount from 1,000 credits. Agencies can use the same wallet across clients.</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1000}
              step={100}
              value={customCredits}
              onChange={(event) => setCustomCredits(event.target.value)}
              className="h-10 w-36 rounded-lg border border-slate-200 bg-white px-3 text-right text-sm font-semibold text-slate-900 outline-none focus:border-sky-400"
              aria-label="Custom credit amount"
            />
            <button
              type="button"
              onClick={() => {
                const amount = Math.floor(Number(customCredits))
                if (amount >= 1000) void handlePurchase({ id: `custom-${amount}`, label: `${amount} Credits`, amount_inr: Math.ceil(amount * 0.999), credits: amount, bonus_credits: 0 }, amount)
              }}
              disabled={purchaseLoading !== null || Number(customCredits) < 1000}
              className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {purchaseLoading?.startsWith("custom-") ? "Processing…" : "Buy custom"}
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">Custom pricing is ₹0.999 per credit, rounded up. Minimum 1,000 credits. PAYG credits do not expire.</p>
      </div>

      {/* ── Transaction History ── */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-950">Usage history</h2>
        {transactions.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No transactions yet. Your credit usage will appear here.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-right">Credits</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-slate-50/50" : ""} transition hover:bg-sky-50`}
                  >
                    <td className="px-4 py-3 text-slate-700">{tx.description ?? tx.action}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                        {tx.action}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold tabular-nums ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {new Date(tx.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => void fetchTransactions(page - 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >← Prev</button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => void fetchTransactions(page + 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >Next →</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {creditsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">Last 30 days</p>
                <h3 className="mt-1 text-xl font-bold tracking-[-0.03em] text-slate-950">Deducted credits</h3>
                <p className="mt-1 text-sm text-slate-500">Only usage deductions are shown here. Top-ups and plan credits are excluded.</p>
              </div>
              <button
                type="button"
                onClick={() => setCreditsModalOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="max-h-[62vh] overflow-auto p-6">
              {deductionsLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                </div>
              ) : deductions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm font-bold text-slate-700">No credit deductions in the last 30 days.</p>
                  <p className="mt-1 text-xs text-slate-500">Successful daily runs and paid actions will appear here.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-3 text-left">Reason</th>
                        <th className="px-4 py-3 text-left">Details</th>
                        <th className="px-4 py-3 text-right">Credits</th>
                        <th className="px-4 py-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deductions.map((tx, index) => (
                        <tr key={tx.id} className={`border-b border-slate-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                          <td className="px-4 py-3 font-semibold text-slate-800">{tx.description ?? tx.action}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {formatDeductionDetails(tx)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold tabular-nums text-rose-600">{tx.amount}</td>
                          <td className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                            {new Date(tx.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
              <p className="text-xs font-semibold text-slate-500">{deductionTotal.toLocaleString("en-IN")} deduction record{deductionTotal === 1 ? "" : "s"} in 30 days</p>
              <p className="text-sm font-bold text-slate-950">
                {deductions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0).toLocaleString("en-IN")} credits used
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDeductionDetails(tx: Transaction) {
  const metadata = tx.metadata
  if (!metadata) return tx.action
  const parts = [
    metadata.successful_checks ? `${metadata.successful_checks} successful checks` : null,
    metadata.engines?.length ? metadata.engines.join(", ") : null,
    metadata.source === "brightdata_batch" ? "BrightData daily run" : metadata.source,
  ].filter(Boolean)
  return parts.length ? parts.join(" · ") : tx.action
}

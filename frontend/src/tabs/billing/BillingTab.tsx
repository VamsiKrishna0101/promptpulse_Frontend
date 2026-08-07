import { useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams } from "react-router-dom"
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
type BillingInterval = "monthly" | "annual"

type BillingPlan = {
  id: PaidPlan
  name: string
  monthly_amount_inr: number
  annual_amount_inr: number
  annual_effective_monthly_inr: number
  monthly_credits: number
  annual_credits: number
  base_credits: number
  bonus_credits: number
  detail: string
  expiry: string
}

type BillingCatalog = {
  currency: "INR"
  annual_discount_percent: number
  account_type: "SINGLE" | "AGENCY"
  wallet_mode: "INDIVIDUAL" | "SHARED_AGENCY"
  credit_policy: {
    successful_ai_engine_check: number
    seo_provider_credits_per_usd: number
    site_audit: { quick: number; standard: number; deep: number }
    failed_provider_run: number
    cached_report: number
  }
  plans: BillingPlan[]
}

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

type CreateSubscriptionResponse = {
  razorpay_subscription_id: string
  key_id: string
  plan: PaidPlan
  billing_interval: BillingInterval
  amount_inr_paise: number
  monthly_credits: number
}

declare global {
  interface Window {
    Razorpay?: new (options: object) => {
      open(): void
      on(event: "payment.failed", handler: (response: { error?: { description?: string; reason?: string } }) => void): void
    }
  }
}

// Type for subscription status polling response
type SubCheckResponse = {
  active: boolean
  status: string
  paid_count: number
  already_credited: boolean
  plan: PaidPlan | null
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
  const [catalog, setCatalog]           = useState<BillingCatalog | null>(null)
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [deductions, setDeductions]     = useState<Transaction[]>([])
  const [total, setTotal]               = useState(0)
  const [deductionTotal, setDeductionTotal] = useState(0)
  const [page, setPage]                 = useState(1)
  const [deductionsPage, setDeductionsPage] = useState(1)
  const [loading, setLoading]           = useState(true)
  const [loadError, setLoadError]       = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [creditsModalOpen, setCreditsModalOpen] = useState(false)
  const autoOpened = useRef(false)
  const [deductionsLoading, setDeductionsLoading] = useState(false)
  const [deductionsError, setDeductionsError] = useState<string | null>(null)
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

  const fetchDeductions = useCallback(async (p = 1) => {
    setDeductionsLoading(true)
    setDeductionsError(null)
    try {
      const res = await api.get<{ transactions: Transaction[]; total: number }>(`/payments/transactions?days=30&type=debit&page=${p}&limit=10`)
      setDeductions(res.data.transactions ?? [])
      setDeductionTotal(res.data.total ?? 0)
      setDeductionsPage(p)
    } catch (error) {
      console.error("Credit deductions failed to load", error)
      setDeductions([])
      setDeductionTotal(0)
      setDeductionsError("Could not load credit deductions. Please make sure the latest backend is deployed.")
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
          api.get<BillingCatalog>("/payments/catalog").then(r => setCatalog(r.data)),
          fetchTransactions(1),
        ])
      } catch (error) {
        console.error("Billing data failed to load", error)
        setLoadError("Billing routes are not available on this backend deployment yet. Please redeploy the latest backend image.")
      } finally {
        setLoading(false)
        if (searchParams.get("showDeductions") === "true" && !autoOpened.current) {
          autoOpened.current = true
          setCreditsModalOpen(true)
          void fetchDeductions(1)
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev)
            next.delete("showDeductions")
            return next
          }, { replace: true })
        }
      }
    }
    void init()
  }, [fetchBalance, fetchTransactions, searchParams, fetchDeductions, setSearchParams])

  async function handlePurchase(pack: CreditPack, customAmount?: number) {
    if (!razorpayReady || !window.Razorpay) { alert("Razorpay is still loading. Please wait a moment."); return }
    const purchaseKey = customAmount ? `custom-${customAmount}` : pack.id
    setPurchaseLoading(purchaseKey)
    let orderId: string | null = null

    try {
      const { data } = await api.post<CreateOrderResponse>("/payments/razorpay/create-order", customAmount ? { custom_credits: customAmount } : { pack_id: pack.id })
      orderId = data.razorpay_order_id

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
          ondismiss: async () => {
            setPurchaseLoading(null)
            // Poll Razorpay to detect UPI QR payments that completed on the user's phone
            // but didn't fire the JS handler (common with QR-based UPI flows)
            if (!orderId) return
            try {
              const { data: orderCheck } = await api.get<{ paid: boolean; status: string; already_credited: boolean }>(
                `/payments/razorpay/check-order?order_id=${orderId}`
              )
              if (orderCheck.paid && !orderCheck.already_credited) {
                // Payment happened on the phone — webhook will credit, but refresh immediately
                await new Promise(res => setTimeout(res, 1500))
                await fetchBalance()
                await fetchTransactions(1)
              } else if (orderCheck.paid && orderCheck.already_credited) {
                await fetchBalance()
                await fetchTransactions(1)
              }
            } catch {
              // Silently ignore poll errors — webhook will still credit the user
            }
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
    await fetchDeductions(1)
  }

  async function handlePlanPurchase(plan: PaidPlan) {
    if (!razorpayReady || !window.Razorpay) { alert("Razorpay is still loading. Please wait a moment."); return }
    setPurchaseLoading(`plan-${plan}`)

    // Monthly plans are one-time payments (no autopay)
    if (billingInterval === "monthly") {
      let orderId: string | null = null
      try {
        const { data } = await api.post<CreateOrderResponse>("/payments/razorpay/create-order", { plan_id: plan })
        orderId = data.razorpay_order_id

        const options = {
          key:         data.key_id,
          amount:      data.amount_inr_paise,
          currency:    "INR",
          name:        "PromptPulse",
          description: `1 Month ${plan} Plan - ${data.credits_to_award} Credits`,
          order_id:    data.razorpay_order_id,
          prefill:     { email: user?.email },
          theme:       { color: "#0F172A" },
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
              setActivePlan(plan)
              const rawUser = localStorage.getItem("promptpulse_user")
              if (rawUser) {
                localStorage.setItem("promptpulse_user", JSON.stringify({
                  ...JSON.parse(rawUser),
                  plan: plan,
                  effective_plan: plan,
                }))
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
            ondismiss: async () => {
              setPurchaseLoading(null)
              if (!orderId) return
              try {
                const { data: orderCheck } = await api.get<{ paid: boolean; status: string; already_credited: boolean }>(
                  `/payments/razorpay/check-order?order_id=${orderId}`
                )
                if (orderCheck.paid && !orderCheck.already_credited) {
                  await new Promise(res => setTimeout(res, 1500))
                  await fetchBalance()
                  await fetchTransactions(1)
                  setActivePlan(plan)
                  window.dispatchEvent(new Event("credits:changed"))
                } else if (orderCheck.paid && orderCheck.already_credited) {
                  await fetchBalance()
                  await fetchTransactions(1)
                  setActivePlan(plan)
                  window.dispatchEvent(new Event("credits:changed"))
                }
              } catch {
                // ignore
              }
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
        console.error("Monthly Plan purchase failed", err)
        const message = (err as { response?: { data?: { error?: unknown } } }).response?.data?.error
        alert(typeof message === "string" ? message : "Failed to initiate payment. Please try again.")
        setPurchaseLoading(null)
      }
      return
    }

    // Annual plans are auto-renewing subscriptions
    let razorpaySubId: string | null = null
    try {
      const { data } = await api.post<CreateSubscriptionResponse>("/payments/razorpay/create-subscription", {
        plan_id: plan,
        billing_interval: billingInterval,
      })
      razorpaySubId = data.razorpay_subscription_id

      const options = {
        key:         data.key_id,
        name:        "PromptPulse",
        description: `${data.monthly_credits.toLocaleString("en-IN")} credits monthly · ${billingInterval === "annual" ? "annual" : "monthly"} auto-renewal`,
        subscription_id: data.razorpay_subscription_id,
        prefill:     { email: user?.email },
        theme:       { color: "#0F172A" },
        // config: RAZORPAY_PAYMENT_DISPLAY_CONFIG removed to allow Cards for high-value annual subscriptions (UPI Autopay max 15k limit)
        handler: async (response: { razorpay_subscription_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verified = await api.post<{ verified: boolean; status: string; plan?: PaidPlan | null }>("/payments/razorpay/verify-subscription", {
              razorpay_subscription_id: response.razorpay_subscription_id,
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
          ondismiss: async () => {
            setPurchaseLoading(null)
            if (!razorpaySubId) return

            // Retry polling up to 6 times (3s apart = 18s total) to detect UPI QR
            // subscription payments that completed on the user's phone.
            // Razorpay's first charge can take a few seconds after mandate setup.
            const MAX_ATTEMPTS = 6
            const POLL_INTERVAL_MS = 3000

            const applySuccessfulSubscription = async (planName: PaidPlan) => {
              await fetchBalance()
              await fetchTransactions(1)
              setActivePlan(planName)
              const rawUser = localStorage.getItem("promptpulse_user")
              if (rawUser) {
                localStorage.setItem("promptpulse_user", JSON.stringify({
                  ...JSON.parse(rawUser),
                  plan: planName,
                  effective_plan: planName,
                }))
              }
              window.dispatchEvent(new Event("credits:changed"))
            }

            for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
              try {
                await new Promise(res => setTimeout(res, POLL_INTERVAL_MS))
                const { data: s } = await api.get<SubCheckResponse>(
                  `/payments/razorpay/check-subscription?subscription_id=${razorpaySubId}`
                )

                // If already credited by webhook — just refresh
                if (s.already_credited && s.plan) {
                  await applySuccessfulSubscription(s.plan)
                  break
                }

                // Subscription is active and first payment collected
                if ((s.status === "active" || s.status === "authenticated") && s.paid_count > 0 && s.plan) {
                  // Webhook will credit; wait 2s more for it then refresh
                  await new Promise(res => setTimeout(res, 2000))
                  await applySuccessfulSubscription(s.plan)
                  break
                }

                // Still pending (mandate set, first charge in flight) — keep polling
                // If last attempt and subscription exists but not yet charged, still refresh so
                // webhook can be seen when user reopens the billing tab
                if (attempt === MAX_ATTEMPTS && s.active && s.plan) {
                  await fetchBalance()
                  await fetchTransactions(1)
                }
              } catch {
                // Silently continue — webhook will still credit the user
              }
            }
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
      const message = (err as { response?: { data?: { error?: unknown } } }).response?.data?.error
      alert(typeof message === "string" ? message : "Failed to initiate payment. Please try again.")
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

      {catalog && (
        <div className="border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div><h2 className="text-sm font-bold text-slate-950">Your credit rates</h2><p className="mt-0.5 text-xs text-slate-500">{catalog.account_type === "AGENCY" ? "Agency pricing · shared across client workspaces" : "Individual workspace pricing"}</p></div>
            <span className="bg-slate-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{catalog.account_type === "AGENCY" ? "Agency" : "Individual"}</span>
          </div>
          <div className="grid divide-y divide-slate-200 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            <div className="px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI visibility</p><p className="mt-1 text-xl font-bold text-slate-950">{catalog.credit_policy.successful_ai_engine_check}</p><p className="text-xs text-slate-500">per successful engine</p></div>
            <div className="px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Site audit</p><p className="mt-1 text-xl font-bold text-slate-950">{catalog.credit_policy.site_audit.quick}–{catalog.credit_policy.site_audit.deep}</p><p className="text-xs text-slate-500">based on crawl depth</p></div>
            <div className="px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Saved SEO data</p><p className="mt-1 text-xl font-bold text-slate-950">0</p><p className="text-xs text-slate-500">free to reopen</p></div>
            <div className="px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Failed provider run</p><p className="mt-1 text-xl font-bold text-slate-950">0</p><p className="text-xs text-slate-500">automatically refunded</p></div>
          </div>
        </div>
      )}

      {catalog?.account_type !== "AGENCY" && <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Subscription capacity</h2>
            <p className="mt-1 text-sm text-slate-500">Credits are added monthly on both billing schedules.</p>
          </div>
          <div className="inline-flex border border-slate-200 bg-slate-50 p-1" aria-label="Billing interval">
            {(["monthly", "annual"] as BillingInterval[]).map(interval => (
              <button
                key={interval}
                type="button"
                onClick={() => setBillingInterval(interval)}
                className={`px-4 py-2 text-xs font-bold capitalize transition ${billingInterval === interval ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                {interval}{interval === "annual" ? ` · Save ${catalog?.annual_discount_percent ?? 20}%` : ""}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(catalog?.plans ?? []).map(plan => {
            const isActive = activePlan === plan.id
            const displayedAmount = billingInterval === "annual" ? plan.annual_effective_monthly_inr : plan.monthly_amount_inr
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
                {!isActive && plan.bonus_credits > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Best value
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-slate-500">{plan.name}</p>
              {plan.bonus_credits > 0 ? (
                <>
                  <p className="mt-1 text-3xl font-bold text-slate-950">
                    {plan.base_credits.toLocaleString("en-IN")}
                    <span className="mx-1 text-2xl text-slate-300">+</span>
                    <span className="text-emerald-600">{plan.bonus_credits.toLocaleString("en-IN")}</span>
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    {plan.bonus_credits.toLocaleString("en-IN")} bonus credits
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    = {plan.monthly_credits.toLocaleString("en-IN")} total credits / month
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-3xl font-bold text-slate-950">
                    {plan.base_credits.toLocaleString("en-IN")}
                    <span className="ml-1 text-sm font-normal text-slate-500">credits</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Included credits / month
                  </p>
                </>
              )}
              <p className="mt-2 text-xs text-slate-500">{plan.detail}</p>
              <p className="mt-2 text-xs font-semibold text-sky-700">{plan.expiry}</p>
              <p className="mt-3 text-xl font-bold text-slate-950">₹{displayedAmount.toLocaleString("en-IN")}<span className="text-sm font-medium text-slate-500">/mo</span></p>
              {billingInterval === "annual" && (
                <p className="mt-1 text-xs font-semibold text-slate-500">₹{plan.annual_amount_inr.toLocaleString("en-IN")} billed yearly · auto-renews</p>
              )}
              <div className={`mt-4 w-full rounded-xl py-2 text-center text-sm font-bold transition ${
                isActive
                  ? "bg-sky-600 text-white"
                  : "bg-slate-950 text-white group-hover:bg-slate-800"
              }`}>
                {purchaseLoading === `plan-${plan.id}` ? "Processing..." : isActive ? "Current plan" : `Start ${billingInterval} auto-pay`}
              </div>
            </button>
          )})}
        </div>
      </div>}

      {/* ── Top-up Packs ── */}
      <div>
        <h2 className="mb-1 text-lg font-bold text-slate-950">PAYG top-ups</h2>
        <p className="mb-4 text-sm text-slate-500">{catalog?.account_type === "AGENCY" ? "No subscription required. Start small and fund one shared wallet across team members and client workspaces." : "Add capacity anytime. PAYG credits do not expire."}</p>
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
        <p className="mt-3 text-xs text-slate-500">{catalog?.account_type === "AGENCY" ? "Agency volume pricing is applied automatically as the top-up grows." : "Custom pricing is ₹0.999 per credit, rounded up."} Minimum 1,000 credits. PAYG credits do not expire.</p>
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={() => setCreditsModalOpen(false)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
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
              ) : deductionsError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
                  <p className="text-sm font-bold text-rose-700">{deductionsError}</p>
                  <button
                    type="button"
                    onClick={() => void fetchDeductions()}
                    className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
                  >
                    Retry
                  </button>
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
            {!deductionsLoading && !deductionsError && deductions.length > 0 && Math.ceil(deductionTotal / 10) > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3">
                <p className="text-xs text-slate-500">Page {deductionsPage} of {Math.ceil(deductionTotal / 10)}</p>
                <div className="flex gap-2">
                  <button
                    disabled={deductionsPage <= 1}
                    onClick={() => void fetchDeductions(deductionsPage - 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >← Prev</button>
                  <button
                    disabled={deductionsPage >= Math.ceil(deductionTotal / 10)}
                    onClick={() => void fetchDeductions(deductionsPage + 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >Next →</button>
                </div>
              </div>
            )}
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
  const metadata = tx.metadata as any
  if (!metadata) return tx.action

  if (tx.action === "seo_audit" && metadata.url) {
    return `Audit: ${metadata.url.replace(/^https?:\/\//, "")}`
  }

  const parts = [
    metadata.successful_checks ? `${metadata.successful_checks} successful checks` : null,
    metadata.engines?.length ? metadata.engines.join(", ") : null,
    metadata.source === "brightdata_batch" ? "BrightData daily run" : metadata.source,
  ].filter(Boolean)
  return parts.length ? parts.join(" · ") : tx.action
}

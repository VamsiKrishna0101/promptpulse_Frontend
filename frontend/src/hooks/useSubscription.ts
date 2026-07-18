import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export type PlanName = "FREE" | "STARTER" | "GROWTH" | "PRO"

export type PlanLimits = {
  projects: number
  prompts: number
  competitors: number | "unlimited"
  refreshes_per_week: number | "daily"
  sara: "none" | "basic" | "full" | "advanced"
  exports: "none" | "basic" | "full"
  credits: number
}

export type MyPlanResponse = {
  plan: PlanName
  effective_plan: PlanName
  status: string
  subscription: {
    id: string
    plan: PlanName
    status: string
    current_period_start: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
    trial_starts_at: string | null
    trial_ends_at: string | null
  } | null
  trial: {
    active: boolean
    expired: boolean
    starts_at: string | null
    ends_at: string | null
    days_left: number
  }
  limits: PlanLimits
  usage: {
    prompt_count: number
    project_count: number
    competitor_count: number
    monthly_runs_used: number
    credits_used: number
    credits_remaining: number
    period_start: string | null
    period_end: string | null
  }
}

export function useSubscription() {
  const [data, setData] = useState<MyPlanResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutPlan, setCheckoutPlan] = useState<PlanName | null>(null)

  async function refresh() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<MyPlanResponse>("/subscription/me")
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscription")
    } finally {
      setIsLoading(false)
    }
  }

  async function startCheckout(plan: Exclude<PlanName, "FREE">) {
    setCheckoutPlan(plan)
    setError(null)
    try {
      const response = await api.post<{ checkout_url: string }>("/subscription/create", { plan })
      window.location.href = response.data.checkout_url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout")
    } finally {
      setCheckoutPlan(null)
    }
  }

  useEffect(() => {
    void refresh()

    function handleCreditsChanged() {
      void refresh()
    }

    window.addEventListener("credits:changed", handleCreditsChanged)
    return () => window.removeEventListener("credits:changed", handleCreditsChanged)
  }, [])

  return {
    data,
    isLoading,
    error,
    checkoutPlan,
    refresh,
    startCheckout,
  }
}

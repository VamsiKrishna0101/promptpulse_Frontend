import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { PlanName } from "@/hooks/useSubscription"

export type ProfileResponse = {
  user: {
    id: string
    email: string
    is_verified: boolean
    account_type: "SINGLE" | "AGENCY"
    plan: PlanName
    created_at: string
  }
  projects: {
    id: string
    brand_name: string
    brand_url: string
    brand_location: string
    created_at: string
    updated_at: string
  }[]
  subscription: {
    id: string
    plan: PlanName
    status: string
    amount_cents: number
    currency: string
    current_period_start: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
    trial_starts_at: string | null
    trial_ends_at: string | null
    created_at: string
  } | null
  trial: {
    trial_starts_at: string | null
    trial_ends_at: string | null
    trial_active: boolean
    trial_days_left: number
  }
  usage: {
    prompt_count: number
    project_count: number
    competitor_count: number
    monthly_runs_used: number
    period_start: string | null
    period_end: string | null
  }
}

export function useProfile() {
  const [data, setData] = useState<ProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<ProfileResponse>("/profile/me")
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return { data, isLoading, error, refresh }
}

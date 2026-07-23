import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export type ProfileResponse = {
  user: {
    id: string
    email: string
    is_verified: boolean
    account_type: "SINGLE" | "AGENCY"
    plan: "PAYG"
    effective_plan?: "PAYG"
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
  wallet?: {
    balance: number
    used: number
  }
  usage?: {
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
      const profile = response.data
      const fallbackBalance =
        profile.wallet?.balance ??
        (profile.user as typeof profile.user & { credits_balance?: number }).credits_balance ??
        0

      setData({
        ...profile,
        projects: profile.projects ?? [],
        wallet: {
          balance: fallbackBalance,
          used: profile.wallet?.used ?? 0,
        },
        usage: profile.usage ?? {
          prompt_count: 0,
          project_count: profile.projects?.length ?? 0,
          competitor_count: 0,
          monthly_runs_used: 0,
          period_start: null,
          period_end: null,
        },
      })
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

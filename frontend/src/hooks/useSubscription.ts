/**
 * useSubscription.ts
 * Simplified to PAYG — fetches credit balance and transaction history.
 * The old Stripe plan/checkout/invoice API calls are removed.
 */
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export type CreditTransaction = {
  id:          string
  amount:      number
  action:      string
  description: string | null
  created_at:  string
}

export type BalanceData = {
  credits_balance: number
  low_balance:     boolean
}

export function useSubscription() {
  const [data, setData]         = useState<BalanceData | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<BalanceData>("/payments/balance")
      setData(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load balance")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    window.addEventListener("credits:changed", () => void refresh())
    return () => window.removeEventListener("credits:changed", () => void refresh())
  }, [])

  return { data, isLoading, error, refresh }
}

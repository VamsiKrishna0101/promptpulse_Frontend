import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export type SettingsResponse = {
  account: {
    id: string
    email: string
    is_verified: boolean
    account_type: "SINGLE" | "AGENCY"
    plan: string
    created_at: string
    updated_at: string
  }
  security: {
    password_enabled: boolean
    email_verified: boolean
  }
  product: {
    weekly_email_reports: boolean
    sara_recommendations: boolean
    export_notifications: boolean
  }
}

export function useSettings() {
  const [data, setData] = useState<SettingsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  async function refresh() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<SettingsResponse>("/settings/me")
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }

  async function updatePassword(currentPassword: string, newPassword: string) {
    setIsUpdatingPassword(true)
    setError(null)
    try {
      await api.patch("/settings/password", {
        current_password: currentPassword,
        new_password: newPassword,
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  async function updateAccountType(accountType: "SINGLE" | "AGENCY") {
    await api.patch("/settings/account-type", { account_type: accountType })
    await refresh()
  }

  useEffect(() => {
    void refresh()
  }, [])

  return {
    data,
    isLoading,
    error,
    isUpdatingPassword,
    refresh,
    updatePassword,
    updateAccountType,
  }
}

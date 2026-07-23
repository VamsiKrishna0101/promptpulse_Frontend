/**
 * SubscriptionTab.tsx — PAYG Credits Edition
 * The old Starter/Growth/Pro plan page is replaced with a PAYG
 * wallet page: credit balance, top-up packs, usage history.
 * Redirects cleanly to /billing which already has the full implementation.
 */
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function SubscriptionTab() {
  const navigate = useNavigate()

  // Hard redirect to the new Billing & Credits page immediately
  useEffect(() => {
    navigate("/billing", { replace: true })
  }, [navigate])

  return null
}

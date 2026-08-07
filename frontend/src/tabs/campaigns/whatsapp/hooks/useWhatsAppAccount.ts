import { useState, useEffect } from "react"
import { getWhatsAppAccount, type WhatsAppAccount } from "@/lib/whatsappApi"

export function useWhatsAppAccount(projectId: string | null) {
    const [account, setAccount] = useState<WhatsAppAccount | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    async function load() {
        if (!projectId) { setLoading(false); return }
        setLoading(true)
        setError(null)
        try {
            const data = await getWhatsAppAccount(projectId)
            setAccount(data)
        } catch (err: any) {
            setError(err?.response?.data?.error ?? "Failed to load WhatsApp account")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { void load() }, [projectId])

    return { account, loading, error, reload: load }
}

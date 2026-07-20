import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export type TimeSeriesDay = {
    date: string
    total_chats: number
    brands: Record<string, number>
}

export function useVisibilityTimeSeries(projectId: string | null, queryString: string = "") {
    const [data, setData] = useState<TimeSeriesDay[]>([])
    const [isLoading, setIsLoading] = useState(Boolean(projectId))
    const [error, setError] = useState<string | null>(null)

    async function refresh() {
        if (!projectId) return
        setIsLoading(true)
        setError(null)
        try {
            const response = await api.get<TimeSeriesDay[]>(`/dashboard/${projectId}/timeseries${queryString}`)
            setData(response.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load chart data")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { void refresh() }, [projectId, queryString])

    return { data, isLoading, error, refresh }
}

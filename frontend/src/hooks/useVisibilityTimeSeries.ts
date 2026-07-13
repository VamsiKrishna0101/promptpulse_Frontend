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

    useEffect(() => {
        if (!projectId) return
        setIsLoading(true)
        setError(null)
        api.get<TimeSeriesDay[]>(`/dashboard/${projectId}/timeseries${queryString}`)
            .then(res => setData(res.data))
            .catch(err => setError(err instanceof Error ? err.message : "Failed to load chart data"))
            .finally(() => setIsLoading(false))
    }, [projectId, queryString])

    return { data, isLoading, error }
}

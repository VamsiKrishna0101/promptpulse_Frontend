import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export type DashboardData = {
  brand: {
    visibility: number
    avg_position: number
    avg_sentiment: number
    delta_visibility?: number | null
    delta_position?: number | null
    delta_sentiment?: number | null
  }
  competitors: {
    brand_name: string
    visibility: number
    avg_position: number
    avg_sentiment: number
    delta_visibility?: number | null
    delta_position?: number | null
    delta_sentiment?: number | null
  }[]
  topSources: {
    domain: string
    source_type: string
    usage_percentage: number
  }[]
}

export type SourceRow = {
  domain: string
  source_type: string
  used_percentage?: number
  usage_percentage?: number
  avg_citations?: number
  retrieval_rate?: number
  citation_rate?: number
  unique_urls?: number
}

export type CompetitorRow = {
  id?: string
  name?: string
  url?: string
  brand_name?: string
  visibility: number
  avg_position: number | null
  avg_sentiment: number | null
  mention_count?: number
  delta_visibility?: number | null
  delta_position?: number | null
  delta_sentiment?: number | null
}

type DashboardState = {
  data: DashboardData | null
  sources: SourceRow[]
  domains: SourceRow[]
  competitors: CompetitorRow[]
}

type SourcePageResponse<T> = {
  items: T[]
}

export function useDashboard(projectId: string | null, queryString: string = "") {
  const [state, setState] = useState<DashboardState>({
    data: null,
    sources: [],
    domains: [],
    competitors: [],
  })
  const [isLoading, setIsLoading] = useState(Boolean(projectId))
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    if (!projectId) return
    setIsLoading(true)
    setError(null)

    try {
      const qs = queryString || ""
      const domainParams = new URLSearchParams(qs.replace(/^\?/, ""))
      domainParams.set("page", "1")
      domainParams.set("page_size", "20")
      const [dashboard, sources, domains, tracked] = await Promise.allSettled([
        api.get<DashboardData>(`/dashboard/${projectId}${qs}`),
        api.get<SourceRow[]>(`/sources/${projectId}/top${qs}`),
        api.get<SourcePageResponse<SourceRow>>(`/sources/${projectId}/domains?${domainParams.toString()}`),
        api.get<CompetitorRow[]>(`/brands/${projectId}/tracked${qs}`),
      ])

      const trackedRows = tracked.status === "fulfilled" ? tracked.value.data : []
      const measuredTrackedRows = trackedRows.filter((row) => {
        const mentions = row.mention_count ?? 0
        return mentions > 0 || row.visibility > 0
      })

      setState({
        data: dashboard.status === "fulfilled" ? dashboard.value.data : null,
        sources: sources.status === "fulfilled" ? sources.value.data : [],
        domains: domains.status === "fulfilled"
          ? Array.isArray(domains.value.data) ? domains.value.data : domains.value.data.items
          : [],
        competitors: measuredTrackedRows,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [projectId, queryString])

  return {
    ...state,
    isLoading,
    error,
    refresh,
  }
}

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export type DomainSourceRow = {
  domain: string
  source_type: string
  url_types?: string[]
  unique_urls?: number
  retrieval_count?: number
  retrieval_rate?: number
  citation_count?: number
  citation_rate?: number
  used_percentage?: number
  avg_citations?: number
}

export type UrlSourceRow = {
  url: string
  domain: string
  title?: string | null
  source_type?: string | null
  url_type?: string | null
  platform?: string | null
  subreddit?: string | null
  retrievals?: number
  citations?: number
  citation_rate?: number
  prompts?: string[]
  mentioned_brands?: string[]
  snippet?: string | null
  content_updated_at?: string | null
  content_length?: number
  fetch_status?: string | null
  error_reason?: string | null
}

export type SourceGapRow = {
  url: string
  domain: string
  title?: string | null
  source_type?: string | null
  url_type?: string | null
  platform?: string | null
  subreddit?: string | null
  retrievals?: number
  citations?: number
  mentioned_own_brand?: boolean
  mentioned_competitors?: string[]
  tracked_competitors?: string[]
  gap_score?: number
  suggested_action?: string | null
  content_updated_at?: string | null
  content_length?: number
  fetch_status?: string | null
  error_reason?: string | null
}

export type TopSourceRow = {
  domain: string
  source_type: string
  used_percentage?: number
  usage_percentage?: number
  avg_citations?: number
}

export type SourceTrendPoint = {
  date: string
  label: string
  total_chats: number
  domains: {
    domain: string
    source_type: string
    usage_percentage: number
    citation_count: number
  }[]
}

type SourcesState = {
  domains: DomainSourceRow[]
  urls: UrlSourceRow[]
  gaps: SourceGapRow[]
  top: TopSourceRow[]
  trend: SourceTrendPoint[]
}

export function useSources(projectId: string | null, queryString: string = "") {
  const [state, setState] = useState<SourcesState>({
    domains: [],
    urls: [],
    gaps: [],
    top: [],
    trend: [],
  })
  const [isLoading, setIsLoading] = useState(Boolean(projectId))
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    if (!projectId) return

    setIsLoading(true)
    setError(null)

    try {
      const qs = queryString || ""
      const [domains, urls, gaps, top, trend] = await Promise.allSettled([
        api.get<DomainSourceRow[]>(`/sources/${projectId}/domains${qs}`),
        api.get<UrlSourceRow[]>(`/sources/${projectId}/urls${qs}`),
        api.get<SourceGapRow[]>(`/sources/${projectId}/gaps${qs}`),
        api.get<TopSourceRow[]>(`/sources/${projectId}/top${qs}`),
        api.get<SourceTrendPoint[]>(`/sources/${projectId}/trend${qs}`),
      ])

      setState({
        domains: domains.status === "fulfilled" ? domains.value.data : [],
        urls: urls.status === "fulfilled" ? urls.value.data : [],
        gaps: gaps.status === "fulfilled" ? gaps.value.data : [],
        top: top.status === "fulfilled" ? top.value.data : [],
        trend: trend.status === "fulfilled" ? trend.value.data : [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sources")
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

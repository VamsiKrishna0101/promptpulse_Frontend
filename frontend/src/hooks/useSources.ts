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
  domainTotal: number
  urlTotal: number
  gapTotal: number
  domainTotalPages: number
  urlTotalPages: number
  gapTotalPages: number
}

type SourcePageResponse<T> = {
  items: T[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

type SourcePageOptions = {
  mode?: "domains" | "urls"
  page?: number
  pageSize?: number
  search?: string
  domain?: string | null
  gapAnalysis?: boolean
}

export function useSources(projectId: string | null, queryString: string = "", options: SourcePageOptions = {}) {
  const [state, setState] = useState<SourcesState>({
    domains: [],
    urls: [],
    gaps: [],
    top: [],
    trend: [],
    domainTotal: 0,
    urlTotal: 0,
    gapTotal: 0,
    domainTotalPages: 1,
    urlTotalPages: 1,
    gapTotalPages: 1,
  })
  const [isLoading, setIsLoading] = useState(Boolean(projectId))
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    if (!projectId) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams(queryString.replace(/^\?/, ""))
      params.set("page", String(options.page ?? 1))
      params.set("page_size", String(options.pageSize ?? 20))
      if (options.search?.trim()) params.set("search", options.search.trim())
      if (options.domain) params.set("domain", options.domain)
      const qs = params.toString() ? `?${params.toString()}` : ""
      const tableRequest = options.mode === "domains"
        ? api.get<SourcePageResponse<DomainSourceRow>>(`/sources/${projectId}/domains${qs}`)
        : options.gapAnalysis
          ? api.get<SourcePageResponse<SourceGapRow>>(`/sources/${projectId}/gaps${qs}`)
          : api.get<SourcePageResponse<UrlSourceRow>>(`/sources/${projectId}/urls${qs}`)
      const [table, top, trend] = await Promise.allSettled([
        tableRequest,
        api.get<TopSourceRow[]>(`/sources/${projectId}/top${qs}`),
        api.get<SourceTrendPoint[]>(`/sources/${projectId}/trend${qs}`),
      ])

      const tablePage = table.status === "fulfilled" ? table.value.data : null
      const domainPage = options.mode === "domains" ? tablePage as SourcePageResponse<DomainSourceRow> | null : null
      const urlPage = options.mode !== "domains" && !options.gapAnalysis ? tablePage as SourcePageResponse<UrlSourceRow> | null : null
      const gapPage = options.mode !== "domains" && options.gapAnalysis ? tablePage as SourcePageResponse<SourceGapRow> | null : null

      setState({
        domains: Array.isArray(domainPage) ? domainPage : domainPage?.items ?? [],
        urls: Array.isArray(urlPage) ? urlPage : urlPage?.items ?? [],
        gaps: Array.isArray(gapPage) ? gapPage : gapPage?.items ?? [],
        top: top.status === "fulfilled" ? top.value.data : [],
        trend: trend.status === "fulfilled" ? trend.value.data : [],
        domainTotal: Array.isArray(domainPage) ? domainPage.length : domainPage?.total ?? 0,
        urlTotal: Array.isArray(urlPage) ? urlPage.length : urlPage?.total ?? 0,
        gapTotal: Array.isArray(gapPage) ? gapPage.length : gapPage?.total ?? 0,
        domainTotalPages: Array.isArray(domainPage) ? 1 : domainPage?.total_pages ?? 1,
        urlTotalPages: Array.isArray(urlPage) ? 1 : urlPage?.total_pages ?? 1,
        gapTotalPages: Array.isArray(gapPage) ? 1 : gapPage?.total_pages ?? 1,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sources")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [projectId, queryString, options.mode, options.page, options.pageSize, options.search, options.domain, options.gapAnalysis])

  return {
    ...state,
    isLoading,
    error,
    refresh,
  }
}

import { useEffect, useMemo, useState } from "react"
import { api, API_BASE_URL } from "@/lib/api"

export type AnalyticsSite = {
  id: string
  name: string
  domain: string
  public_key: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AnalyticsFacts = {
  active_visitors: number
  views_today: number
  views_month: number
  views_year: number
  average_daily_views: number
  average_duration_ms: number
  bounce_rate: number
}

export type AnalyticsSummary = {
  page_views: number
  visitors: number
  bounce_rate: number
  average_duration_ms: number
  active_visitors: number
  previous_page_views: number
  page_views_delta_pct: number | null
}

export type AnalyticsPoint = {
  date: string
  page_views: number
  visitors: number
}

export type AnalyticsBreakdownRow = {
  name: string
  count: number
  sessions?: number
}

export type AnalyticsDurationPoint = {
  date: string
  average_duration_ms: number
  samples: number
}

export type CustomEventRow = {
  id: string
  title: string
  type: "TOTAL_CHART" | "AVERAGE_CHART" | "TOTAL_LIST" | "AVERAGE_LIST"
  key: string | null
  created_at: string
  updated_at: string
  _count?: { actions: number }
}

type WebAnalyticsState = {
  sites: AnalyticsSite[]
  selectedSite: AnalyticsSite | null
  facts: AnalyticsFacts | null
  summary: AnalyticsSummary | null
  timeseries: AnalyticsPoint[]
  referrers: AnalyticsBreakdownRow[]
  pages: AnalyticsBreakdownRow[]
  browsers: AnalyticsBreakdownRow[]
  devices: AnalyticsBreakdownRow[]
  systems: AnalyticsBreakdownRow[]
  languages: AnalyticsBreakdownRow[]
  screens: AnalyticsBreakdownRow[]
  durations: AnalyticsDurationPoint[]
  customEvents: CustomEventRow[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

const EMPTY_FACTS: AnalyticsFacts = {
  active_visitors: 0,
  views_today: 0,
  views_month: 0,
  views_year: 0,
  average_daily_views: 0,
  average_duration_ms: 0,
  bounce_rate: 0,
}

export function useWebAnalytics(projectId: string | null, queryString = "") {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(() => localStorage.getItem("promptpulse_analytics_site_id"))
  const [state, setState] = useState<WebAnalyticsState>({
    sites: [],
    selectedSite: null,
    facts: null,
    summary: null,
    timeseries: [],
    referrers: [],
    pages: [],
    browsers: [],
    devices: [],
    systems: [],
    languages: [],
    screens: [],
    durations: [],
    customEvents: [],
    isLoading: true,
    isSaving: false,
    error: null,
  })

  const qs = queryString || "?days=30"

  async function load({ silent = false }: { silent?: boolean } = {}) {
    if (!projectId) return
    if (!silent) setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const sitesRes = await api.get<AnalyticsSite[]>(`/webanalytics/${projectId}/sites`)
      const sites = sitesRes.data
      const selectedSite = sites.find(site => site.id === selectedSiteId) ?? sites[0] ?? null
      if (selectedSite) {
        localStorage.setItem("promptpulse_analytics_site_id", selectedSite.id)
        setSelectedSiteId(selectedSite.id)
      }

      const [
        facts,
        summary,
        timeseries,
        referrers,
        pages,
        browsers,
        devices,
        systems,
        languages,
        screens,
        durations,
        customEvents,
      ] = await Promise.all([
        api.get<AnalyticsFacts>(`/webanalytics/${projectId}/facts${qs}`),
        api.get<AnalyticsSummary>(`/webanalytics/${projectId}/summary${qs}`),
        api.get<AnalyticsPoint[]>(`/webanalytics/${projectId}/timeseries${qs}`),
        api.get<AnalyticsBreakdownRow[]>(`/webanalytics/${projectId}/referrers${qs}`),
        api.get<AnalyticsBreakdownRow[]>(`/webanalytics/${projectId}/pages${qs}`),
        api.get<AnalyticsBreakdownRow[]>(`/webanalytics/${projectId}/breakdowns/browsers${qs}`),
        api.get<AnalyticsBreakdownRow[]>(`/webanalytics/${projectId}/breakdowns/devices${qs}`),
        api.get<AnalyticsBreakdownRow[]>(`/webanalytics/${projectId}/breakdowns/systems${qs}`),
        api.get<AnalyticsBreakdownRow[]>(`/webanalytics/${projectId}/breakdowns/languages${qs}`),
        api.get<AnalyticsBreakdownRow[]>(`/webanalytics/${projectId}/breakdowns/screens${qs}`),
        api.get<AnalyticsDurationPoint[]>(`/webanalytics/${projectId}/durations${qs}`),
        selectedSite ? api.get<CustomEventRow[]>(`/webanalytics/${projectId}/sites/${selectedSite.id}/custom-events`) : Promise.resolve({ data: [] as CustomEventRow[] }),
      ])

      setState(prev => ({
        ...prev,
        sites,
        selectedSite,
        facts: facts.data ?? EMPTY_FACTS,
        summary: summary.data,
        timeseries: timeseries.data,
        referrers: referrers.data,
        pages: pages.data,
        browsers: browsers.data,
        devices: devices.data,
        systems: systems.data,
        languages: languages.data,
        screens: screens.data,
        durations: durations.data,
        customEvents: customEvents.data,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load web analytics",
      }))
    }
  }

  async function createSite(input: { name: string; domain: string }) {
    if (!projectId) return
    setState(prev => ({ ...prev, isSaving: true }))
    try {
      const response = await api.post<AnalyticsSite>(`/webanalytics/${projectId}/sites`, input)
      localStorage.setItem("promptpulse_analytics_site_id", response.data.id)
      setSelectedSiteId(response.data.id)
      await load({ silent: true })
    } finally {
      setState(prev => ({ ...prev, isSaving: false }))
    }
  }

  async function regenerateKey(siteId: string) {
    if (!projectId) return
    setState(prev => ({ ...prev, isSaving: true }))
    try {
      await api.post(`/webanalytics/${projectId}/sites/${siteId}/regenerate-key`)
      await load({ silent: true })
    } finally {
      setState(prev => ({ ...prev, isSaving: false }))
    }
  }

  async function createCustomEvent(input: { title: string; type: CustomEventRow["type"]; key?: string }) {
    if (!projectId || !state.selectedSite) return
    setState(prev => ({ ...prev, isSaving: true }))
    try {
      await api.post(`/webanalytics/${projectId}/sites/${state.selectedSite.id}/custom-events`, input)
      await load({ silent: true })
    } finally {
      setState(prev => ({ ...prev, isSaving: false }))
    }
  }

  function selectSite(siteId: string) {
    localStorage.setItem("promptpulse_analytics_site_id", siteId)
    setSelectedSiteId(siteId)
  }

  useEffect(() => {
    void load()
    const delayedRefresh = window.setTimeout(() => {
      void load({ silent: true })
    }, 1800)
    const interval = window.setInterval(() => {
      void load({ silent: true })
    }, 15000)
    return () => {
      window.clearTimeout(delayedRefresh)
      window.clearInterval(interval)
    }
  }, [projectId, queryString, selectedSiteId])

  const trackerSnippet = useMemo(() => {
    if (!state.selectedSite) return ""
    const src = `${API_BASE_URL}/webanalytics/tracker.js`
    return `<script async src="${src}" data-promptpulse-key="${state.selectedSite.public_key}" data-promptpulse-endpoint="${API_BASE_URL}/webanalytics"></script>`
  }, [state.selectedSite])

  return {
    ...state,
    selectedSiteId,
    trackerSnippet,
    selectSite,
    createSite,
    regenerateKey,
    createCustomEvent,
    refresh: load,
  }
}

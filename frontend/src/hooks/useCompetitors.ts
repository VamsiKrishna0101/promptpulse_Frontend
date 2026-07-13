import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export type TrackedCompetitor = {
  id: string
  name: string
  url?: string | null
  visibility: number
  avg_position: number | null
  avg_sentiment: number | null
  mention_count?: number
  delta_visibility?: number | null
  delta_position?: number | null
  delta_sentiment?: number | null
}

export type DiscoveredCompetitor = {
  brand_name: string
  visibility: number
  avg_position: number | null
  avg_sentiment: number | null
  mention_count: number
  delta_visibility?: number | null
  delta_position?: number | null
  delta_sentiment?: number | null
}

export function useCompetitors(projectId: string | null, queryString = "") {
  const [tracked, setTracked] = useState<TrackedCompetitor[]>([])
  const [discovered, setDiscovered] = useState<DiscoveredCompetitor[]>([])
  const [ignored, setIgnored] = useState<DiscoveredCompetitor[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(projectId))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadCompetitors({ silent = false }: { silent?: boolean } = {}) {
    if (!projectId) return
    if (!silent) setIsLoading(true)
    setError(null)

    try {
      const [trackedResponse, discoveredResponse] = await Promise.all([
        api.get<TrackedCompetitor[]>(`/brands/${projectId}/tracked${queryString}`),
        api.get<DiscoveredCompetitor[]>(`/brands/${projectId}/discovered${queryString}`),
      ])

      setTracked(trackedResponse.data)
      setDiscovered(discoveredResponse.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load competitors")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  async function refresh() {
    await loadCompetitors()
  }

  async function addCompetitor(input: { name: string; url?: string }) {
    if (!projectId) return
    setIsSaving(true)
    setError(null)

    const normalizedName = input.name.toLowerCase()
    const discoveredMatch = discovered.find((row) => row.brand_name.toLowerCase() === normalizedName)
    const optimistic: TrackedCompetitor = {
      id: `pending-${normalizedName}`,
      name: input.name,
      url: input.url,
      visibility: discoveredMatch?.visibility ?? 0,
      avg_position: discoveredMatch?.avg_position ?? null,
      avg_sentiment: discoveredMatch?.avg_sentiment ?? null,
      mention_count: discoveredMatch?.mention_count ?? 0,
    }

    setTracked((rows) => rows.some((row) => row.name.toLowerCase() === normalizedName) ? rows : [optimistic, ...rows])
    setIgnored((rows) => rows.filter((row) => row.brand_name.toLowerCase() !== normalizedName))

    try {
      const response = await api.post<Pick<TrackedCompetitor, "id" | "name" | "url">>(`/brands/${projectId}/competitors`, input)
      setTracked((rows) => rows.map((row) => row.id === optimistic.id ? { ...optimistic, ...response.data } : row))
      void loadCompetitors({ silent: true })
    } catch (err) {
      setTracked((rows) => rows.filter((row) => row.id !== optimistic.id))
      setError(err instanceof Error ? err.message : "Failed to add competitor")
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  async function removeCompetitor(id: string) {
    setIsSaving(true)
    setError(null)
    const removed = tracked.find((row) => row.id === id)
    setTracked((rows) => rows.filter((row) => row.id !== id))

    try {
      await api.delete(`/brands/competitors/${id}`)
      void loadCompetitors({ silent: true })
    } catch (err) {
      if (removed) setTracked((rows) => [removed, ...rows])
      setError(err instanceof Error ? err.message : "Failed to remove competitor")
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  function ignoreCompetitor(row: DiscoveredCompetitor) {
    setIgnored((rows) => {
      if (rows.some((item) => item.brand_name.toLowerCase() === row.brand_name.toLowerCase())) return rows
      return [row, ...rows]
    })
  }

  function restoreIgnored(name: string) {
    setIgnored((rows) => rows.filter((row) => row.brand_name.toLowerCase() !== name.toLowerCase()))
  }

  useEffect(() => {
    void loadCompetitors()
  }, [projectId, queryString])

  return {
    tracked,
    discovered,
    ignored,
    isLoading,
    isSaving,
    error,
    refresh,
    addCompetitor,
    removeCompetitor,
    ignoreCompetitor,
    restoreIgnored,
  }
}

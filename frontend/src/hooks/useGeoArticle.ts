import { useEffect, useRef, useState } from "react"
import { api } from "@/lib/api"

export type GeoArticleBrief = {
  brand: {
    name: string
    url: string
    location: string
  }
  topic: string
  geo_country?: string | null
  target_prompt: {
    id: string
    text: string
    type: string
  }
  recommended_article: {
    title: string
    content_type: string
    action: "CREATE" | "REFRESH" | "OPTIMIZE"
    priority_reason: string
    target_intent: string
    suggested_slug: string
  }
  metrics: {
    own_visibility: number
    own_avg_position: number | null
    own_avg_sentiment: number | null
    evidence_count: number
    days_analyzed: number
  }
  competitors: {
    name: string
    visibility: number
    avg_position: number | null
    avg_sentiment: number | null
  }[]
  sources_to_reference: {
    domain: string
    title: string | null
    url: string | null
    source_type: string | null
    mentions: number
  }[]
  answer_patterns: string[]
  missing_angles: string[]
  outline: string[]
  faqs: string[]
}

export type GeoArticleDraft = {
  title: string
  meta_description: string
  slug: string
  target_query: string
  search_intent: string
  article_markdown: string
  faq: { question: string; answer: string }[]
  json_ld: string
  needs_data: string[]
}

export type GeoArticleItem = {
  id?: string
  /** unique key derived from the opportunity offset */
  offset: number
  status: "GENERATED" | "BRIEF_ONLY"
  brief: GeoArticleBrief
  article: GeoArticleDraft | null
  generation_error?: string
  created_at?: string
  updated_at?: string
}

export type GeoArticleState = {
  items: GeoArticleItem[]
  total_opportunities: number
  isLoading: boolean
  error: string | null
}

/**
 * Fetches GEO article briefs one at a time from the backend.
 * Each call to `generate` picks the NEXT content-gap opportunity (offset++)
 * so the user can build up a list of multiple briefs.
 */
export function useGeoArticles(projectId: string | null, queryString = "") {
  const [items, setItems] = useState<GeoArticleItem[]>([])
  const [savedItems, setSavedItems] = useState<GeoArticleItem[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Track the next offset to fetch
  const nextOffset = useRef(0)

  // Reset when project or filters change
  useEffect(() => {
    setItems([])
    setSavedItems([])
    setTotal(0)
    setError(null)
    nextOffset.current = 0

    if (!projectId) return

    let cancelled = false
    const savedUrl = `/geoarticles/${projectId}/saved${queryString || ""}`

    void api.get<{ items: GeoArticleItem[]; total_saved: number }>(savedUrl)
      .then((res) => {
        if (cancelled) return
        const savedItems = res.data.items ?? []
        setSavedItems(savedItems)
        nextOffset.current = savedItems.length
          ? Math.max(...savedItems.map(item => item.offset)) + 1
          : 0
      })
      .catch((err) => {
        if (cancelled) return
        console.warn("Failed to load saved content briefs", err)
      })

    return () => {
      cancelled = true
    }
  }, [projectId, queryString])

  /**
   * Fetch the brief at `nextOffset`, optionally generating the full article.
   * Updates `nextOffset` so the NEXT call gets a different opportunity.
   */
  async function generate(options: { withArticle?: boolean } = {}) {
    if (!projectId) return
    setIsLoading(true)
    setError(null)

    const offset = nextOffset.current
    const sep = queryString ? "&" : "?"
    const generateFlag = options.withArticle ? "true" : "false"
    const url = `/geoarticles/${projectId}${queryString}${sep}generate=${generateFlag}&offset=${offset}`

    try {
      const res = await api.get<{
        status: "GENERATED" | "BRIEF_ONLY"
        saved_content_brief_id?: string
        brief: GeoArticleBrief
        article: GeoArticleDraft | null
        total_opportunities: number
        current_offset: number
        generation_error?: string
      }>(url)

      const data = res.data
      setTotal(data.total_opportunities)

      setItems(prev => {
        // If we already have this offset, update it (e.g. regenerated article)
        const existing = prev.findIndex(i => i.offset === offset)
        const item: GeoArticleItem = {
          offset,
          id: data.saved_content_brief_id,
          status: data.status,
          brief: data.brief,
          article: data.article,
          generation_error: data.generation_error,
        }
        if (existing >= 0) {
          const next = [...prev]
          next[existing] = item
          return next
        }
        return [...prev, item]
      })

      setSavedItems(prev => {
        const existing = prev.findIndex(i => i.id === data.saved_content_brief_id || i.offset === offset)
        const item: GeoArticleItem = {
          offset,
          id: data.saved_content_brief_id,
          status: data.status,
          brief: data.brief,
          article: data.article,
          generation_error: data.generation_error,
        }

        if (existing >= 0) {
          const next = [...prev]
          next[existing] = item
          return next
        }

        return [item, ...prev]
      })

      // Advance offset for the next call
      nextOffset.current = offset + 1

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load GEO article"
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Regenerate the full article for a brief that was fetched as BRIEF_ONLY.
   * Does NOT advance the offset — it re-fetches the same opportunity.
   */
  async function generateArticle(offset: number) {
    if (!projectId) return
    setIsLoading(true)
    setError(null)

    const sep = queryString ? "&" : "?"
    const url = `/geoarticles/${projectId}${queryString}${sep}generate=true&offset=${offset}`

    try {
      const res = await api.get<{
        status: "GENERATED" | "BRIEF_ONLY"
        saved_content_brief_id?: string
        brief: GeoArticleBrief
        article: GeoArticleDraft | null
        total_opportunities: number
        current_offset: number
        generation_error?: string
      }>(url)

      const data = res.data
      setItems(prev => prev.map(i =>
        i.offset === offset
          ? { ...i, id: data.saved_content_brief_id ?? i.id, status: data.status, article: data.article, generation_error: data.generation_error }
          : i
      ))
      setSavedItems(prev => {
        const existing = prev.findIndex(i => i.id === data.saved_content_brief_id || i.offset === offset)
        const item = prev[existing]
        const nextItem: GeoArticleItem = {
          ...(item ?? {}),
          offset,
          id: data.saved_content_brief_id ?? item?.id,
          status: data.status,
          brief: data.brief,
          article: data.article,
          generation_error: data.generation_error,
        }

        if (existing >= 0) {
          const next = [...prev]
          next[existing] = nextItem
          return next
        }

        return [nextItem, ...prev]
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate article"
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const canGenerateMore = total === 0 || nextOffset.current < total

  return {
    items,
    savedItems,
    total,
    isLoading,
    error,
    generate,
    generateArticle,
    canGenerateMore,
  }
}

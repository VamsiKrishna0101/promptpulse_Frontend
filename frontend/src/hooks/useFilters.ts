import { useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useProjects } from "@/hooks/useProjects"
import { MODEL_FILTER_OPTIONS } from "@/lib/aiModels"

export type FilterOptions = {
    topics: string[]
    tags: string[]
    intents: string[]
    countries: { value: string; label: string }[]
}

export const DAYS_OPTIONS = [
    { label: "Last 7 days",  value: "7"  },
    { label: "Last 14 days", value: "14" },
    { label: "Last 30 days", value: "30" },
    { label: "Last 90 days", value: "90" },
    { label: "All time",     value: ""   },
]

export const MODEL_OPTIONS = MODEL_FILTER_OPTIONS

export function useFilters() {
    const [searchParams, setSearchParams] = useSearchParams()

    const days  = searchParams.get("days")  ?? "7"
    const model = searchParams.get("model") ?? ""
    const topic = searchParams.get("topic") ?? ""
    const country = searchParams.get("country") ?? ""
    const intent = searchParams.get("intent") ?? ""
    const tag = searchParams.get("tag") ?? ""
    const mentioned = searchParams.get("mentioned") ?? ""
    const cited = searchParams.get("cited") ?? ""

    function setFilter(key: string, value: string) {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev)
            if (value) next.set(key, value)
            else       next.delete(key)
            return next
        }, { replace: true })
    }

    // Build the query string to append to fetch URLs
    const queryString = (() => {
        const p = new URLSearchParams()
        if (days)  p.set("days",  days)
        if (model) p.set("model", model)
        if (topic) p.set("topic", topic)
        if (country) p.set("country", country)
        if (intent) p.set("intent", intent)
        if (tag) p.set("tag", tag)
        if (mentioned) p.set("mentioned", mentioned)
        if (cited) p.set("cited", cited)
        return p.toString() ? `?${p.toString()}` : ""
    })()

    return { days, model, topic, country, intent, tag, mentioned, cited, setFilter, queryString }
}

export function useFilterOptions() {
    const { selectedProject } = useProjects()
    const [options, setOptions] = useState<FilterOptions>({ topics: [], tags: [], intents: [], countries: [] })

    useEffect(() => {
        if (!selectedProject) return
        api.get<Partial<FilterOptions>>(`/dashboard/${selectedProject.id}/filters`)
            .then(r => setOptions({
                topics: Array.isArray(r.data.topics) ? r.data.topics : [],
                tags: Array.isArray(r.data.tags) ? r.data.tags : [],
                intents: Array.isArray(r.data.intents) ? r.data.intents : [],
                countries: Array.isArray(r.data.countries) ? r.data.countries : [],
            }))
            .catch(() => {})
    }, [selectedProject?.id])

    return options
}

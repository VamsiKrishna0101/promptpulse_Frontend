import { useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useProjects } from "@/hooks/useProjects"

export type FilterOptions = {
    topics: string[]
}

export const DAYS_OPTIONS = [
    { label: "Last 7 days",  value: "7"  },
    { label: "Last 14 days", value: "14" },
    { label: "Last 30 days", value: "30" },
    { label: "Last 90 days", value: "90" },
    { label: "All time",     value: ""   },
]

export const MODEL_OPTIONS = [
    { label: "All Models",  value: "" },
    { label: "ChatGPT",     value: "chatgpt" },
    { label: "Gemini",      value: "gemini" },
    { label: "Perplexity",  value: "perplexity" },
]

export function useFilters() {
    const [searchParams, setSearchParams] = useSearchParams()

    const days  = searchParams.get("days")  ?? "7"
    const model = searchParams.get("model") ?? ""
    const topic = searchParams.get("topic") ?? ""

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
        return p.toString() ? `?${p.toString()}` : ""
    })()

    return { days, model, topic, setFilter, queryString }
}

export function useFilterOptions() {
    const { selectedProject } = useProjects()
    const [options, setOptions] = useState<FilterOptions>({ topics: [] })

    useEffect(() => {
        if (!selectedProject) return
        api.get(`/dashboard/${selectedProject.id}/filters`)
            .then(r => setOptions(r.data))
            .catch(() => {})
    }, [selectedProject?.id])

    return options
}

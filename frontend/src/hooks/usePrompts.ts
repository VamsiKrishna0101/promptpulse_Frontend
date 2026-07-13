import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export type PromptStatus = "ACTIVE" | "SUGGESTED" | "INACTIVE" | "ARCHIVED" | "DELETED"

export type PromptRow = {
    id: string
    text: string
    topic: string
    type: string
    tags: string[]
    status: PromptStatus
    source: string
    priority_score: number | null
    volume_score: number | null
    total_chats: number
    visibility: number | null
    avg_sentiment: number | null
    avg_position: number | null
    mentions: string[]
    models: string[]
    created_at: string
}

export type PromptStats = {
    total: number
    byStatus: Record<string, number>
}

export type PromptTopic = {
    id: string
    name: string
    created_at: string
    updated_at: string
}

export function usePrompts(projectId: string | null, queryString: string = "") {
    const [prompts, setPrompts] = useState<PromptRow[]>([])
    const [topics, setTopics] = useState<PromptTopic[]>([])
    const [stats, setStats] = useState<PromptStats | null>(null)
    const [isLoading, setIsLoading] = useState(Boolean(projectId))
    const [isFetching, setIsFetching] = useState(false)
    const [isCreatingTopic, setIsCreatingTopic] = useState(false)
    const [isCreatingPrompt, setIsCreatingPrompt] = useState(false)
    const [isDiscoveringPrompts, setIsDiscoveringPrompts] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function refresh({ silent = false }: { silent?: boolean } = {}) {
        if (!projectId) return
        if (silent) setIsFetching(true)
        else setIsLoading(true)
        setError(null)
        try {
            const qs = queryString || ""
            const [promptsRes, statsRes, topicsRes] = await Promise.all([
                api.get<PromptRow[]>(`/prompts/${projectId}${qs}`),
                api.get<PromptStats>(`/prompts/${projectId}/stats`),
                api.get<{ topics: PromptTopic[] }>(`/prompts/${projectId}/topics`),
            ])
            setPrompts(promptsRes.data)
            setStats(statsRes.data)
            setTopics(topicsRes.data.topics ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load prompts")
        } finally {
            if (silent) setIsFetching(false)
            else setIsLoading(false)
        }
    }

    useEffect(() => {
        void refresh({ silent: prompts.length > 0 })
    }, [projectId, queryString])

    const activate = async (promptId: string) => {
        await api.post(`/prompts/${promptId}/activate`)
        setPrompts((rows) => rows.filter((row) => row.id !== promptId))
        void refresh({ silent: true })
    }

    const deactivate = async (promptId: string) => {
        await api.post(`/prompts/${promptId}/deactivate`)
        setPrompts((rows) => rows.filter((row) => row.id !== promptId))
        void refresh({ silent: true })
    }

    const createTopic = async (name: string) => {
        if (!projectId) throw new Error("Project is required")

        setIsCreatingTopic(true)
        setError(null)
        try {
            const response = await api.post<{ topic: PromptTopic }>(`/prompts/${projectId}/topics`, { name })
            setTopics((current) => {
                const withoutDuplicate = current.filter((topic) => topic.name.toLowerCase() !== response.data.topic.name.toLowerCase())
                return [...withoutDuplicate, response.data.topic].sort((a, b) => a.name.localeCompare(b.name))
            })
            return response.data.topic
        } finally {
            setIsCreatingTopic(false)
        }
    }

    const createPrompt = async (input: { text: string; topic: string }) => {
        if (!projectId) throw new Error("Project is required")

        setIsCreatingPrompt(true)
        setError(null)
        try {
            const response = await api.post<{ prompt: PromptRow }>(`/prompts/${projectId}`, input)
            await refresh({ silent: true })
            return response.data.prompt
        } finally {
            setIsCreatingPrompt(false)
        }
    }

    const discoverPrompts = async () => {
        if (!projectId) throw new Error("Project is required")

        setIsDiscoveringPrompts(true)
        setError(null)
        try {
            const response = await api.post<{ created: number; message: string }>(`/prompts/${projectId}/discovery/run`)
            await refresh({ silent: true })
            return response.data
        } finally {
            setIsDiscoveringPrompts(false)
        }
    }

    return { prompts, topics, stats, isLoading, isFetching, isCreatingTopic, isCreatingPrompt, isDiscoveringPrompts, error, refresh, activate, deactivate, createTopic, createPrompt, discoverPrompts }
}

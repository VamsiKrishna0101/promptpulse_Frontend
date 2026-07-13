import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export type AnswerBlock =
    | { type: "heading"; text: string; level: 2 | 3 }
    | { type: "paragraph"; text: string }
    | { type: "list"; items: string[] }
    | { type: "comparison"; headers: string[]; rows: string[][] }

export type RecentChat = {
    id: string
    ai_model: string
    prompt_text: string
    excerpt: string
    raw_response?: string
    answer_blocks?: AnswerBlock[] | null
    brand_mentioned: boolean
    brand_position: number | null
    sentiment_score: number | null
    brands: string[]
    brand_details?: { brand_name: string, sentiment_score: number | null, position: number | null }[]
    sources?: { url: string, domain: string, title: string | null }[]
    ran_at: string
}

export function useRecentChats(projectId: string | null, queryString: string = "") {
    const [chats, setChats] = useState<RecentChat[]>([])
    const [isLoading, setIsLoading] = useState(Boolean(projectId))

    useEffect(() => {
        if (!projectId) return
        setIsLoading(true)
        api.get<RecentChat[]>(`/dashboard/${projectId}/recent-chats${queryString}`)
            .then(res => setChats(res.data))
            .catch(() => setChats([]))
            .finally(() => setIsLoading(false))
    }, [projectId, queryString])

    return { chats, isLoading }
}

export type ChatsPageResponse = {
    data: RecentChat[]
    page: number
    page_size: number
    total: number
    total_pages: number
}

export function useChatsPage(projectId: string | null, queryString: string = "", page = 1, pageSize = 20) {
    const [result, setResult] = useState<ChatsPageResponse>({
        data: [],
        page: 1,
        page_size: pageSize,
        total: 0,
        total_pages: 1,
    })
    const [isLoading, setIsLoading] = useState(Boolean(projectId))

    useEffect(() => {
        if (!projectId) return
        const params = new URLSearchParams(queryString.startsWith("?") ? queryString.slice(1) : queryString)
        params.set("page", String(page))
        params.set("page_size", String(pageSize))

        setIsLoading(true)
        api.get<ChatsPageResponse>(`/dashboard/${projectId}/chats?${params.toString()}`)
            .then(res => setResult(res.data))
            .catch(() => setResult({ data: [], page, page_size: pageSize, total: 0, total_pages: 1 }))
            .finally(() => setIsLoading(false))
    }, [projectId, queryString, page, pageSize])

    return { ...result, chats: result.data, isLoading }
}

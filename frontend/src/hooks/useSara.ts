import { useCallback, useEffect, useState } from "react"
import { api, API_BASE_URL } from "@/lib/api"

export type SaraReadiness = {
    is_ready: boolean
    days_available: number
    required_days: number
    total_chats: number
    first_chat_at: string | null
    last_chat_at: string | null
    recommendations: string[]
}

export type SaraConversation = {
    id: string
    title: string | null
    created_at: string
    updated_at: string
    messages?: SaraMessage[]
}

export type SaraMessage = {
    id: string
    conversation_id: string
    role: "USER" | "ASSISTANT"
    content: string
    citations?: { evidence_id: string; title: string; reason: string }[] | null
    suggested_actions: string[]
    confidence?: string | null
    debug?: SaraDebugTrace | null
    created_at: string
}

export type SaraDebugTrace = {
    internal_mcp: {
        used: boolean
        tool_names: string[]
        section_titles: string[]
    }
    rag: {
        used: boolean
        result_count: number
        document_types: string[]
        top_titles: string[]
    }
}

export type SaraChatResponse = {
    conversation_id: string
    message_id: string
    answer: string
    citations: { evidence_id: string; title: string; reason: string }[]
    suggested_actions: string[]
    confidence: "low" | "medium" | "high"
    debug?: SaraDebugTrace
}

export function useSara(projectId: string | null) {
    const [readiness, setReadiness] = useState<SaraReadiness | null>(null)
    const [conversations, setConversations] = useState<SaraConversation[]>([])
    const [messages, setMessages] = useState<SaraMessage[]>([])
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)

    const refreshReadiness = useCallback(async () => {
        if (!projectId) return
        const response = await api.get<SaraReadiness>(`/sara/${projectId}/readiness`)
        setReadiness(response.data)
    }, [projectId])

    const refreshConversations = useCallback(async () => {
        if (!projectId) return
        const response = await api.get<SaraConversation[]>(`/sara/${projectId}/conversations`)
        setConversations(response.data)
    }, [projectId])

    const loadMessages = useCallback(async (conversationId: string) => {
        if (!projectId) return
        setIsLoading(true)
        setActiveConversationId(conversationId)
        try {
            const response = await api.get<SaraMessage[]>(`/sara/${projectId}/conversations/${conversationId}/messages`)
            setMessages(response.data)
        } finally {
            setIsLoading(false)
        }
    }, [projectId])

    const startNewConversation = useCallback(() => {
        setActiveConversationId(null)
        setMessages([])
    }, [])

    const sendMessage = useCallback(async (content: string, pageContext?: string) => {
        if (!projectId || !content.trim()) return null
        const now = Date.now()
        const userMessage: SaraMessage = {
            id: `local-${now}`,
            conversation_id: activeConversationId ?? "pending",
            role: "USER",
            content,
            suggested_actions: [],
            created_at: new Date().toISOString()
        }
        const assistantMessage: SaraMessage = {
            id: `streaming-${now}`,
            conversation_id: activeConversationId ?? "pending",
            role: "ASSISTANT",
            content: "",
            citations: [],
            suggested_actions: [],
            confidence: null,
            created_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage, assistantMessage])
        setIsSending(true)
        try {
            const response = await fetch(`${API_BASE_URL}/sara/${projectId}/chat/stream`, {
                method: "POST",
                headers: buildStreamHeaders(),
                body: JSON.stringify({
                    message: content,
                    conversation_id: activeConversationId,
                    page_context: pageContext
                })
            })

            if (!response.ok || !response.body) {
                if (response.status === 429) {
                    const errorData = await response.json().catch(() => ({}))
                    if (errorData.error === "SARA_DAILY_LIMIT_REACHED") {
                        throw new Error("You've reached your daily limit for AI questions. Please try again tomorrow or upgrade your plan.")
                    }
                }
                throw new Error("Sara stream failed")
            }

            let conversationId = activeConversationId
            let streamedAnswer = ""
            let finalResponse: SaraChatResponse | null = null

            await readSaraStream(response, {
                ready: (payload) => {
                    conversationId = payload.conversation_id
                    setActiveConversationId(payload.conversation_id)
                    setMessages(prev => prev.map(message => {
                        if (message.id === userMessage.id || message.id === assistantMessage.id) {
                            return { ...message, conversation_id: payload.conversation_id }
                        }
                        return message
                    }))
                },
                token: async (token) => {
                    await revealSaraToken(token, (nextToken) => {
                        streamedAnswer += nextToken
                        setMessages(prev => prev.map(message => (
                            message.id === assistantMessage.id
                                ? { ...message, content: streamedAnswer }
                                : message
                        )))
                    })
                },
                done: (payload) => {
                    finalResponse = {
                        conversation_id: payload.conversation_id,
                        message_id: payload.message_id,
                        answer: streamedAnswer,
                        citations: payload.citations,
                        suggested_actions: payload.suggested_actions,
                        confidence: payload.confidence,
                        debug: payload.debug
                    }
                    setActiveConversationId(payload.conversation_id)
                    setMessages(prev => prev.map(message => (
                        message.id === assistantMessage.id
                            ? {
                                ...message,
                                id: payload.message_id,
                                conversation_id: payload.conversation_id,
                                content: streamedAnswer,
                                citations: payload.citations,
                                suggested_actions: payload.suggested_actions,
                                confidence: payload.confidence,
                                debug: payload.debug
                            }
                            : message.id === userMessage.id
                                ? { ...message, conversation_id: payload.conversation_id }
                                : message
                    )))
                },
                error: (payload) => {
                    if (payload.error === "SARA_DAILY_LIMIT_REACHED") {
                        throw new Error("You've reached your daily limit for AI questions. Please try again tomorrow or upgrade your plan.")
                    }
                    throw new Error(payload.error || "Sara stream failed")
                }
            })

            if (!finalResponse && conversationId) {
                finalResponse = {
                    conversation_id: conversationId,
                    message_id: assistantMessage.id,
                    answer: streamedAnswer,
                    citations: [],
                    suggested_actions: [],
                    confidence: "low"
                }
            }

            void refreshConversations()
            return finalResponse
        } catch (error) {
            setMessages(prev => prev.map(message => (
                message.id === assistantMessage.id
                    ? {
                        ...message,
                        content: error instanceof Error && error.message
                            ? error.message
                            : "Sara could not finish this response. Please try again.",
                        confidence: "low"
                    }
                    : message
            )))
            return null
        } finally {
            setIsSending(false)
        }
    }, [activeConversationId, projectId, refreshConversations])

    useEffect(() => {
        if (!projectId) return
        void refreshReadiness()
        void refreshConversations()
    }, [projectId, refreshConversations, refreshReadiness])

    return {
        readiness,
        conversations,
        messages,
        activeConversationId,
        isLoading,
        isSending,
        refreshReadiness,
        refreshConversations,
        loadMessages,
        startNewConversation,
        sendMessage,
    }
}

type SaraStreamDonePayload = {
    conversation_id: string
    message_id: string
    citations: { evidence_id: string; title: string; reason: string }[]
    suggested_actions: string[]
    confidence: "low" | "medium" | "high"
    debug?: SaraDebugTrace
}

type SaraStreamHandlers = {
    ready: (payload: { conversation_id: string }) => void
    token: (token: string) => void | Promise<void>
    done: (payload: SaraStreamDonePayload) => void
    error: (payload: { error?: string }) => void
}

function buildStreamHeaders() {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }
    const token = localStorage.getItem("promptpulse_access_token")
    if (token) headers.Authorization = `Bearer ${token}`
    return headers
}

async function readSaraStream(response: Response, handlers: SaraStreamHandlers) {
    if (!response.body) return

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split("\n\n")
        buffer = events.pop() ?? ""

        for (const eventText of events) {
            await processSaraStreamEvent(eventText, handlers)
        }
    }

    if (buffer.trim()) {
        await processSaraStreamEvent(buffer, handlers)
    }
}

async function processSaraStreamEvent(eventText: string, handlers: SaraStreamHandlers) {
    const lines = eventText.split("\n")
    const event = lines.find(line => line.startsWith("event:"))?.slice(6).trim()
    const data = lines
        .filter(line => line.startsWith("data:"))
        .map(line => line.slice(5).trim())
        .join("\n")

    if (!event || !data) return

    const payload = JSON.parse(data)
    if (event === "ready") handlers.ready(payload)
    if (event === "token") await handlers.token(payload.token ?? "")
    if (event === "done") handlers.done(payload)
    if (event === "error") handlers.error(payload)
}

async function revealSaraToken(token: string, append: (chunk: string) => void) {
    for (const char of token) {
        append(char)
        await waitForSaraTypingDelay(char)
    }
}

function waitForSaraTypingDelay(char: string) {
    const delay = /[.!?]/.test(char) ? 28 : char === "\n" ? 18 : /\s/.test(char) ? 5 : 9
    return new Promise(resolve => window.setTimeout(resolve, delay))
}

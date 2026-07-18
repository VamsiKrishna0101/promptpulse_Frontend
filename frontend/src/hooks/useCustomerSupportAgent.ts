import { useState } from "react"
import axios from "axios"
import { api } from "@/lib/api"

export type SupportAgentMessage = {
  role: "user" | "assistant"
  content: string
  escalated?: boolean
  ticket_id?: string
}

export type SupportAgentTicket = {
  id: string
  email: string
  subject: string
  message: string
  is_resolved: boolean
  created_at: string
  updated_at: string
}

export type SupportAgentResponse = {
  answer: string
  escalated: boolean
  needs_confirmation: boolean
  ticket: SupportAgentTicket | null
  category: string
  confidence: "high" | "medium" | "low"
  suggested_actions: string[]
}

const INITIAL_MESSAGES: SupportAgentMessage[] = [
  {
    role: "assistant",
    content:
      "Hi, I am PromptPulse Support. Ask me about your subscription, credits, scraping runs, reports, billing, or anything that feels stuck. If it needs a human review, I will ask before creating a ticket with the right context.",
  },
]

export function useCustomerSupportAgent(projectId?: string | null) {
  const [messages, setMessages] = useState<SupportAgentMessage[]>(INITIAL_MESSAGES)
  const [suggestedActions, setSuggestedActions] = useState([
    "Explain my subscription",
    "Why are my credits 0?",
    "Scraping/report failed",
    "Need manual review",
  ])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastTicket, setLastTicket] = useState<SupportAgentTicket | null>(null)

  async function sendMessage(message: string) {
    const clean = message.trim()
    if (!clean || isSending) return null

    const nextMessages: SupportAgentMessage[] = [...messages, { role: "user", content: clean }]
    setMessages(nextMessages)
    setIsSending(true)
    setError(null)

    try {
      const history = nextMessages
        .filter((item) => item.role === "user" || item.role === "assistant")
        .slice(-10)
        .map(({ role, content }) => ({ role, content }))

      const response = await api.post<SupportAgentResponse>("/customer-support-agent/chat", {
        message: clean,
        history,
        project_id: projectId ?? null,
      })

      const data = response.data
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer,
          escalated: data.escalated,
          ticket_id: data.ticket?.id,
        },
      ])
      setSuggestedActions(data.suggested_actions?.length ? data.suggested_actions : suggestedActions)
      if (data.ticket) setLastTicket(data.ticket)
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ?? err.message
        : err instanceof Error
          ? err.message
          : "Support agent failed to respond"
      setError(message)
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I could not answer that cleanly right now. Please try again, or use the manual ticket form and we will review it.",
        },
      ])
      return null
    } finally {
      setIsSending(false)
    }
  }

  function reset() {
    setMessages(INITIAL_MESSAGES)
    setLastTicket(null)
    setError(null)
  }

  return {
    messages,
    suggestedActions,
    isSending,
    error,
    lastTicket,
    sendMessage,
    reset,
  }
}

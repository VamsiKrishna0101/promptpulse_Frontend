import { useEffect, useState } from "react"
import axios from "axios"
import { api } from "@/lib/api"

export type HelpTicket = {
  id: string
  email: string
  subject: string
  message: string
  is_resolved: boolean
  created_at: string
  updated_at: string
}

export type CreateTicketInput = {
  email: string
  subject: string
  message: string
}

export function useHelpCenter() {
  const [tickets, setTickets] = useState<HelpTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<{ tickets: HelpTicket[] }>("/help/tickets")
      setTickets(response.data.tickets ?? [])
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ?? err.message
        : err instanceof Error
          ? err.message
          : "Failed to load support tickets"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function createTicket(input: CreateTicketInput) {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await api.post<{ ticket: HelpTicket }>("/help/tickets", input)
      setTickets((current) => [response.data.ticket, ...current])
      return response.data.ticket
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return {
    tickets,
    isLoading,
    isSubmitting,
    error,
    refresh,
    createTicket,
  }
}

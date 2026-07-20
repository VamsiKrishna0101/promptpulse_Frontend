import { api } from "@/lib/api"

export interface LandingChatAnswer {
  intent: string
  answer: string
  suggestions: string[]
  cta?: {
    label: string
    href: string
  }
}

export interface LandingChatLeadInput {
  email?: string
  name?: string
  company?: string
  message: string
  page_path?: string
}

export async function askLandingChat(message: string, pagePath: string): Promise<LandingChatAnswer> {
  const { data } = await api.post<LandingChatAnswer>("/landing-chat/message", {
    message,
    page_path: pagePath,
  })
  return data
}

export async function sendLandingChatLead(input: LandingChatLeadInput): Promise<{ ok: boolean; message: string }> {
  const { data } = await api.post<{ ok: boolean; message: string }>("/landing-chat/lead", input)
  return data
}

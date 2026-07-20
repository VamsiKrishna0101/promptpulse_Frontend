import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { ArrowRight, Bot, CheckCircle2, Mail, MessageCircle, Send, Sparkles, X } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useToast } from "@/components/ui/Toast"
import { cn } from "@/lib/utils"
import { askLandingChat, sendLandingChatLead } from "./landingChatApi"
import { shouldShowLandingChat } from "./landingChatRoutes"

type ChatRole = "assistant" | "user"

interface ChatMessage {
  id: string
  role: ChatRole
  text: string
  cta_label?: string
  cta_href?: string
}

const QUICK_QUESTIONS = [
  "What plan should I choose?",
  "Which AI engines do you track?",
  "How does the 14-day trial work?",
  "How is PromptPulse different?",
]

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function assistantMessage(text: string, extra?: Pick<ChatMessage, "cta_label" | "cta_href">): ChatMessage {
  return {
    id: newId(),
    role: "assistant",
    text,
    ...extra,
  }
}

function userMessage(text: string): ChatMessage {
  return {
    id: newId(),
    role: "user",
    text,
  }
}

function formatAnswer(text: string) {
  return text.split("\n").filter(Boolean)
}

export function LandingChatWidget() {
  const location = useLocation()
  const toast = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    assistantMessage("Ask me about pricing, AI engines, setup, reports, or whether PromptPulse fits your team. If you want, leave a message and we will follow up."),
  ])
  const [input, setInput] = useState("")
  const [leadEmail, setLeadEmail] = useState("")
  const [leadName, setLeadName] = useState("")
  const [leadCompany, setLeadCompany] = useState("")
  const [leadMessage, setLeadMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLeadSending, setIsLeadSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const isVisible = shouldShowLandingChat(location.pathname)

  const latestUserQuestion = useMemo(() => {
    return [...messages].reverse().find((message) => message.role === "user")?.text ?? ""
  }, [messages])

  const hasUserAskedQuestion = messages.some((message) => message.role === "user")

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }, [isOpen, messages, showLeadForm])

  useEffect(() => {
    if (!isVisible) {
      setIsOpen(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  async function handleAsk(messageText?: string) {
    const nextMessage = (messageText ?? input).trim()
    if (!nextMessage || isSending) return

    setInput("")
    setMessages((current) => [...current, userMessage(nextMessage)])
    setIsSending(true)

    try {
      const answer = await askLandingChat(nextMessage, location.pathname)
      setMessages((current) => [
        ...current,
        assistantMessage(answer.answer, {
          cta_label: answer.cta?.label,
          cta_href: answer.cta?.href,
        }),
      ])
    } catch {
      setMessages((current) => [
        ...current,
        assistantMessage("I could not reach the assistant for a moment. You can leave a message and our team will follow up."),
      ])
      toast.error("Assistant unavailable", "Please try again or leave a message.")
    } finally {
      setIsSending(false)
    }
  }

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = (leadMessage || latestUserQuestion || input).trim()
    if (!message) {
      toast.warning("Add a message", "Tell us what you need help with.")
      return
    }

    setIsLeadSending(true)
    try {
      const response = await sendLandingChatLead({
        email: leadEmail.trim() || undefined,
        name: leadName.trim() || undefined,
        company: leadCompany.trim() || undefined,
        message,
        page_path: location.pathname,
      })
      setShowLeadForm(false)
      setLeadMessage("")
      setMessages((current) => [...current, assistantMessage(response.message)])
      toast.success("Message sent", "We received your question.")
    } catch {
      toast.error("Could not send message", "Please try again in a moment.")
    } finally {
      setIsLeadSending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full border border-slate-900/10 bg-slate-950 text-white shadow-[0_24px_60px_-22px_rgba(15,23,42,0.85)] transition duration-200 hover:-translate-y-0.5 hover:bg-slate-900",
          isOpen && "pointer-events-none scale-95 opacity-0",
        )}
        aria-label="Open PromptPulse chat"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[90] bg-slate-950/30 px-3 py-4 backdrop-blur-sm sm:flex sm:items-end sm:justify-end sm:p-6">
          <section className="ml-auto flex h-[min(720px,calc(100vh-32px))] w-full max-w-[440px] flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_30px_100px_-35px_rgba(15,23,42,0.75)]">
            <header className="relative overflow-hidden bg-black px-5 py-4 text-white">
              <div className="absolute inset-0 bg-black" />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-lg">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-black">Ask PromptPulse</h2>
                    <p className="text-xs font-medium text-slate-300">Pricing, setup, engines, reports, demos.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close PromptPulse chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_52%,#f8fafc_100%)] p-5">
              {!hasUserAskedQuestion && (
                <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.6)]">
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-950">
                    <Sparkles className="h-3.5 w-3.5" />
                    Fast answers
                  </div>
                  <div className="grid gap-2">
                    {QUICK_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => handleAsk(question)}
                        disabled={isSending}
                        className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span>{question}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                        message.role === "user"
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-white text-slate-700",
                      )}
                    >
                      {formatAnswer(message.text).map((line) => (
                        <p key={line} className="mb-2 last:mb-0">
                          {line}
                        </p>
                      ))}
                      {message.cta_label && message.cta_href && (
                        <Link
                          to={message.cta_href}
                          onClick={() => setIsOpen(false)}
                          className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
                        >
                          {message.cta_label}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm">
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {showLeadForm && (
                <form onSubmit={handleLeadSubmit} className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.6)]">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-950">Leave a message</p>
                      <p className="text-xs text-slate-500">Optional email, but needed if you want a reply.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLeadForm(false)}
                      className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Close message form"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-2">
                    <input
                      value={leadEmail}
                      onChange={(event) => setLeadEmail(event.target.value)}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                      placeholder="you@company.com"
                      type="email"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={leadName}
                        onChange={(event) => setLeadName(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                        placeholder="Name"
                      />
                      <input
                        value={leadCompany}
                        onChange={(event) => setLeadCompany(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                        placeholder="Company"
                      />
                    </div>
                    <textarea
                      value={leadMessage}
                      onChange={(event) => setLeadMessage(event.target.value)}
                      className="min-h-24 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                      placeholder="What do you want to ask?"
                    />
                    <button
                      type="submit"
                      disabled={isLeadSending}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLeadSending ? "Sending..." : "Send message"}
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            <footer className="border-t border-slate-200 bg-white p-3">
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  handleAsk()
                }}
                className="flex items-end gap-2 rounded-[22px] border border-slate-200 bg-slate-50 p-2"
              >
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      handleAsk()
                    }
                  }}
                  className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="Ask a question..."
                />
                <button
                  type="button"
                  onClick={() => {
                    setLeadMessage(latestUserQuestion || input)
                    setShowLeadForm(true)
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-950"
                  aria-label="Leave a message"
                >
                  <Mail className="h-4 w-4" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200"
                  aria-label="Send question"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                No bot pressure. Ask anything, or leave a message.
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}

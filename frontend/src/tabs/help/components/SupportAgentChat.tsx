import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ArrowUp, CheckCircle2, MessageSquarePlus, Sparkles, TicketCheck, X } from "lucide-react"
import { useCustomerSupportAgent } from "@/hooks/useCustomerSupportAgent"
import type { Project } from "@/hooks/useProjects"
import supportAgentAvatar from "@/assets/support_agent.png"

export function SupportAgentChat({
  projectId,
  selectedProject,
  onClose,
  onTicketCreated,
}: {
  projectId?: string | null
  selectedProject: Project | null
  onClose: () => void
  onTicketCreated: () => void
}) {
  const [input, setInput] = useState("")
  const { messages, suggestedActions, isSending, error, lastTicket, sendMessage, reset } = useCustomerSupportAgent(projectId)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const lastTicketIdRef = useRef<string | null>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: isSending ? "auto" : "smooth",
    })
  }, [messages.length, messages[messages.length - 1]?.content, isSending])

  useEffect(() => {
    if (lastTicket?.id && lastTicket.id !== lastTicketIdRef.current) {
      lastTicketIdRef.current = lastTicket.id
      onTicketCreated()
    }
  }, [lastTicket, onTicketCreated])

  async function submit(value = input) {
    const clean = value.trim()
    if (!clean || isSending) return
    setInput("")
    await sendMessage(clean)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 px-5 py-6 backdrop-blur-[5px]" onMouseDown={onClose}>
      <div
        className="sara-surface flex h-[min(760px,calc(100vh-56px))] w-[min(980px,calc(100vw-56px))] overflow-hidden rounded-[26px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <section className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="sara-header flex h-[64px] flex-shrink-0 items-center gap-3 px-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-white/55">
              <img src={supportAgentAvatar} alt="Support Agent" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-white">Support Agent</h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-[3px] text-[10px] font-semibold text-emerald-200">
                  <span className="h-[6px] w-[6px] rounded-full bg-[#12B76A]" />
                  Account aware
                </span>
              </div>
              <p className="truncate text-[11.5px] text-slate-400">
                {selectedProject?.brand_name ?? "Project"} / subscription, credits, reports, scraping
              </p>
            </div>
            <button type="button" onClick={reset} className="sara-icon-button" title="New chat">
              <MessageSquarePlus size={16} strokeWidth={2} />
            </button>
            <button type="button" onClick={onClose} className="sara-icon-button" title="Close">
              <X size={16} strokeWidth={2} />
            </button>
          </header>

          <div ref={bodyRef} className="sara-body flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-[820px] space-y-5">
              {messages.length <= 1 && (
                <SupportWelcome suggestedActions={suggestedActions} onPick={(action) => void submit(action)} />
              )}

              {messages.map((message, index) => (
                <SupportBubble
                  key={`${message.role}-${index}`}
                  role={message.role}
                  content={message.content}
                  escalated={message.escalated}
                  ticketId={message.ticket_id}
                />
              ))}

              {isSending && (
                <div className="flex items-center gap-2 pl-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                    <img src={supportAgentAvatar} alt="" className="h-full w-full object-cover" />
                  </div>
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C4C9D4] [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C4C9D4]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C4C9D4] [animation-delay:0.2s]" />
                  </span>
                </div>
              )}

              {lastTicket && (
                <div className="sara-assistant-bubble rounded-[20px] px-4 py-3.5 text-[13px] leading-6 text-[#1D2939]">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#12B76A] text-white">
                      <TicketCheck size={15} />
                    </span>
                    <div>
                      <p className="font-bold text-slate-950">Manual review ticket created</p>
                      <p className="mt-1 text-[12px] text-slate-500">{lastTicket.subject}</p>
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                        Ticket #{lastTicket.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] font-semibold text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>

          <form
            className="border-t border-slate-200/80 bg-white/85 p-4 backdrop-blur"
            onSubmit={(event) => {
              event.preventDefault()
              void submit()
            }}
          >
            <div className="sara-input-shell mx-auto flex max-w-[980px] items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 transition">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    void submit()
                  }
                }}
                placeholder="Ask support about your subscription, credits, billing, reports, or failed runs..."
                className="min-w-0 flex-1 bg-transparent text-[13px] leading-5 text-[#101828] outline-none placeholder:text-[#98A2B3]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white transition hover:bg-[#1D4ED8] disabled:bg-[#E2E5EA] disabled:text-[#98A2B3]"
              >
                <ArrowUp size={16} strokeWidth={2.25} />
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

function SupportWelcome({
  suggestedActions,
  onPick,
}: {
  suggestedActions: string[]
  onPick: (action: string) => void
}) {
  return (
    <div className="mb-2">
      <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">
        <Sparkles size={12} strokeWidth={2.2} />
        Support intelligence
      </div>
      <h3 className="mb-3 max-w-[520px] text-[28px] font-black leading-[1.04] tracking-[-0.055em] text-slate-950">
        Ask support. If it needs a human, we will ask before creating the ticket.
      </h3>
      <p className="mb-6 max-w-[560px] text-[13.5px] leading-6 text-slate-500">
        This agent understands your PromptPulse account context: plan, credits, selected project, tickets, and visible job status.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {suggestedActions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPick(item)}
            className="sara-recommendation group flex items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[13px] font-semibold text-slate-700 transition hover:-translate-y-[1px]"
          >
            {item}
            <ArrowUp size={13} strokeWidth={2.25} className="rotate-45 text-[#C4C9D4] transition group-hover:text-[#2563EB]" />
          </button>
        ))}
      </div>
    </div>
  )
}

function SupportBubble({
  role,
  content,
  escalated,
  ticketId,
}: {
  role: "user" | "assistant"
  content: string
  escalated?: boolean
  ticketId?: string
}) {
  const isUser = role === "user"
  return (
    <div className={["flex items-start gap-2.5", isUser ? "justify-end" : "justify-start"].join(" ")}>
      {!isUser && (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-slate-200">
          <img src={supportAgentAvatar} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className={isUser ? "sara-user-bubble max-w-[76%] rounded-[18px] px-4 py-3 text-[13px] leading-6 text-white" : "sara-assistant-bubble max-w-[82%] rounded-[20px] px-4 py-3.5 text-[13px] leading-6 text-[#1D2939]"}>
        {isUser ? <p className="whitespace-pre-wrap">{content}</p> : <SupportMarkdown content={content} />}
        {escalated && ticketId && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-emerald-700">
            <CheckCircle2 size={12} />
            Ticket created
          </div>
        )}
      </div>
    </div>
  )
}

function SupportMarkdown({ content }: { content: string }) {
  return (
    <div className="sara-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-slate-950">{children}</strong>,
          table: ({ children }) => (
            <div className="my-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full border-collapse text-left text-[12px] leading-5">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-50 text-slate-500">{children}</thead>,
          th: ({ children }) => <th className="border-b border-slate-200 px-3 py-2 font-bold">{children}</th>,
          td: ({ children }) => <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-700">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

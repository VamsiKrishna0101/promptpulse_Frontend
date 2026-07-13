import { useMemo, useState, type FormEvent } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileQuestion,
  HelpCircle,
  Loader2,
  RefreshCcw,
  Send,
  Sparkles,
  TicketCheck,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useHelpCenter } from "@/hooks/useHelpCenter"

const FAQS = [
  {
    question: "What is Refractone?",
    answer: "Refractone helps brands monitor how they appear across AI answers, prompts, citations, competitors, and source opportunities.",
  },
  {
    question: "How often is visibility data refreshed?",
    answer: "Refresh frequency depends on your plan. Starter has weekly refresh capacity, while Growth and Pro are designed for daily monitoring.",
  },
  {
    question: "Why is Sara locked until 7 days of data?",
    answer: "Sara needs enough historical context to give useful recommendations. Seven days gives it trend movement, competitor shifts, and source patterns.",
  },
  {
    question: "What are prompts?",
    answer: "Prompts are the search-style questions we run across AI models to understand whether your brand appears and how it is positioned.",
  },
  {
    question: "What are sources?",
    answer: "Sources are domains, pages, citations, and references that influence AI answers. They help show where visibility is coming from.",
  },
  {
    question: "How is brand visibility calculated?",
    answer: "Visibility is based on how often your brand appears in tracked AI responses, weighted by mentions, model coverage, position, and context.",
  },
  {
    question: "Why are AI model answers different each run?",
    answer: "AI models can vary responses based on live retrieval, model updates, prompt wording, and stochastic generation. We track trends instead of relying on one answer.",
  },
  {
    question: "How do I install Web Analytics?",
    answer: "Open Web Analytics, create a site, then copy the tracking script into your website head tag.",
  },
  {
    question: "How does billing and trial work?",
    answer: "New subscriptions start with a 7-day trial. After that, billing follows the plan selected in Stripe unless cancelled before renewal.",
  },
]

// "agent" removed — it was a placeholder that just redirected to the same ticket form.
type HelpSection = "faq" | "write"

function getSection(search: string): HelpSection | null {
  const value = new URLSearchParams(search).get("section")
  return value === "faq" || value === "write" ? value : null
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function HubCard({
  icon,
  title,
  description,
  badge,
  tone,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  badge: string
  tone: "blue" | "green"
  onClick: () => void
}) {
  const iconToneClass = {
    blue: "bg-[#EFF6FF] text-[#2563EB]",
    green: "bg-[#ECFDF3] text-[#047857]",
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-2xl border border-[#E2E5EA] bg-white p-6 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:-translate-y-1 hover:border-[#BFD4FB] hover:shadow-[0_20px_48px_-32px_rgba(37,99,235,0.4)]"
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconToneClass}`}>{icon}</span>
        <span className="rounded-full border border-[#E2E5EA] bg-[#F7F8FA] px-2.5 py-1 text-[10.5px] font-semibold text-[#667085]">
          {badge}
        </span>
      </div>
      <div className="mt-6">
        <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-[#0F172A]">{title}</h3>
        <p className="mt-2.5 text-[12.5px] leading-6 text-[#667085]">{description}</p>
      </div>
      <div className="mt-5 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#2563EB]">
        Open section
        <ArrowRight size={14} className="transition group-hover:translate-x-1" />
      </div>
    </button>
  )
}

function FaqItem({ question, answer, open, onToggle }: { question: string; answer: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full border-b border-[#EEF0F3] px-5 py-4 text-left last:border-b-0"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13.5px] font-semibold text-[#0F172A]">{question}</p>
        <ChevronDown size={15} className={["flex-shrink-0 text-[#98A2B3] transition", open ? "rotate-180" : ""].join(" ")} />
      </div>
      {open && <p className="mt-3 max-w-3xl text-[12.5px] leading-6 text-[#667085]">{answer}</p>}
    </button>
  )
}

function TicketsPanel({
  tickets,
  error,
  isLoading,
  onRefresh,
}: {
  tickets: ReturnType<typeof useHelpCenter>["tickets"]
  error: string | null
  isLoading: boolean
  onRefresh: () => void
}) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex h-14 items-center justify-between border-b border-[#EEF0F3] px-5">
        <div>
          <p className="text-[14px] font-semibold tracking-[-0.01em] text-[#0F172A]">Previous queries</p>
          <p className="mt-0.5 text-[11.5px] font-medium text-[#98A2B3]">Your support history</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-[#E2E5EA] bg-white px-2.5 text-[11.5px] font-semibold text-[#475467] transition hover:bg-[#F7F8FA]"
        >
          <RefreshCcw size={13} />
          Refresh
        </button>
      </div>

      <div className="max-h-[520px] overflow-y-auto p-4">
        {error && (
          <div className="mb-3 rounded-xl border border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-[12.5px] font-medium text-[#B42318]">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 rounded-xl border border-[#E2E5EA] bg-[#F7F8FA] px-4 py-3 text-[12.5px] font-medium text-[#667085]">
            <Loader2 size={15} className="animate-spin" />
            Loading tickets…
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E2E5EA] bg-[#F7F8FA] px-4 py-10 text-center">
            <TicketCheck size={22} className="mx-auto text-[#98A2B3]" />
            <p className="mt-3 text-[13px] font-semibold text-[#344054]">No queries yet</p>
            <p className="mt-1 text-[12px] text-[#98A2B3]">Write to us and your requests will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-xl border border-[#E2E5EA] bg-[#F7F8FA] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-[#0F172A]">{ticket.subject}</p>
                    <p className="mt-1 text-[11.5px] font-medium text-[#98A2B3]">{formatDate(ticket.created_at)}</p>
                  </div>
                  <span className={["flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold", ticket.is_resolved ? "bg-[#ECFDF3] text-[#047857]" : "bg-[#EFF6FF] text-[#1D4ED8]"].join(" ")}>
                    {ticket.is_resolved ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
                    {ticket.is_resolved ? "Resolved" : "Open"}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-[12.5px] leading-5 text-[#667085]">{ticket.message}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

export function HelpTab() {
  const navigate = useNavigate()
  const location = useLocation()
  const section = getSection(location.search)
  const { user } = useAuth()
  const { tickets, isLoading, isSubmitting, error, refresh, createTicket } = useHelpCenter()
  const [openFaq, setOpenFaq] = useState(0)
  const [email, setEmail] = useState(user?.email ?? "")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const unresolvedCount = useMemo(() => tickets.filter((ticket) => !ticket.is_resolved).length, [tickets])

  function openSection(nextSection: HelpSection) {
    navigate(`/help?section=${nextSection}`)
  }

  function backToHub() {
    navigate("/help")
  }

  async function submitTicket(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setSuccess(null)

    const trimmedEmail = email.trim()
    const trimmedSubject = subject.trim()
    const trimmedMessage = message.trim()

    if (!trimmedEmail || !trimmedSubject || !trimmedMessage) {
      setFormError("Email, subject, and message are required.")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setFormError("Please enter a valid email address.")
      return
    }

    if (trimmedSubject.length < 3) {
      setFormError("Subject must be at least 3 characters.")
      return
    }

    if (trimmedMessage.length < 10) {
      setFormError("Message must be at least 10 characters.")
      return
    }

    try {
      await createTicket({ email: trimmedEmail, subject: trimmedSubject, message: trimmedMessage })
      setSubject("")
      setMessage("")
      setSuccess("Ticket created. We will get back to you soon.")
    } catch (err: any) {
      setFormError(err?.response?.data?.error ?? "Failed to create ticket.")
    }
  }

  if (!section) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_18%_0%,rgba(37,99,235,0.10),transparent_26rem)]" />
          <div className="relative grid gap-8 p-7 lg:grid-cols-[1fr_320px] lg:items-start">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE8FD] bg-[#EFF6FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1D4ED8]">
                <Sparkles size={13} />
                Help center
              </div>
              <h1 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[#0F172A]">
                What do you need help with?
              </h1>
              <p className="mt-2.5 max-w-xl text-[13px] leading-6 text-[#667085]">
                Choose a support path — quick answers, or write directly to us and track it here.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E5EA] bg-[#F7F8FA] p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white shadow-[0_6px_16px_-6px_rgba(37,99,235,0.5)]"
                  style={{ background: "radial-gradient(120% 120% at 20% 15%, #60A5FA 0%, #2563EB 55%, #1D4ED8 100%)" }}
                >
                  <TicketCheck size={16} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#0F172A]">Support status</p>
                  <p className="text-[11px] font-medium text-[#98A2B3]">Current account queue</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-[20px] font-semibold tracking-[-0.02em] text-[#0F172A]">{tickets.length}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">Queries</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-[20px] font-semibold tracking-[-0.02em] text-[#1D4ED8]">{unresolvedCount}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7DA2E8]">Open</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <HubCard
            icon={<HelpCircle size={20} />}
            title="FAQs"
            description="Quick answers for visibility, prompts, sources, billing, Sara, and product setup."
            badge="Instant"
            tone="blue"
            onClick={() => openSection("faq")}
          />
          <HubCard
            icon={<Send size={20} />}
            title="Write to us"
            description="Open a focused ticket page with the form and your previous support queries."
            badge="Ticket"
            tone="green"
            onClick={() => openSection("write")}
          />
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={backToHub}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E2E5EA] bg-white px-2.5 text-[11.5px] font-semibold text-[#344054] transition hover:bg-[#F7F8FA]"
          >
            <ArrowLeft size={13} />
            Help center
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openSection("faq")}
              className={["h-8 rounded-lg px-3 text-[11.5px] font-semibold transition", section === "faq" ? "bg-[#2563EB] text-white shadow-[0_1px_2px_rgba(37,99,235,0.3)]" : "border border-[#E2E5EA] bg-white text-[#475467] hover:bg-[#F7F8FA]"].join(" ")}
            >
              FAQs
            </button>
            <button
              type="button"
              onClick={() => openSection("write")}
              className={["h-8 rounded-lg px-3 text-[11.5px] font-semibold transition", section === "write" ? "bg-[#2563EB] text-white shadow-[0_1px_2px_rgba(37,99,235,0.3)]" : "border border-[#E2E5EA] bg-white text-[#475467] hover:bg-[#F7F8FA]"].join(" ")}
            >
              Write
            </button>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2563EB]">
            {section === "faq" ? "Self serve" : "Support ticket"}
          </p>
          <h1 className="mt-1.5 text-[22px] font-semibold tracking-[-0.02em] text-[#0F172A]">
            {section === "faq" ? "FAQs" : "Write to us"}
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-6 text-[#667085]">
            {section === "faq"
              ? "Search through the most common product, billing, Sara, and data questions before opening a ticket."
              : "Send us context and track your previous support queries from this page."}
          </p>
        </div>
      </section>

      {section === "faq" && (
        <section className="overflow-hidden rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
            <div className="border-b border-[#EEF0F3] bg-[#F7F8FA] p-5 lg:border-b-0 lg:border-r">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <FileQuestion size={18} />
              </div>
              <h3 className="mt-3.5 text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">Quick answers first</h3>
              <p className="mt-2 text-[12px] leading-5 text-[#667085]">
                If this doesn't solve it, write to us and the history stays attached to your account.
              </p>
              <button
                type="button"
                onClick={() => openSection("write")}
                className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E2E5EA] bg-white px-2.5 text-[11.5px] font-semibold text-[#344054] transition hover:bg-white/70"
              >
                Open ticket page
                <ArrowRight size={12.5} />
              </button>
            </div>
            <div>
              {FAQS.map((faq, index) => (
                <FaqItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  open={openFaq === index}
                  onToggle={() => setOpenFaq((current) => current === index ? -1 : index)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {section === "write" && (
        // Breakpoint lowered from xl to lg so the ticket panel sits beside the form
        // on normal laptop widths instead of stacking below and forcing a scroll.
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <form onSubmit={submitTicket} className="rounded-2xl border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="mb-4 flex items-start gap-3 border-b border-[#EEF0F3] pb-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#ECFDF3] text-[#047857]">
                <Send size={17} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">Create support query</h2>
                <p className="mt-0.5 text-[12px] leading-5 text-[#667085]">Tell us what happened.</p>
              </div>
            </div>

            <div className="grid gap-3.5 md:grid-cols-2">
              <label className="block">
                <span className="text-[11.5px] font-semibold text-[#344054]">Email</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="mt-1.5 h-9 w-full rounded-lg border border-[#E2E5EA] bg-white px-3 text-[13px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#98A2B3] focus:border-[#93B8F8] focus:ring-4 focus:ring-[#2563EB]/10"
                />
              </label>
              <label className="block">
                <span className="text-[11.5px] font-semibold text-[#344054]">Subject</span>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="What do you need help with?"
                  className="mt-1.5 h-9 w-full rounded-lg border border-[#E2E5EA] bg-white px-3 text-[13px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#98A2B3] focus:border-[#93B8F8] focus:ring-4 focus:ring-[#2563EB]/10"
                />
              </label>
            </div>
            <label className="mt-3.5 block">
              <span className="text-[11.5px] font-semibold text-[#344054]">Message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Share the issue, page, account context, or anything we should know…"
                rows={6}
                className="mt-1.5 w-full resize-none rounded-lg border border-[#E2E5EA] bg-white px-3 py-2.5 text-[13px] font-medium leading-6 text-[#0F172A] outline-none transition placeholder:text-[#98A2B3] focus:border-[#93B8F8] focus:ring-4 focus:ring-[#2563EB]/10"
              />
            </label>
            {(formError || success) && (
              <div className={["mt-3.5 rounded-lg px-3.5 py-2.5 text-[12px] font-medium", formError ? "border border-[#FDA29B] bg-[#FEF3F2] text-[#B42318]" : "border border-[#B7EFCF] bg-[#ECFDF3] text-[#047857]"].join(" ")}>
                {formError ?? success}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 flex h-9 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(37,99,235,0.3)] transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send ticket
            </button>
          </form>
          <TicketsPanel tickets={tickets} error={error} isLoading={isLoading} onRefresh={() => void refresh()} />
        </section>
      )}
    </div>
  )
}

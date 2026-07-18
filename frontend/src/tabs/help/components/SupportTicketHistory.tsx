import { CheckCircle2, Clock3, RefreshCcw } from "lucide-react"
import type { HelpTicket } from "@/hooks/useHelpCenter"

export function SupportTicketHistory({
  tickets,
  isLoading,
  onRefresh,
}: {
  tickets: HelpTicket[]
  isLoading: boolean
  onRefresh: () => void
}) {
  return (
    <section className="rounded-3xl border border-[#E3E8F0] bg-white shadow-[0_18px_58px_-48px_rgba(15,23,42,0.42)]">
      <div className="flex items-center justify-between border-b border-[#EEF2F6] px-5 py-4">
        <div>
          <h3 className="text-[14px] font-black text-[#101828]">Recent tickets</h3>
          <p className="mt-1 text-[11.5px] font-semibold text-[#98A2B3]">Manual reviews created by you or the agent</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[#E3E8F0] bg-white px-2.5 text-[11.5px] font-bold text-[#475467] transition hover:bg-[#F8FAFC]"
        >
          <RefreshCcw size={13} />
          Refresh
        </button>
      </div>

      <div className="max-h-[280px] space-y-2 overflow-y-auto p-4">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-[#D9E1EC] bg-[#FAFBFC] p-5 text-center text-[12.5px] font-semibold text-[#667085]">
            Loading support history...
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D9E1EC] bg-[#FAFBFC] p-6 text-center">
            <p className="text-[13px] font-black text-[#344054]">No tickets yet</p>
            <p className="mt-1 text-[12px] text-[#98A2B3]">If the agent escalates something, it will appear here.</p>
          </div>
        ) : (
          tickets.slice(0, 5).map((ticket) => (
            <article key={ticket.id} className="rounded-2xl border border-[#EEF2F6] bg-[#FAFBFC] p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-black text-[#101828]">{ticket.subject}</p>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#667085]">{ticket.message}</p>
                </div>
                <span className={["inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-black", ticket.is_resolved ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#EFF6FF] text-[#1D4ED8]"].join(" ")}>
                  {ticket.is_resolved ? <CheckCircle2 size={11} /> : <Clock3 size={11} />}
                  {ticket.is_resolved ? "Done" : "Open"}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

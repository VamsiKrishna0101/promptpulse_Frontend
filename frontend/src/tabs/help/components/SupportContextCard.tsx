import { CheckCircle2, Clock3, CreditCard, Layers3, LifeBuoy, MapPin, Sparkles } from "lucide-react"
import type { HelpTicket } from "@/hooks/useHelpCenter"
import type { Project } from "@/hooks/useProjects"

export function SupportContextCard({
  email,
  plan,
  selectedProject,
  tickets,
}: {
  email?: string
  plan?: string
  selectedProject: Project | null
  tickets: HelpTicket[]
}) {
  const openTickets = tickets.filter((ticket) => !ticket.is_resolved).length

  return (
    <aside className="space-y-4">
      <section className="overflow-hidden rounded-3xl border border-[#E3E8F0] bg-white shadow-[0_24px_70px_-52px_rgba(15,23,42,0.45)]">
        <div className="relative p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.14),transparent_18rem)]" />
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#101828] text-white shadow-[0_16px_36px_-20px_rgba(15,23,42,0.9)]">
              <LifeBuoy size={19} />
            </div>
            <p className="mt-4 text-[11px] font-black uppercase tracking-[0.16em] text-[#12A875]">Support context</p>
            <h3 className="mt-1 text-[18px] font-black tracking-[-0.02em] text-[#101828]">Account-aware help</h3>
            <p className="mt-2 text-[12.5px] leading-5 text-[#667085]">
              The agent can read your wallet usage, selected project, and support history. It cannot change billing or modify data.
            </p>
          </div>
        </div>

        <div className="grid border-t border-[#EEF2F6]">
          <ContextRow icon={<CreditCard size={15} />} label="Billing model" value={plan ?? "PAYG"} />
          <ContextRow icon={<Sparkles size={15} />} label="Email" value={email ?? "Signed in"} />
          <ContextRow icon={<Layers3 size={15} />} label="Project" value={selectedProject?.brand_name ?? "No project selected"} />
          <ContextRow icon={<MapPin size={15} />} label="Market" value={selectedProject?.brand_location ?? "Not selected"} />
        </div>
      </section>

      <section className="rounded-3xl border border-[#E3E8F0] bg-white p-5 shadow-[0_18px_58px_-48px_rgba(15,23,42,0.38)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-black text-[#101828]">Ticket status</p>
            <p className="mt-1 text-[11.5px] font-semibold text-[#98A2B3]">From Help Center</p>
          </div>
          <span className="rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-black text-[#027A48]">{openTickets} open</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniMetric icon={<Clock3 size={14} />} label="Open" value={openTickets} />
          <MiniMetric icon={<CheckCircle2 size={14} />} label="Total" value={tickets.length} />
        </div>
      </section>
    </aside>
  )
}

function ContextRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#F0F2F5] px-5 py-3.5 last:border-b-0">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#667085]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-black uppercase tracking-[0.12em] text-[#98A2B3]">{label}</p>
        <p className="mt-0.5 truncate text-[13px] font-bold text-[#344054]">{value}</p>
      </div>
    </div>
  )
}

function MiniMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#EEF2F6] bg-[#FAFBFC] p-3">
      <div className="flex items-center gap-2 text-[#667085]">
        {icon}
        <span className="text-[11px] font-black uppercase tracking-[0.1em]">{label}</span>
      </div>
      <p className="mt-2 text-[22px] font-black tracking-[-0.04em] text-[#101828]">{value}</p>
    </div>
  )
}

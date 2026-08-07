import React, { useState, useEffect } from "react"
import {
    PhoneCall,
    MessageCircle,
    Search,
    Briefcase,
    Trash2,
    Edit3,
    ArrowLeft,
    RefreshCw,
    X,
    FileText,
} from "lucide-react"
import {
    fetchLeads,
    updateLead,
    deleteLead,
    type WhatsAppAppointmentLead,
    type LeadStatus,
} from "../../../lib/whatsappApi"

interface Props {
    projectId: string
    onBack: () => void
    onOpenBotConfig?: () => void
}

export const WhatsAppLeadsView: React.FC<Props> = ({ projectId, onBack, onOpenBotConfig }) => {
    const [leads, setLeads] = useState<WhatsAppAppointmentLead[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedLead, setSelectedLead] = useState<WhatsAppAppointmentLead | null>(null)
    const [modalStatus, setModalStatus] = useState<LeadStatus>("PENDING_CALL")
    const [modalNotes, setModalNotes] = useState("")
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        loadLeads()
    }, [projectId, statusFilter])

    async function loadLeads() {
        try {
            setLoading(true)
            const data = await fetchLeads(projectId, statusFilter)
            setLeads(data || [])
        } catch (err) {
            console.error("Failed to fetch leads:", err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSaveStatus() {
        if (!selectedLead) return
        try {
            setUpdating(true)
            await updateLead(selectedLead.id, projectId, {
                status: modalStatus,
                staff_notes: modalNotes,
            })
            setSelectedLead(null)
            await loadLeads()
        } catch (err) {
            console.error("Failed to update lead status:", err)
            alert("Failed to update lead. Please try again.")
        } finally {
            setUpdating(false)
        }
    }

    async function handleDeleteLead(leadId: string) {
        if (!confirm("Are you sure you want to delete this customer inquiry?")) return
        try {
            await deleteLead(leadId, projectId)
            await loadLeads()
        } catch (err) {
            console.error("Failed to delete lead:", err)
        }
    }

    function openEditModal(lead: WhatsAppAppointmentLead) {
        setSelectedLead(lead)
        setModalStatus(lead.status)
        setModalNotes(lead.staff_notes || "")
    }

    const filteredLeads = leads.filter((lead) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            lead.patient_name.toLowerCase().includes(q) ||
            lead.patient_phone.includes(q) ||
            lead.service_requested.toLowerCase().includes(q) ||
            (lead.doctor_requested && lead.doctor_requested.toLowerCase().includes(q))
        )
    })

    const pendingCount = leads.filter((l) => l.status === "PENDING_CALL").length
    const calledCount = leads.filter((l) => l.status === "CALLED").length
    const confirmedCount = leads.filter((l) => l.status === "APPOINTMENT_CONFIRMED").length

    return (
        <div className="flex flex-col gap-5">
            {/* ── Breadcrumb / Back ─────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-600 transition shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Assistant
                </button>
                <span className="text-xs text-zinc-300">/</span>
                <span className="text-xs font-semibold text-zinc-700">Customer Leads Desk</span>
            </div>

            {/* ─── Top Header Bar ────────────────────────────────────────────── */}
            <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(24,24,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.05) 1px, transparent 1px)",
                        backgroundSize: "36px 36px",
                        maskImage: "radial-gradient(ellipse 55% 90% at 0% 0%, black 15%, transparent 75%)",
                        WebkitMaskImage: "radial-gradient(ellipse 55% 90% at 0% 0%, black 15%, transparent 75%)",
                    }}
                />

                <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 ring-1 ring-zinc-200 text-zinc-700">
                            <FileText size={20} strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
                                    Customer Desk
                                </span>
                                {pendingCount > 0 && (
                                    <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                        {pendingCount} Pending Follow-up
                                    </span>
                                )}
                            </div>
                            <h1 className="text-[19px] font-bold leading-tight tracking-tight text-zinc-950">
                                Customer Inquiries & Leads Desk
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={loadLeads}
                            disabled={loading}
                            className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition"
                            title="Refresh Leads"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                        {onOpenBotConfig && (
                            <button
                                type="button"
                                onClick={onOpenBotConfig}
                                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-zinc-800 transition"
                            >
                                Configure Bot & Services
                            </button>
                        )}
                    </div>
                </div>

                {/* ─── KPI Strip ─────────────────────────────────────────────────── */}
                <div className="relative mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 pt-3.5 border-t border-zinc-100">
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-3 py-2">
                        <p className="text-[10.5px] font-medium text-zinc-400">Total Inquiries</p>
                        <p className="mt-0.5 text-[17px] font-bold tracking-tight text-zinc-900">{leads.length}</p>
                    </div>

                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-3 py-2">
                        <p className="text-[10.5px] font-medium text-rose-600">Pending Follow-up</p>
                        <p className="mt-0.5 text-[17px] font-bold tracking-tight text-rose-600">{pendingCount}</p>
                    </div>

                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-3 py-2">
                        <p className="text-[10.5px] font-medium text-amber-600">In Progress</p>
                        <p className="mt-0.5 text-[17px] font-bold tracking-tight text-amber-600">{calledCount}</p>
                    </div>

                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-3 py-2">
                        <p className="text-[10.5px] font-medium text-emerald-600">Confirmed Bookings</p>
                        <p className="mt-0.5 text-[17px] font-bold tracking-tight text-emerald-600">{confirmedCount}</p>
                    </div>
                </div>
            </section>

            {/* ─── Search and Filter Bar ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="relative flex-1 w-full sm:w-auto">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search customer name, phone, service, or specialist..."
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    {["ALL", "PENDING_CALL", "CALLED", "APPOINTMENT_CONFIRMED", "CANCELLED"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                statusFilter === st
                                    ? "bg-zinc-900 text-white"
                                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                            }`}
                        >
                            {st === "ALL" && "All Inquiries"}
                            {st === "PENDING_CALL" && "🔴 Pending Call"}
                            {st === "CALLED" && "🟡 Contacted"}
                            {st === "APPOINTMENT_CONFIRMED" && "🟢 Confirmed"}
                            {st === "CANCELLED" && "⚪ Closed"}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Leads Table ───────────────────────────────────────────────── */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-700">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
                            <tr>
                                <th className="py-3 px-4">Customer Info</th>
                                <th className="py-3 px-4">Service & Specialist</th>
                                <th className="py-3 px-4">Requested Slot</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Created</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-zinc-400">
                                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-700 mr-2" />
                                        Loading customer leads...
                                    </td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-zinc-400 font-medium">
                                        No customer inquiries found matching filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const rawDigits = lead.patient_phone.replace(/\D/g, "")
                                    return (
                                        <tr key={lead.id} className="hover:bg-zinc-50/70 transition">
                                            {/* Customer Info */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-8 w-8 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-xs">
                                                        {lead.patient_name ? lead.patient_name[0].toUpperCase() : "C"}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-zinc-950">
                                                            {lead.patient_name}
                                                        </div>
                                                        <div className="text-zinc-500 font-mono text-[11px] flex items-center gap-1">
                                                            <span>🇮🇳</span> {lead.patient_phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Service & Specialist */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-zinc-900">
                                                    {lead.service_requested || "General Inquiry"}
                                                </div>
                                                {lead.doctor_requested && (
                                                    <div className="text-zinc-500 text-[11px] flex items-center gap-1">
                                                        <Briefcase size={11} className="text-zinc-400" />
                                                        {lead.doctor_requested}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Slot */}
                                            <td className="py-3.5 px-4 font-mono text-zinc-700">
                                                {lead.preferred_time || "Immediate / Flexible"}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                        lead.status === "PENDING_CALL"
                                                            ? "bg-rose-50 text-rose-700 border-rose-200"
                                                            : lead.status === "CALLED"
                                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                                            : lead.status === "APPOINTMENT_CONFIRMED"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-zinc-100 text-zinc-600 border-zinc-200"
                                                    }`}
                                                >
                                                    {lead.status === "PENDING_CALL" && "🔴 Pending Call"}
                                                    {lead.status === "CALLED" && "🟡 Contacted"}
                                                    {lead.status === "APPOINTMENT_CONFIRMED" && "🟢 Confirmed"}
                                                    {lead.status === "CANCELLED" && "⚪ Closed"}
                                                </span>
                                            </td>

                                            {/* Created */}
                                            <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                                                {new Date(lead.created_at).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <a
                                                        href={`https://wa.me/${rawDigits}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition"
                                                        title="Chat on WhatsApp"
                                                    >
                                                        <MessageCircle size={14} />
                                                    </a>
                                                    <a
                                                        href={`tel:${lead.patient_phone}`}
                                                        className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition"
                                                        title="Call Customer Directly"
                                                    >
                                                        <PhoneCall size={14} />
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(lead)}
                                                        className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition"
                                                        title="Update Status / Notes"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteLead(lead.id)}
                                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                        title="Delete Lead"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ─── Status Update Modal ───────────────────────────────────────── */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                            <h3 className="text-base font-bold text-zinc-950">Update Customer Inquiry</h3>
                            <button
                                type="button"
                                onClick={() => setSelectedLead(null)}
                                className="p-1 text-zinc-400 hover:text-zinc-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                            <div className="text-sm font-bold text-zinc-950">{selectedLead.patient_name}</div>
                            <div className="text-xs text-zinc-500 font-mono">{selectedLead.patient_phone} • {selectedLead.service_requested}</div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Update Status</label>
                            <select
                                value={modalStatus}
                                onChange={(e) => setModalStatus(e.target.value as LeadStatus)}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
                            >
                                <option value="PENDING_CALL">🔴 PENDING CALL (Need Follow-up)</option>
                                <option value="CALLED">🟡 CALLED / CONTACTED (In Progress)</option>
                                <option value="APPOINTMENT_CONFIRMED">🟢 CONFIRMED BOOKING</option>
                                <option value="CANCELLED">⚪ CANCELLED / CLOSED</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Staff Notes</label>
                            <textarea
                                rows={3}
                                value={modalNotes}
                                onChange={(e) => setModalNotes(e.target.value)}
                                placeholder="e.g. Called customer, confirmed booking for tomorrow at 11:00 AM."
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedLead(null)}
                                className="px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveStatus}
                                disabled={updating}
                                className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white transition disabled:opacity-50"
                            >
                                {updating ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

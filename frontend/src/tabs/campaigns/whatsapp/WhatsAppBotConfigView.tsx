import { useState, useEffect } from "react"
import { Sparkles,
    Save,
    Plus,
    Trash2,
    CheckCircle2,
    PhoneCall,
    Clock,
    Briefcase,
    HelpCircle,
    Building2,
    Send,
    RotateCcw,
    MessageSquare,
    ArrowLeft,
    Users,
} from "lucide-react"
import { fetchBotConfig,
    updateBotConfig,
    type WhatsAppBotConfig,
    type DepartmentService,
    type DoctorSpecialist,
    type FAQItem,
} from "../../../lib/whatsappApi"

interface Props {
    projectId: string
    onBack: () => void
    onOpenLeads?: () => void
}

export const WhatsAppBotConfigView: React.FC<Props> = ({ projectId, onBack, onOpenLeads }) => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [savedNotice, setSavedNotice] = useState(false)
    const [activeTab, setActiveTab] = useState<"services" | "identity" | "escalation" | "faqs" | "simulator" | "widget">("services")

    const [ setConfig] = useState<WhatsAppBotConfig>({
        id: "",
        account_id: "",
        is_enabled: true,
        business_name: "My Business",
        business_type: "GENERAL",
        greeting_message: "Namaste! 🙏 Welcome to *{business_name}*.\nHow can we help you today?",
        services_catalog: [],
        faq_knowledge_base: [],
        required_fields: ["name", "phone", "service", "slot"],
        escalation_phones: ["+919876543210"],
        escalation_message: "🚨 *NEW CUSTOMER INQUIRY / BOOKING*\n\n👤 *Customer:* {{name}}\n📞 *Phone:* {{phone}}\n💼 *Service / Offering:* {{service}}\n⏰ *Preferred Time / Slot:* {{slot}}\n\n👉 Please follow up with the customer promptly!",
        confirmation_message: "✅ *Inquiry & Booking Received!*\n\nNamaste {{name}}, we have received your request for *{{service}}* for *{{slot}}*.\n\nOur team will reach out shortly on {{phone}} to confirm all details.",
        ai_fallback_enabled: true,
    })

    // ─── Simulator State ────────────────────────────────────────────────────────
    const [simMessages, setSimMessages] = useState<Array<{ sender: "bot" | "user" | "system"; text: string; buttons?: string[]; time: string }>>([
        {
            sender: "bot",
            text: "Namaste! 🙏 Welcome to *My Business*.\nHow can we help you today?",
            buttons: ["📋 View Services & Pricing", "📅 Book Appointment / Inquiry", "💬 Talk to Support"],
            time: "10:30 AM",
        },
    ])
    const [simInput, setSimInput] = useState("")
    const [simStep, setSimStep] = useState<"IDLE" | "ASK_NAME" | "ASK_SERVICE" | "ASK_SLOT" | "DONE">("IDLE")
    const [simCustomer, setSimCustomer] = useState({ name: "", service: "", slot: "" })

    useEffect(() => {
        loadConfig()
    }, [projectId])

    async function loadConfig() {
        try {
            setLoading(true)
            const data = await fetchBotConfig(projectId)
            if (data) {
                setConfig(data)
            }
        } catch (err) {
            console.error("Failed to load bot config:", err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        try {
            setSaving(true)
            const updated = await updateBotConfig(projectId, config)
            setConfig(updated)
            setSavedNotice(true)
            setTimeout(() => setSavedNotice(false), 3000)
        } catch (err) {
            console.error("Failed to save bot config:", err)
            alert("Failed to save configuration. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    // ─── Services / Offerings Helpers ─────────────────────────────────────────

    function addService() {
        const newDept: DepartmentService = {
            id: `service_${Date.now()}`,
            name: "New Service / Department",
            desc: "Description of consultation, service or pricing details",
            fee: "₹500",
            timing: "Mon-Sat: 9:00 AM - 6:00 PM",
            doctors: [],
        }
        setConfig((prev) => ({
            ...prev,
            services_catalog: [...prev.services_catalog, newDept],
        }))
    }

    function removeService(index: number) {
        setConfig((prev) => ({
            ...prev,
            services_catalog: prev.services_catalog.filter((_, i) => i !== index),
        }))
    }

    function updateService(index: number, patch: Partial<DepartmentService>) {
        setConfig((prev) => {
            const copy = [...prev.services_catalog]
            copy[index] = { ...copy[index], ...patch }
            return { ...prev, services_catalog: copy }
        })
    }

    function addProvider(serviceIndex: number) {
        const newDoc: DoctorSpecialist = {
            id: `spec_${Date.now()}`,
            name: "Specialist / Consultant Name",
            title: "Senior Consultant / Specialist",
            timing: "Mon-Fri 10:00 AM - 4:00 PM",
            fee: "₹600",
        }
        setConfig((prev) => {
            const copy = [...prev.services_catalog]
            const docs = copy[serviceIndex].doctors ?? []
            copy[serviceIndex] = { ...copy[serviceIndex], doctors: [...docs, newDoc] }
            return { ...prev, services_catalog: copy }
        })
    }

    function removeProvider(serviceIndex: number, docIndex: number) {
        setConfig((prev) => {
            const copy = [...prev.services_catalog]
            const docs = (copy[serviceIndex].doctors ?? []).filter((_, i) => i !== docIndex)
            copy[serviceIndex] = { ...copy[serviceIndex], doctors: docs }
            return { ...prev, services_catalog: copy }
        })
    }

    function updateProvider(serviceIndex: number, docIndex: number, patch: Partial<DoctorSpecialist>) {
        setConfig((prev) => {
            const copy = [...prev.services_catalog]
            const docs = [...(copy[serviceIndex].doctors ?? [])]
            docs[docIndex] = { ...docs[docIndex], ...patch }
            copy[serviceIndex] = { ...copy[serviceIndex], doctors: docs }
            return { ...prev, services_catalog: copy }
        })
    }

    // ─── FAQ Helpers ───────────────────────────────────────────────────────────

    function addFaq() {
        const newFaq: FAQItem = {
            question: "Customer Question?",
            answer: "Provide the detailed, accurate answer here.",
            category: "General",
        }
        setConfig((prev) => ({
            ...prev,
            faq_knowledge_base: [...prev.faq_knowledge_base, newFaq],
        }))
    }

    function removeFaq(index: number) {
        setConfig((prev) => ({
            ...prev,
            faq_knowledge_base: prev.faq_knowledge_base.filter((_, i) => i !== index),
        }))
    }

    function updateFaq(index: number, patch: Partial<FAQItem>) {
        setConfig((prev) => {
            const copy = [...prev.faq_knowledge_base]
            copy[index] = { ...copy[index], ...patch }
            return { ...prev, faq_knowledge_base: copy }
        })
    }

    // ─── Escalation Phones Helpers ─────────────────────────────────────────────

    function addEscalationPhone() {
        setConfig((prev) => ({
            ...prev,
            escalation_phones: [...prev.escalation_phones, "+91"],
        }))
    }

    function updateEscalationPhone(index: number, val: string) {
        setConfig((prev) => {
            const copy = [...prev.escalation_phones]
            copy[index] = val
            return { ...prev, escalation_phones: copy }
        })
    }

    function removeEscalationPhone(index: number) {
        setConfig((prev) => ({
            ...prev,
            escalation_phones: prev.escalation_phones.filter((_, i) => i !== index),
        }))
    }

    // ─── Simulator Logic ───────────────────────────────────────────────────────

    function resetSimulator() {
        setSimStep("IDLE")
        setSimCustomer({ name: "", service: "", slot: "" })
        setSimMessages([
            {
                sender: "bot",
                text: (config.greeting_message || `Namaste! Welcome to ${config.business_name}`).replace(/\{business_name\}/g, config.business_name),
                buttons: ["📋 View Services & Pricing", "📅 Book Appointment / Inquiry", "💬 Talk to Support"],
                time: "10:30 AM",
            },
        ])
    }

    function handleSimulateAction(actionText: string) {
        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const newMsgs = [...simMessages, { sender: "user" as const, text: actionText, time: timeStr }]

        if (actionText === "📋 View Services & Pricing" || actionText === "📋 View Services") {
            const serviceListText = config.services_catalog
                .map((s, i) => `${i + 1}. *${s.name}* (${s.fee || "Pricing on request"})\n_${s.desc || ""}_${s.doctors?.length ? `\n👤 ${s.doctors.map(d => d.name).join(", ")}` : ""}`)
                .join("\n\n")

            newMsgs.push({
                sender: "bot",
                text: `💼 *${config.business_name} — Services & Offerings*\n\n${serviceListText || "1. General Consultation\n2. Service Inquiries"}\n\n👉 Reply with any service name or click below to proceed!`,
                buttons: ["📅 Book Appointment / Inquiry", "💬 Talk to Support"],
                time: timeStr,
            })
            setSimMessages(newMsgs)
            return
        }

        if (actionText === "📅 Book Appointment / Inquiry" || actionText === "📅 Book Appointment" || simStep === "IDLE") {
            setSimStep("ASK_NAME")
            newMsgs.push({
                sender: "bot",
                text: "📝 *Book / Inquiry Request*\n\nPlease reply with your *Full Name*:",
                time: timeStr,
            })
            setSimMessages(newMsgs)
            return
        }

        if (actionText === "💬 Talk to Support" || actionText === "🚨 24x7 Emergency") {
            newMsgs.push({
                sender: "bot",
                text: `📞 *${config.business_name} — Support Desk*\n\nOur team is available to assist you.\nDirect Phone: ${config.escalation_phones[0] || "+91 98765 43210"}\n\nFeel free to type your question anytime!`,
                time: timeStr,
            })
            setSimMessages(newMsgs)
            return
        }

        if (simStep === "ASK_NAME") {
            setSimCustomer((p) => ({ ...p, name: actionText }))
            setSimStep("ASK_SERVICE")
            newMsgs.push({
                sender: "bot",
                text: `Thank you, *${actionText}*!\n\nWhich *Service or Consultant* are you inquiring about?`,
                time: timeStr,
            })
            setSimMessages(newMsgs)
            return
        }

        if (simStep === "ASK_SERVICE") {
            setSimCustomer((p) => ({ ...p, service: actionText }))
            setSimStep("ASK_SLOT")
            newMsgs.push({
                sender: "bot",
                text: `Noted: *${actionText}*.\n\nWhat is your *preferred Date & Time slot*?\n_(e.g. Today 4 PM, Tomorrow morning)_`,
                time: timeStr,
            })
            setSimMessages(newMsgs)
            return
        }

        if (simStep === "ASK_SLOT") {
            const finalSlot = actionText
            setSimStep("DONE")
            newMsgs.push({
                sender: "bot",
                text: `✅ *Inquiry & Booking Registered!*\n\nNamaste *${simCustomer.name || "Customer"}*, we have received your request for *${simCustomer.service || "Service"}* on *${finalSlot}*.\n\nOur team will reach out shortly on your number to confirm!`,
                time: timeStr,
            })
            newMsgs.push({
                sender: "system",
                text: `🚨 [ESCALATION ALERT TRIGGERED]\nDispatched instant WhatsApp alert to staff: ${config.escalation_phones.join(", ") || "Support Desk"} with customer lead details!`,
                time: timeStr,
            })
            setSimMessages(newMsgs)
            return
        }

        // General fallback
        newMsgs.push({
            sender: "bot",
            text: `Namaste! Our AI assistant is here to help with *${config.business_name}*. Reply with *'Book'* or *'Services'* anytime!`,
            buttons: ["📋 View Services & Pricing", "📅 Book Appointment / Inquiry"],
            time: timeStr,
        })
        setSimMessages(newMsgs)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-700" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5">
            {/* ── Breadcrumb / Back to channels ────────────────────────────── */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-600 transition shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    All Channels
                </button>
                <span className="text-xs text-zinc-300">/</span>
                <span className="text-xs font-semibold text-zinc-700">WhatsApp AI Assistant & Inquiries</span>
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 ring-1 ring-zinc-200">
                            <img
                                src="https://www.google.com/s2/favicons?domain=whatsapp.com&sz=64"
                                alt="WhatsApp"
                                className="h-5 w-5 object-contain"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
                                    AI WhatsApp Assistant
                                </span>
                                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-800">
                                    Dynamic Sync
                                </span>
                            </div>
                            <h1 className="text-[19px] font-bold leading-tight tracking-tight text-zinc-950">
                                Dynamic Catalog & Inquiry Assistant
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {onOpenLeads && (
                            <button
                                type="button"
                                onClick={onOpenLeads}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-zinc-50 transition"
                            >
                                <Users size={14} className="text-zinc-600" />
                                Customer Leads Desk
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-zinc-800 transition disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : savedNotice ? (
                                <CheckCircle2 size={14} className="text-emerald-400" />
                            ) : (
                                <Save size={14} />
                            )}
                            {savedNotice ? "Saved Live!" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── Navigation Tabs ───────────────────────────────────────────── */}
            <div className="flex items-center gap-1.5 border-b border-zinc-200 pb-2 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveTab("services")}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                        activeTab === "services"
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                >
                    <Briefcase size={14} />
                    Services & Catalog ({config.services_catalog.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("identity")}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                        activeTab === "identity"
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                >
                    <Building2 size={14} />
                    Business Identity & Greeting
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("escalation")}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                        activeTab === "escalation"
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                >
                    <PhoneCall size={14} />
                    Staff Escalation & Alerts ({config.escalation_phones.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("faqs")}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                        activeTab === "faqs"
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                >
                    <HelpCircle size={14} />
                    Knowledge Base & FAQs ({config.faq_knowledge_base.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("simulator")}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                        activeTab === "simulator"
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                >
                    <MessageSquare size={14} />
                    Live WhatsApp Simulator
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("widget")}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                        activeTab === "widget"
                            ? "bg-emerald-600 text-white"
                            : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    }`}
                >
                    <Send size={14} />
                    Website Widget & Debug
                </button>
            </div>

            {/* ─── TAB 1: Services & Offerings Catalog ────────────────────────── */}
            {activeTab === "services" && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-zinc-950">Dynamic Services & Offerings Catalog</h3>
                            <p className="text-xs text-zinc-500">
                                Configure your services, consultation fees, and specialist team members. The bot presents these dynamically.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addService}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-zinc-50 transition"
                        >
                            <Plus size={13} />
                            Add Service / Offering
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {config.services_catalog.map((service, sIdx) => (
                            <div
                                key={service.id || sIdx}
                                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="h-8 w-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-xs">
                                            {sIdx + 1}
                                        </div>
                                        <input
                                            type="text"
                                            value={service.name}
                                            onChange={(e) => updateService(sIdx, { name: e.target.value })}
                                            placeholder="Service / Category Name (e.g. Consultation, Hair Styling, Legal Advisory)"
                                            className="text-sm font-bold text-zinc-950 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-500 focus:outline-none flex-1 py-1"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => addProvider(sIdx)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition"
                                        >
                                            <Plus size={12} />
                                            Add Specialist
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeService(sIdx)}
                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                            title="Delete Service"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="md:col-span-2">
                                        <label className="text-[11px] text-zinc-500 font-medium block mb-1">Description & Details</label>
                                        <input
                                            type="text"
                                            value={service.desc || ""}
                                            onChange={(e) => updateService(sIdx, { desc: e.target.value })}
                                            placeholder="e.g. 45-min consultation, diagnostics, or treatment breakdown"
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-zinc-500 font-medium block mb-1">Fee / Price (INR)</label>
                                        <input
                                            type="text"
                                            value={service.fee || ""}
                                            onChange={(e) => updateService(sIdx, { fee: e.target.value })}
                                            placeholder="e.g. ₹500 or Free"
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Specialists / Providers sub-list */}
                                {service.doctors && service.doctors.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-zinc-100 space-y-2">
                                        <label className="text-[11px] font-semibold text-zinc-700">Specialists / Team Members</label>
                                        <div className="space-y-2">
                                            {service.doctors.map((doc, dIdx) => (
                                                <div key={doc.id || dIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 items-center">
                                                    <div className="sm:col-span-4">
                                                        <input
                                                            type="text"
                                                            value={doc.name}
                                                            onChange={(e) => updateProvider(sIdx, dIdx, { name: e.target.value })}
                                                            placeholder="Specialist / Provider Name"
                                                            className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-4">
                                                        <input
                                                            type="text"
                                                            value={doc.title || ""}
                                                            onChange={(e) => updateProvider(sIdx, dIdx, { title: e.target.value })}
                                                            placeholder="Title / Qualification"
                                                            className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-3">
                                                        <input
                                                            type="text"
                                                            value={doc.timing || ""}
                                                            onChange={(e) => updateProvider(sIdx, dIdx, { timing: e.target.value })}
                                                            placeholder="Timings / Days"
                                                            className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-1 flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeProvider(sIdx, dIdx)}
                                                            className="p-1 text-zinc-400 hover:text-rose-600 transition"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── TAB 2: Business Identity & Greeting ────────────────────────── */}
            {activeTab === "identity" && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-5">
                    <div>
                        <h3 className="text-sm font-bold text-zinc-950">Business Identity & Welcome Greeting</h3>
                        <p className="text-xs text-zinc-500">
                            Configure how your WhatsApp bot introduces your business to customers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Business Name</label>
                            <input
                                type="text"
                                value={config.business_name}
                                onChange={(e) => setConfig((prev) => ({ ...prev, business_name: e.target.value }))}
                                placeholder="Your Business / Brand Name"
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">Business Type</label>
                            <select
                                value={config.business_type}
                                onChange={(e) => setConfig((prev) => ({ ...prev, business_type: e.target.value }))}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
                            >
                                <option value="GENERAL">General Services & Business</option>
                                <option value="HOSPITAL">Hospital / Healthcare / Clinic</option>
                                <option value="CONSULTING">Consulting / Agency / Professional</option>
                                <option value="SALON_SPA">Salon / Wellness / Spa</option>
                                <option value="REAL_ESTATE">Real Estate & Property</option>
                                <option value="EDUCATION">Education & Coaching</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                            Initial Greeting Message
                            <span className="text-zinc-400 font-normal ml-2">(Supports *bold* and _italic_)</span>
                        </label>
                        <textarea
                            rows={4}
                            value={config.greeting_message}
                            onChange={(e) => setConfig((prev) => ({ ...prev, greeting_message: e.target.value }))}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 font-mono focus:border-zinc-400 focus:bg-white focus:outline-none"
                        />
                    </div>
                </div>
            )}

            {/* ─── TAB 3: Staff Escalation & Alerts ───────────────────────────── */}
            {activeTab === "escalation" && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-5">
                    <div>
                        <h3 className="text-sm font-bold text-zinc-950">Staff WhatsApp Alert Numbers</h3>
                        <p className="text-xs text-zinc-500">
                            Numbers listed below will receive an instant WhatsApp alert the second a customer submits a booking inquiry!
                        </p>
                    </div>

                    <div className="space-y-3">
                        {config.escalation_phones.map((phone, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-zinc-400 w-6">{idx + 1}.</span>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => updateEscalationPhone(idx, e.target.value)}
                                    placeholder="+919876543210"
                                    className="flex-1 max-w-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 font-mono focus:border-zinc-400 focus:bg-white focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeEscalationPhone(idx)}
                                    className="p-1.5 text-zinc-400 hover:text-rose-600 transition"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addEscalationPhone}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-zinc-50 transition"
                        >
                            <Plus size={13} />
                            Add Alert Phone
                        </button>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                                Staff Alert Message Template
                            </label>
                            <textarea
                                rows={5}
                                value={config.escalation_message || ""}
                                onChange={(e) => setConfig((prev) => ({ ...prev, escalation_message: e.target.value }))}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 font-mono focus:border-zinc-400 focus:bg-white focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                                Customer Confirmation Message
                            </label>
                            <textarea
                                rows={4}
                                value={config.confirmation_message || ""}
                                onChange={(e) => setConfig((prev) => ({ ...prev, confirmation_message: e.target.value }))}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 font-mono focus:border-zinc-400 focus:bg-white focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ─── TAB 4: Knowledge Base & FAQs ─────────────────────────────── */}
            {activeTab === "faqs" && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-zinc-950">Knowledge Base & FAQs</h3>
                            <p className="text-xs text-zinc-500">
                                Add policies, business hours, payment options, and FAQs. The AI answers customer questions accurately.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addFaq}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-zinc-50 transition"
                        >
                            <Plus size={13} />
                            Add FAQ
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {config.faq_knowledge_base.map((faq, idx) => (
                            <div key={idx} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 flex-1">
                                        <HelpCircle size={16} className="text-zinc-500 shrink-0" />
                                        <input
                                            type="text"
                                            value={faq.question}
                                            onChange={(e) => updateFaq(idx, { question: e.target.value })}
                                            placeholder="Question (e.g. Do you offer on-site consultation?)"
                                            className="text-xs font-bold text-zinc-950 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-500 focus:outline-none flex-1 py-1"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFaq(idx)}
                                        className="p-1.5 text-zinc-400 hover:text-rose-600 transition"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <textarea
                                    rows={2}
                                    value={faq.answer}
                                    onChange={(e) => updateFaq(idx, { answer: e.target.value })}
                                    placeholder="Detailed answer..."
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none leading-relaxed"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── TAB 5: Live WhatsApp Simulator ───────────────────────────── */}
            {activeTab === "simulator" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                                    <Sparkles size={16} className="text-zinc-700" />
                                    Interactive Simulation Playground
                                </h3>
                                <p className="text-xs text-zinc-500">
                                    Test the complete end-to-end conversation flow before deploying to live WhatsApp customers.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={resetSimulator}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-zinc-50 transition"
                            >
                                <RotateCcw size={13} />
                                Reset
                            </button>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-zinc-700">Quick Test Actions:</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleSimulateAction("Hello")}
                                    className="rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-3 py-1 text-xs text-zinc-700 transition"
                                >
                                    👋 Send "Hello"
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSimulateAction("📋 View Services & Pricing")}
                                    className="rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-3 py-1 text-xs text-zinc-700 transition"
                                >
                                    📋 View Services Menu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSimulateAction("📅 Book Appointment / Inquiry")}
                                    className="rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-3 py-1 text-xs text-zinc-700 transition"
                                >
                                    📅 Book / Inquire
                                </button>
                            </div>
                        </div>

                        {simStep !== "IDLE" && simStep !== "DONE" && (
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800 flex items-center gap-2">
                                <Clock size={15} className="text-zinc-600 shrink-0" />
                                <div>
                                    <span className="font-bold">Current State: {simStep}</span> — Reply with{" "}
                                    {simStep === "ASK_NAME" && "Customer Full Name (e.g. Ramesh Kumar)"}
                                    {simStep === "ASK_SERVICE" && "Service / Offering Name (e.g. Consultation)"}
                                    {simStep === "ASK_SLOT" && "Preferred Slot (e.g. Tomorrow 4 PM)"}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* WhatsApp Mobile Mockup */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="w-[340px] bg-[#0b141a] rounded-[36px] p-3 border-4 border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-[580px]">
                            {/* Phone top bar */}
                            <div className="bg-[#1f2c34] px-4 py-3 rounded-t-[24px] flex items-center gap-3 border-b border-[#2a3942]">
                                <div className="w-8 h-8 rounded-full bg-zinc-700 text-white flex items-center justify-center font-bold text-xs">
                                    🏢
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-semibold text-white truncate">{config.business_name}</h4>
                                    <p className="text-[10px] text-zinc-400">Verified WhatsApp Business</p>
                                </div>
                            </div>

                            {/* Chat bubble body */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0b141a] text-xs">
                                {simMessages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex flex-col ${
                                            msg.sender === "user"
                                                ? "items-end"
                                                : msg.sender === "system"
                                                ? "items-center"
                                                : "items-start"
                                        }`}
                                    >
                                        {msg.sender === "system" ? (
                                            <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg p-2 text-[10px] my-1 text-center">
                                                {msg.text}
                                            </div>
                                        ) : (
                                            <div
                                                className={`max-w-[85%] rounded-2xl p-3 shadow-md whitespace-pre-wrap leading-relaxed ${
                                                    msg.sender === "user"
                                                        ? "bg-[#005c4b] text-white rounded-tr-none"
                                                        : "bg-[#202c33] text-zinc-200 rounded-tl-none"
                                                }`}
                                            >
                                                <div>{msg.text}</div>
                                                <div className="text-[9px] text-zinc-400 text-right mt-1">{msg.time}</div>

                                                {/* Action Buttons */}
                                                {msg.buttons && msg.buttons.length > 0 && (
                                                    <div className="mt-2.5 pt-2 border-t border-zinc-700/60 space-y-1.5">
                                                        {msg.buttons.map((btn, bIdx) => (
                                                            <button
                                                                key={bIdx}
                                                                type="button"
                                                                onClick={() => handleSimulateAction(btn)}
                                                                className="w-full bg-[#111b21] hover:bg-[#2a3942] text-zinc-200 text-xs py-1.5 px-3 rounded-lg font-medium text-center border border-zinc-700/50 transition flex items-center justify-center gap-1"
                                                            >
                                                                {btn}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Message input bar */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    if (!simInput.trim()) return
                                    handleSimulateAction(simInput)
                                    setSimInput("")
                                }}
                                className="bg-[#1f2c34] p-2 rounded-b-[24px] flex items-center gap-2 border-t border-[#2a3942]"
                            >
                                <input
                                    type="text"
                                    value={simInput}
                                    onChange={(e) => setSimInput(e.target.value)}
                                    placeholder="Type customer response..."
                                    className="flex-1 bg-[#2a3942] border-none rounded-full px-3.5 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-[#005c4b] hover:bg-[#007a63] text-white rounded-full transition flex items-center justify-center"
                                >
                                    <Send size={13} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── TAB 6: Website Widget & Webhook Debug ─────────────────────── */}
            {activeTab === "widget" && (
                <WidgetAndDebugTab config={} />
            )}
        </div>
    )
}

// ─── Website Widget & Webhook Debug Panel ─────────────────────────────────────

function WidgetAndDebugTab({}: { config: WhatsAppBotConfig }) {
    const [btnText, setBtnText] = useState("💬 Chat on WhatsApp")
    const [copied, setCopied] = useState(false)
    const [ setWebhookUrl] = useState("")

    // Derive phone from account_id placeholder (user sets this in identity tab or we read from account)
    const waPhone = "919951064098" // pulled from connected account - replace with prop if needed

    const waLink = `https://wa.me/${waPhone}?text=Hi`

    const embedCode = `<!-- WhatsApp Chat Button by PromptPulse -->
<a href="${waLink}" target="_blank" rel="noopener noreferrer"
   style="display:inline-flex;align-items:center;gap:10px;background:#25D366;color:#fff;
          font-family:sans-serif;font-size:16px;font-weight:600;padding:14px 24px;
          border-radius:50px;text-decoration:none;box-shadow:0 4px 20px rgba(37,211,102,0.4);">
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
  ${btnText}
</a>`

    function copyCode() {
        navigator.clipboard.writeText(embedCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const WEBHOOK_CHECKS = [
        {
            id: 1,
            label: "Webhook Verified in Meta (green checkmark ✅)",
            detail: "In Meta Developer Portal → WhatsApp → Configuration → Webhook must show 'Verified'.",
        },
        {
            id: 2,
            label: "App is in 'Live' mode (not Development)",
            detail: "At the top of Meta Developer portal, the toggle must say 'Live'. In Development mode, Meta blocks ALL real messages.",
        },
        {
            id: 3,
            label: "'messages' webhook field is Subscribed",
            detail: "In Webhook Fields list, the 'messages' row must show 'Subscribed'. Click Subscribe if it doesn't.",
        },
        {
            id: 4,
            label: "Phone number added to test recipient list",
            detail: "In WhatsApp → API Setup → Step 1 → 'To' dropdown → Manage phone number list → Add your phone and verify with OTP.",
        },
        {
            id: 5,
            label: "Localtunnel bypass page clicked",
            detail: "Open https://khaki-friends-jump.loca.lt in your browser and click 'Click to Continue'. Otherwise Meta's POST requests are blocked.",
        },
        {
            id: 6,
            label: "Backend server is running on port 3000",
            detail: "Make sure 'npm run start' is running in the Empty/ folder and shows 'Server running on port 3000'.",
        },
    ]

    const [checked, setChecked] = useState<number[]>([])

    return (
        <div className="flex flex-col gap-6">

            {/* ── Website Widget Generator ─── */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="mb-5">
                    <h3 className="text-sm font-bold text-zinc-950">🌐 Website Widget Generator</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                        Give hospitals a button to paste on their website. When patients click it, they are redirected to WhatsApp and your bot instantly replies.
                    </p>
                </div>

                {/* Button customization */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Button Text</label>
                        <input
                            type="text"
                            value={btnText}
                            onChange={e => setBtnText(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
                            placeholder="e.g. 💬 Book Appointment"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Preview</label>
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                            style={{ background: "#25D366", boxShadow: "0 4px 16px rgba(37,211,102,0.35)" }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            {btnText}
                        </a>
                    </div>
                </div>

                {/* Direct WhatsApp link */}
                <div className="mb-4 rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Direct Link (share anywhere)</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-zinc-800 break-all">{waLink}</code>
                        <button
                            type="button"
                            onClick={() => { navigator.clipboard.writeText(waLink); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                            className="shrink-0 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                        >
                            {copied ? "✅ Copied" : "Copy"}
                        </button>
                    </div>
                </div>

                {/* HTML embed code */}
                <div className="rounded-xl bg-zinc-950 p-4 relative">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">HTML Embed Code — paste on hospital website</span>
                        <button
                            type="button"
                            onClick={copyCode}
                            className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-semibold text-white hover:bg-zinc-700 transition"
                        >
                            {copied ? "✅ Copied!" : "Copy Code"}
                        </button>
                    </div>
                    <pre className="text-[11px] text-emerald-400 whitespace-pre-wrap leading-5 overflow-x-auto">{embedCode}</pre>
                </div>

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                    <strong>How to use:</strong> Copy the HTML above and paste it anywhere on the hospital website — their homepage, Contact Us page, or header. That's it! When a patient clicks the button, WhatsApp opens and your bot responds instantly.
                </div>
            </section>

            {/* ── Webhook Troubleshooter ─── */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="mb-5">
                    <h3 className="text-sm font-bold text-zinc-950">🔧 Webhook Troubleshooter</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                        Not getting replies from the bot? Go through this checklist step by step — each one must be ✅ for messages to work.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {WEBHOOK_CHECKS.map(check => {
                        const done = checked.includes(check.id)
                        return (
                            <div
                                key={check.id}
                                onClick={() => setChecked(prev => done ? prev.filter(x => x !== check.id) : [...prev, check.id])}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${done ? "border-emerald-200 bg-emerald-50" : "border-zinc-200 bg-white hover:bg-zinc-50"}`}
                            >
                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${done ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-300 text-transparent"}`}>
                                    ✓
                                </div>
                                <div>
                                    <p className={`text-xs font-semibold ${done ? "text-emerald-800 line-through" : "text-zinc-900"}`}>{check.label}</p>
                                    <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">{check.detail}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {checked.length === WEBHOOK_CHECKS.length && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
                        ✅ All checks passed! Send "Hi" from your WhatsApp to your connected number and the bot should reply instantly!
                    </div>
                )}
            </section>
        </div>
    )
}

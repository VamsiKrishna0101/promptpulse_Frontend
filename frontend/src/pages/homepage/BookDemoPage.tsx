import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Globe,
    Search,
    X,
} from "lucide-react"
import { api } from "@/lib/api"
import { GEO_COUNTRIES, countryFlagUrl } from "@/lib/countries"
import { NavHeader } from "@/components/navbar/navbar"
import { Footer } from "@/components/footer/footer"
import { useToast } from "@/components/ui/Toast"
import { useAuth } from "@/hooks/useAuth"
import { getCountryFromBrowserLocale, getTimezonesForCountry } from "./demoTimezones"

type DemoFormState = {
    name: string
    email: string
    company: string
    notes: string
}

type DemoFormErrors = Partial<Record<keyof DemoFormState, string>>

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const IST_TIMEZONE = "Asia/Kolkata"
const SLOT_START_HOUR_IST = 7
const SLOT_END_HOUR_IST = 23
const SLOT_INTERVAL_MIN = 20
const DEMO_DURATION_MIN = 20

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isPastDay(date: Date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
}

function buildMonthGrid(year: number, month: number) {
    const firstOfMonth = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const leadingBlanks = firstOfMonth.getDay()

    const cells: (Date | null)[] = Array(leadingBlanks).fill(null)
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day))
    return cells
}

function dateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function zonedDateKey(date: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date)

    const year = parts.find((part) => part.type === "year")?.value
    const month = parts.find((part) => part.type === "month")?.value
    const day = parts.find((part) => part.type === "day")?.value
    return `${year}-${month}-${day}`
}

function createDateFromIst(year: number, month: number, day: number, hour: number, minute: number) {
    return new Date(Date.UTC(year, month, day, hour - 5, minute - 30, 0, 0))
}

function buildTimeSlotsForLocalDate(localDate: Date, timezone: string) {
    const slots: Date[] = []
    const localKey = dateKey(localDate)
    const now = new Date()

    for (let dayOffset = -1; dayOffset <= 2; dayOffset++) {
        const istDate = new Date(localDate)
        istDate.setDate(istDate.getDate() + dayOffset)

        for (let minutes = SLOT_START_HOUR_IST * 60; minutes < SLOT_END_HOUR_IST * 60; minutes += SLOT_INTERVAL_MIN) {
            const slot = createDateFromIst(
                istDate.getFullYear(),
                istDate.getMonth(),
                istDate.getDate(),
                Math.floor(minutes / 60),
                minutes % 60
            )

            if (slot > now && zonedDateKey(slot, timezone) === localKey) {
                slots.push(slot)
            }
        }
    }

    return slots.sort((a, b) => a.getTime() - b.getTime())
}

function formatTime(date: Date, timezone: string, use24h: boolean) {
    return date.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: !use24h,
    }).toLowerCase().replace(" ", "")
}

function formatDateTimeLabel(date: Date, timezone: string, suffix?: string) {
    const label = date.toLocaleString("en-US", {
        timeZone: timezone,
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })
    return suffix ? `${label} ${suffix}` : label
}

function validateDetails(form: DemoFormState): DemoFormErrors {
    const errors: DemoFormErrors = {}
    if (!form.name.trim()) errors.name = "Required"
    if (!form.email.trim()) errors.email = "Required"
    if (!form.company.trim()) errors.company = "Required"
    return errors
}

function getDefaultBookableDate(timezone: string) {
    const cursor = new Date()
    cursor.setHours(0, 0, 0, 0)

    for (let i = 0; i < 45; i++) {
        const candidate = new Date(cursor)
        candidate.setDate(candidate.getDate() + i)
        if (buildTimeSlotsForLocalDate(candidate, timezone).length > 0) return candidate
    }
    return cursor
}

function Logomark({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" />
            <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" />
            <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
        </svg>
    )
}

function MeetIcon({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className}>
            <path d="M14 8.5v7l4.2 3.3c.6.5 1.5.1 1.5-.7V5.9c0-.8-.9-1.2-1.5-.7L14 8.5Z" fill="#00832D" />
            <rect x="3" y="6" width="11" height="12" rx="2" fill="#00AC47" />
            <path d="M3 6h6l-6 6V6Z" fill="#00832D" opacity="0.55" />
            <path d="M9 18H3l6-6v6Z" fill="#00832D" opacity="0.35" />
        </svg>
    )
}

export function BookDemoPage() {
    const { user } = useAuth()
    const toast = useToast()
    const browserCountry = getCountryFromBrowserLocale()
    const initialCountry = GEO_COUNTRIES.find((country) => country.code === browserCountry) ?? GEO_COUNTRIES.find((country) => country.code === "IN")!

    const [step, setStep] = useState<"calendar" | "details">("calendar")
    const [successOpen, setSuccessOpen] = useState(false)
    const [use24h, setUse24h] = useState(false)
    const [countryCode, setCountryCode] = useState(initialCountry.code)
    const [countrySearch, setCountrySearch] = useState("")
    const [countryOpen, setCountryOpen] = useState(false)
    const timezoneOptions = useMemo(() => getTimezonesForCountry(countryCode), [countryCode])
    const [timezone, setTimezone] = useState(timezoneOptions[0]?.value ?? "Asia/Kolkata")
    const [viewDate, setViewDate] = useState(() => getDefaultBookableDate(timezone))
    const [selectedDate, setSelectedDate] = useState<Date | null>(() => getDefaultBookableDate(timezone))
    const [selectedTime, setSelectedTime] = useState<Date | null>(null)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<DemoFormErrors>({})
    const [form, setForm] = useState<DemoFormState>({
        name: "",
        email: "",
        company: "",
        notes: "",
    })

    const selectedCountry = GEO_COUNTRIES.find((country) => country.code === countryCode) ?? initialCountry
    const selectedTimezone = timezoneOptions.find((option) => option.value === timezone)

    useEffect(() => {
        const nextOptions = getTimezonesForCountry(countryCode)
        setTimezone((current) => nextOptions.some((option) => option.value === current) ? current : nextOptions[0]?.value ?? "Etc/UTC")
    }, [countryCode])

    useEffect(() => {
        const nextDate = getDefaultBookableDate(timezone)
        setViewDate(nextDate)
        setSelectedDate(nextDate)
        setSelectedTime(null)
        setStep("calendar")
    }, [timezone])

    useEffect(() => {
        if (!user?.email) return
        setForm((current) => ({ ...current, email: current.email || user.email }))
    }, [user?.email])

    const monthGrid = useMemo(() => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()), [viewDate])
    const timeSlots = useMemo(() => (selectedDate ? buildTimeSlotsForLocalDate(selectedDate, timezone) : []), [selectedDate, timezone])
    const filteredCountries = useMemo(() => {
        const q = countrySearch.trim().toLowerCase()
        if (!q) return GEO_COUNTRIES
        return GEO_COUNTRIES.filter((country) => country.name.toLowerCase().includes(q) || country.code.toLowerCase().includes(q))
    }, [countrySearch])

    function updateField<Key extends keyof DemoFormState>(key: Key, value: DemoFormState[Key]) {
        setForm((current) => ({ ...current, [key]: value }))
        setErrors((current) => ({ ...current, [key]: undefined }))
    }

    function goToMonth(delta: number) {
        setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
    }

    function pickTime(time: Date) {
        setSelectedTime(time)
        setStep("details")
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!selectedTime) return

        const validationErrors = validateDetails(form)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            toast.error("Please fix the highlighted fields")
            return
        }

        const localTimeLabel = formatDateTimeLabel(selectedTime, timezone, selectedTimezone?.label)
        const istTimeLabel = formatDateTimeLabel(selectedTime, IST_TIMEZONE, "IST")

        setIsSubmitting(true)
        try {
            await api.post("/demo", {
                name: form.name.trim(),
                email: form.email.trim(),
                company: form.company.trim(),
                scheduledAt: selectedTime.toISOString(),
                timezone,
                countryCode: selectedCountry.code,
                countryName: selectedCountry.name,
                localTimeLabel,
                istTimeLabel,
                notes: form.notes.trim() || undefined,
            })

            setSuccessOpen(true)
            toast.success("Demo booked", "Please check your inbox and spam folder for meeting updates.")
        } catch (error: any) {
            const message = error?.response?.data?.error || error?.response?.data?.message || "We could not book the demo right now. Please try again."
            toast.error("Booking failed", message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    const selectedDayLabel = selectedDate?.toLocaleDateString("en-US", { weekday: "short", day: "2-digit" })

    return (
        <>
            <NavHeader />
            <main className="bg-white">
                <section className="relative overflow-hidden px-6 py-14">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10"
                        style={{
                            backgroundImage: "linear-gradient(to right, rgba(24,24,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.05) 1px, transparent 1px)",
                            backgroundSize: "56px 56px",
                            maskImage: "radial-gradient(ellipse 60% 60% at 50% 20%, black 40%, transparent 90%)",
                            WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 20%, black 40%, transparent 90%)",
                        }}
                    >
                        <div className="absolute left-1/2 top-0 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-blue-50/80 blur-3xl" />
                        <div className="absolute right-[10%] top-28 h-44 w-44 rounded-full bg-emerald-50 blur-3xl" />
                    </div>

                    <div className="relative mx-auto max-w-5xl">
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Book a demo</h1>
                            <p className="mt-1.5 text-sm text-zinc-500">
                                Pick your country and choose a slot. Demo calls are available from 7:00 AM to 11:00 PM IST.
                            </p>
                        </div>

                        <div className="overflow-visible rounded-2xl border border-zinc-200 bg-white/90 shadow-[0_40px_100px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
                            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_220px]">
                                <div className="border-b border-zinc-200 p-6 md:border-b-0 md:border-r">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-sm ring-4 ring-zinc-50">
                                        <Logomark className="h-4 w-4" />
                                    </div>
                                    <p className="mt-4 text-xs font-medium text-zinc-500">PromptPulse</p>
                                    <h2 className="mt-1 text-lg font-semibold text-zinc-900">Product demo call</h2>
                                    <p className="mt-2 text-[13px] leading-5 text-zinc-500">A quick walkthrough of the platform. We'll answer questions along the way.</p>

                                    <div className="mt-5 space-y-2.5 text-[13px] text-zinc-600">
                                        <div className="flex items-center gap-2"><Clock size={14} className="text-zinc-400" />{DEMO_DURATION_MIN}m</div>
                                        <div className="flex items-center gap-2"><MeetIcon className="h-3.5 w-3.5" />Zoom / Meet link later</div>
                                        <div className="flex items-center gap-2"><Globe size={14} className="text-zinc-400" />Stored in IST</div>
                                    </div>

                                    {step === "details" && (
                                        <button type="button" onClick={() => setStep("calendar")} className="mt-6 inline-flex items-center gap-1 text-[13px] font-medium text-zinc-500 hover:text-zinc-900">
                                            <ArrowLeft size={14} />
                                            Back
                                        </button>
                                    )}
                                </div>

                                {step === "calendar" ? (
                                    <>
                                        <div className="border-b border-zinc-200 p-6 md:border-b-0 md:border-r">
                                            <div className="mb-5 grid gap-3 sm:grid-cols-2">
                                                <CountryPicker
                                                    open={countryOpen}
                                                    query={countrySearch}
                                                    countryCode={countryCode}
                                                    countries={filteredCountries}
                                                    onOpenChange={setCountryOpen}
                                                    onQueryChange={setCountrySearch}
                                                    onSelect={(code) => {
                                                        setCountryCode(code)
                                                        setCountrySearch("")
                                                        setCountryOpen(false)
                                                    }}
                                                />

                                                <label className="block">
                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">Timezone</span>
                                                    <select value={timezone} onChange={(event) => setTimezone(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-[13px] font-medium text-zinc-900 outline-none focus:border-zinc-400">
                                                        {timezoneOptions.map((option) => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>

                                            <div className="mb-4 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-zinc-900">{monthLabel}</span>
                                                <div className="flex items-center gap-1">
                                                    <button type="button" onClick={() => goToMonth(-1)} className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"><ChevronLeft size={16} /></button>
                                                    <button type="button" onClick={() => goToMonth(1)} className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"><ChevronRight size={16} /></button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-7 gap-y-1 text-center">
                                                {WEEKDAYS.map((day) => <span key={day} className="pb-2 text-[10px] font-semibold text-zinc-400">{day}</span>)}
                                                {monthGrid.map((date, index) => {
                                                    if (!date) return <span key={`blank-${index}`} />
                                                    const disabled = isPastDay(date) || buildTimeSlotsForLocalDate(date, timezone).length === 0
                                                    const isSelected = selectedDate && isSameDay(date, selectedDate)

                                                    return (
                                                        <button
                                                            key={date.toISOString()}
                                                            type="button"
                                                            disabled={disabled}
                                                            onClick={() => {
                                                                setSelectedDate(date)
                                                                setSelectedTime(null)
                                                            }}
                                                            className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-all duration-150 ${isSelected ? "scale-105 bg-zinc-900 font-semibold text-white shadow-[0_8px_20px_-6px_rgba(24,24,27,0.55)]" : disabled ? "text-zinc-300" : "text-zinc-700 hover:bg-zinc-100 hover:shadow-sm"}`}
                                                        >
                                                            {date.getDate()}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="mb-4 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-zinc-900">{selectedDayLabel}</span>
                                                <div className="flex overflow-hidden rounded-md border border-zinc-200 text-[11px] font-medium">
                                                    <button type="button" onClick={() => setUse24h(false)} className={`px-2 py-1 transition ${!use24h ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50"}`}>12h</button>
                                                    <button type="button" onClick={() => setUse24h(true)} className={`px-2 py-1 transition ${use24h ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50"}`}>24h</button>
                                                </div>
                                            </div>
                                            <p className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[12px] font-medium leading-5 text-emerald-800">
                                                Showing times for {selectedCountry.name}. We store your booking in IST for scheduling.
                                            </p>

                                            <div className="slot-scroll max-h-80 space-y-2 overflow-y-auto pr-1">
                                                {timeSlots.length === 0 && <p className="pt-8 text-center text-[13px] text-zinc-400">No slots available for this date</p>}
                                                {timeSlots.map((slot) => (
                                                    <button key={slot.toISOString()} type="button" onClick={() => pickTime(slot)} className="w-full rounded-xl border border-zinc-200 py-2 text-[13px] font-medium text-zinc-700 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white hover:shadow-[0_10px_24px_-14px_rgba(24,24,27,0.6)]">
                                                        {formatTime(slot, timezone, use24h)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-6 md:col-span-2">
                                        <p className="text-[13px] text-zinc-500">
                                            {selectedTime ? formatDateTimeLabel(selectedTime, timezone, selectedTimezone?.label) : ""} · {selectedTime ? formatDateTimeLabel(selectedTime, IST_TIMEZONE, "IST") : ""}
                                        </p>
                                        <h3 className="mt-1 text-base font-semibold text-zinc-900">Enter your details</h3>

                                        <form className="mt-5 max-w-md space-y-3" onSubmit={handleSubmit}>
                                            <Field label="Name" value={form.name} onChange={(value) => updateField("name", value)} placeholder="Jane Carter" error={errors.name} />
                                            <Field label="Work email" type="email" value={form.email} onChange={(value) => updateField("email", value)} placeholder="jane@company.com" error={errors.email} />
                                            <Field label="Company" value={form.company} onChange={(value) => updateField("company", value)} placeholder="Acme Labs" error={errors.company} />
                                            <div className="space-y-1">
                                                <label className="text-[12px] font-medium text-zinc-600">Notes (optional)</label>
                                                <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={3} placeholder="Anything you'd like us to prepare for" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-[13px] text-zinc-900 outline-none transition focus:border-zinc-400" />
                                            </div>
                                            <button type="submit" disabled={isSubmitting} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 text-[13px] font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60">
                                                {isSubmitting ? "Confirming..." : "Confirm demo"}
                                                <ArrowRight size={14} />
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />

            {successOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-zinc-950/45 px-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-[0_30px_90px_-35px_rgba(15,23,42,0.7)]">
                        <button type="button" onClick={() => setSuccessOpen(false)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900">
                            <X size={16} />
                        </button>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <h2 className="mt-4 text-xl font-semibold tracking-tight text-zinc-950">Demo request booked</h2>
                        <p className="mt-2 text-[14px] leading-6 text-zinc-500">
                            Thanks, {form.name || "there"}. Your demo request is saved.
                        </p>
                        <p className="mt-4 text-[13px] leading-6 text-zinc-500">
                            Please check your inbox and spam folder too. You will receive the Zoom or meeting link later by email.
                        </p>
                        <div className="mt-6 flex justify-center gap-3">
                            <Link to="/pricing" className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 px-4 text-[13px] font-semibold text-zinc-700 transition hover:bg-zinc-50">
                                View pricing
                            </Link>
                            <Link to="/signup" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 text-[13px] font-semibold text-white transition hover:bg-zinc-800">
                                Start free trial
                                <ArrowRight size={13} />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .slot-scroll { scrollbar-width: thin; scrollbar-color: #d4d4d8 transparent; }
                .slot-scroll::-webkit-scrollbar { width: 6px; }
                .slot-scroll::-webkit-scrollbar-track { background: transparent; }
                .slot-scroll::-webkit-scrollbar-thumb { background-color: #d4d4d8; border-radius: 9999px; }
                .slot-scroll::-webkit-scrollbar-thumb:hover { background-color: #a1a1aa; }
            `}</style>
        </>
    )
}

function CountryPicker({
    open,
    query,
    countryCode,
    countries,
    onOpenChange,
    onQueryChange,
    onSelect,
}: {
    open: boolean
    query: string
    countryCode: string
    countries: typeof GEO_COUNTRIES
    onOpenChange: (open: boolean) => void
    onQueryChange: (query: string) => void
    onSelect: (code: string) => void
}) {
    const selected = GEO_COUNTRIES.find((country) => country.code === countryCode) ?? GEO_COUNTRIES[0]

    return (
        <div className="relative">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">Country</span>
            <button type="button" onClick={() => onOpenChange(!open)} className="mt-2 flex h-11 w-full items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-left text-[13px] font-medium text-zinc-900 outline-none transition hover:border-zinc-300">
                <img src={countryFlagUrl(selected.code)} alt="" className="h-4 w-6 rounded-sm object-cover" />
                <span className="min-w-0 flex-1 truncate">{selected.name}</span>
            </button>
            {open && (
                <div className="absolute left-0 right-0 top-[76px] z-30 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.5)]">
                    <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2">
                        <Search size={14} className="text-zinc-400" />
                        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search country" className="h-8 min-w-0 flex-1 text-[13px] outline-none placeholder:text-zinc-400" />
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                        {countries.map((country) => (
                            <button key={country.code} type="button" onClick={() => onSelect(country.code)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-zinc-700 hover:bg-zinc-50">
                                <img src={countryFlagUrl(country.code)} alt="" className="h-4 w-6 rounded-sm object-cover" />
                                <span className="min-w-0 flex-1 truncate">{country.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    error,
    type = "text",
}: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    error?: string
    type?: React.HTMLInputTypeAttribute
}) {
    return (
        <div className="space-y-1">
            <label className="text-[12px] font-medium text-zinc-600">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={`h-9 w-full rounded-lg border bg-white px-3 text-[13px] text-zinc-900 outline-none transition ${error ? "border-red-300 focus:border-red-400" : "border-zinc-200 focus:border-zinc-400"}`}
            />
            {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
        </div>
    )
}

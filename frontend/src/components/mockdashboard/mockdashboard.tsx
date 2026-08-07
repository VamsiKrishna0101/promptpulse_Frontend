// MockDashboard.tsx — static landing-page hero mockup, no live data/hooks.
// Matches the reference product screenshot: sidebar nav groups/icons, brand
// pill styling, and KPI tag colors are aligned to the real app layout.

import {
    LayoutGrid,
    Sparkles,
    FileText,
    MessageSquare,
    Globe,
    Trophy,
    MessagesSquare,
    User,
    CreditCard,
    Settings as SettingsIcon,
    HelpCircle,
    LogOut,
} from "lucide-react"

const chartLines = [
    { name: "PromptPulse", color: "#2563EB", points: "0,12 120,10 240,6 360,8 480,10 600,11", end: "89%", primary: true },
    { name: "QueryPilot", color: "#12B76A", points: "0,58 120,50 240,44 360,52 480,46 600,48", end: "67%" },
    { name: "SignalNest", color: "#F79009", points: "0,48 120,54 240,58 360,50 480,56 600,54", end: "61%" },
    { name: "AnswerLens", color: "#8B5CF6", points: "0,62 120,56 240,60 360,58 480,54 600,58", end: "56%" },
    { name: "NorthstarIQ", color: "#EC4899", points: "0,54 120,60 240,52 360,64 480,58 600,60", end: "56%" },
    { name: "AtlasRank", color: "#06AED4", points: "0,66 120,60 240,64 360,56 480,60 600,58", end: "56%" },
]

const yLabels = ["100%", "80%", "60%", "40%", "20%", "0%"]
const xLabels = ["2 Jul", "3 Jul", "4 Jul", "5 Jul", "6 Jul", "7 Jul"]

const brandRows = [
    { rank: 1, name: "PromptPulse", mono: "R", monoBg: "#2563EB", visChange: "+6.3", vis: "94%", sentDot: "#12B76A", sentChange: "+3.7", sent: "71", posChange: "+0.2", pos: "4.1" },
    { rank: 2, name: "QueryPilot", mono: "Q", monoBg: "#2563EB", visChange: "+1.6", vis: "61%", sentDot: "#F79009", sentChange: "+0.2", sent: "65", posChange: null, pos: "3.0" },
    { rank: 3, name: "SignalNest", mono: "S", monoBg: "#15161B", visChange: "-0.9", vis: "60%", sentDot: "#F79009", sentChange: "-0.7", sent: "64", posChange: "+0.1", pos: "3.0" },
    { rank: 4, name: "NorthstarIQ", mono: "N", monoBg: "#12B76A", visChange: "+1.5", vis: "60%", sentDot: "#12B76A", sentChange: "+0.6", sent: "65", posChange: null, pos: "3.0" },
    { rank: 5, name: "AnswerLens", mono: "A", monoBg: "#8B5CF6", visChange: "-1.9", vis: "59%", sentDot: "#F79009", sentChange: "-0.5", sent: "65", posChange: null, pos: "3.0" },
    { rank: 6, name: "AtlasRank", mono: "A", monoBg: "#2563EB", visChange: "-0.3", vis: "59%", sentDot: "#12B76A", sentChange: "+0.3", sent: "65", posChange: "-0.1", pos: "3.0" },
]

const sourceRows = [
    { domain: "promptpulse.com", mono: "R", monoBg: "#2563EB", used: "48%", avgCit: "0.8", type: "Editorial", tone: "amber" },
    { domain: "brandreview.co", mono: "B", monoBg: "#98A2B3", used: "38%", avgCit: "0.7", type: "Corporate", tone: "violet" },
    { domain: "communityhub.net", mono: "C", monoBg: "#98A2B3", used: "31%", avgCit: "0.5", type: "UGC", tone: "cyan" },
    { domain: "expertinsights.com", mono: "E", monoBg: "#98A2B3", used: "29%", avgCit: "0.6", type: "Editorial", tone: "amber" },
    { domain: "scope.com", mono: "S", monoBg: "#F79009", used: "24%", avgCit: "0.4", type: "Competitor", tone: "red" },
]

const donutSegments = [
    { color: "#06AED4", label: "UGC", pct: 32 },
    { color: "#F79009", label: "Editorial", pct: 22 },
    { color: "#8B5CF6", label: "Corporate", pct: 18 },
    { color: "#F04438", label: "Competitor", pct: 16 },
    { color: "#E4E7EC", label: "Others", pct: 12 },
]

// Sidebar nav — matches the reference screenshot exactly:
// one "General" group with all 8 primary links, a "Settings" group
// with account items, then Help / Log out pinned at the bottom.
const navGroups = [
    {
        label: "General",
        items: [
            { label: "Overview", icon: LayoutGrid },
            { label: "Opportunities", icon: Sparkles },
            { label: "GEO Articles", icon: FileText },
            { label: "Prompts", icon: MessageSquare },
            { label: "Sources", icon: Globe },
            { label: "Competitors", icon: Trophy },
            { label: "Chat", icon: MessagesSquare },
        ],
    },
    {
        label: "Settings",
        items: [
            { label: "Profile", icon: User },
            { label: "Subscription", icon: CreditCard },
            { label: "Settings", icon: SettingsIcon },
        ],
    },
]

const footerItems = [
    { label: "Help", icon: HelpCircle },
    { label: "Log out", icon: LogOut },
]

const typeTone: Record<string, { bg: string; text: string; border: string }> = {
    amber: { bg: "#FFFAEB", text: "#B54708", border: "rgba(254,223,137,0.6)" },
    violet: { bg: "#F4F3FF", text: "#5925DC", border: "rgba(211,201,255,0.7)" },
    cyan: { bg: "#ECFEFF", text: "#0E7490", border: "rgba(165,243,252,0.7)" },
    red: { bg: "#FEF3F2", text: "#B42318", border: "rgba(253,162,155,0.5)" },
}

function MonoIcon({ letter, bg, size = 18 }: { letter: string; bg: string; size?: number }) {
    return (
        <span
            className="flex shrink-0 items-center justify-center rounded-[5px] font-semibold text-white"
            style={{ width: size, height: size, background: bg, fontSize: size * 0.52 }}
        >
            {letter}
        </span>
    )
}

function DonutChart() {
    const total = donutSegments.reduce((s, x) => s + x.pct, 0)
    const r = 44
    const circumference = 2 * Math.PI * r
    let offset = 0

    return (
        <div className="pp-mock-dashboard-donut flex h-full items-center justify-center gap-6 px-6 py-4">
            <svg width="128" height="128" viewBox="0 0 128 128" className="shrink-0">
                <circle cx="64" cy="64" r={r} fill="none" stroke="#EEF1F5" strokeWidth="14" />
                {donutSegments.map((seg) => {
                    const dash = (seg.pct / total) * circumference
                    const el = (
                        <circle
                            key={seg.label}
                            cx="64"
                            cy="64"
                            r={r}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="14"
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={-offset}
                            strokeLinecap="round"
                            style={{ transform: "rotate(-90deg)", transformOrigin: "64px 64px" }}
                        />
                    )
                    offset += dash + 4
                    return el
                })}
                <text x="64" y="64" textAnchor="middle" fontSize="16" fontWeight="600" fill="#667085">12%</text>
            </svg>
            <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
                {donutSegments.map((s) => (
                    <span key={s.label} className="flex items-center gap-2 text-[11.5px] font-medium text-[#667085]">
                        <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                        {s.label}
                    </span>
                ))}
            </div>
        </div>
    )
}

function DeltaPill({ value }: { value: string }) {
    const negative = value.startsWith("-")
    return (
        <span
            className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold"
            style={{
                background: negative ? "#FEF3F2" : "#ECFDF3",
                color: negative ? "#B42318" : "#047857",
            }}
        >
            {negative ? "↘" : "↗"} {value.replace("-", "")}
        </span>
    )
}

function KpiTag({ label, tone }: { label: string; tone: "blue" | "plain" | "green" | "slate" }) {
    const styles = {
        blue: "bg-[#EFF6FF] text-[#1D4ED8] border-[#DCE8FD]",
        plain: "bg-white text-[#475467] border-[#E2E5EA]",
        green: "bg-[#ECFDF3] text-[#047857] border-[#A6F4C5]/60",
        slate: "bg-[#F7F8FA] text-[#667085] border-[#E2E5EA]",
    }[tone]
    return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles}`}>{label}</span>
}

function KpiCard({
    label, tagLabel, tagTone, value, delta, detail,
}: {
    label: string
    tagLabel: string
    tagTone: "blue" | "plain" | "green" | "slate"
    value: string
    delta: string
    detail: string
}) {
    return (
        <div className="rounded-xl border border-[#E2E5EA] bg-white px-4 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex items-center justify-between gap-3">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">{label}</span>
                <KpiTag label={tagLabel} tone={tagTone} />
            </div>
            <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-[#0F172A]">{value}</span>
                <DeltaPill value={delta} />
            </div>
            <p className="mt-1 text-[11.5px] font-medium leading-snug text-[#667085]">{detail}</p>
        </div>
    )
}

export function MockDashboard() {
    return (
        <div className="relative mx-auto mt-8 w-full max-w-[1510px] px-0 sm:px-4">
            <style>{`
                @media (max-width: 767px) {
                    .pp-mock-dashboard-shell {
                        border-radius: 18px !important;
                    }
                    .pp-mock-dashboard-inner {
                        min-width: 0 !important;
                        border-radius: 14px !important;
                    }
                    .pp-mock-dashboard-topbar {
                        align-items: flex-start !important;
                        padding: 12px !important;
                    }
                    .pp-mock-dashboard-filters,
                    .pp-mock-dashboard-actions {
                        width: 100% !important;
                        flex-wrap: wrap !important;
                    }
                    .pp-mock-dashboard-filter {
                        flex: 1 1 auto !important;
                        justify-content: center !important;
                        min-width: 0 !important;
                    }
                    .pp-mock-dashboard-kpis {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                    .pp-mock-dashboard-split,
                    .pp-mock-dashboard-source-split {
                        grid-template-columns: 1fr !important;
                    }
                    .pp-mock-dashboard-hide-sm {
                        display: none !important;
                    }
                    .pp-mock-dashboard-donut {
                        flex-direction: column !important;
                        gap: 12px !important;
                    }
                }
                @media (max-width: 420px) {
                    .pp-mock-dashboard-kpis {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-12 top-8 h-[380px] rounded-full opacity-80 blur-3xl"
                style={{ background: "radial-gradient(circle at center, rgba(37,99,235,0.13), rgba(148,163,184,0.10) 42%, transparent 72%)" }}
            />

            <div className="pp-mock-dashboard-shell relative overflow-hidden rounded-[20px] border border-[#E2E5EA] bg-white/95 p-1.5 shadow-[0_34px_110px_rgba(15,23,42,0.16),0_0_0_1px_rgba(255,255,255,0.72)_inset] backdrop-blur sm:rounded-[24px] sm:p-2">
                <div className="pp-mock-dashboard-inner w-full overflow-hidden rounded-[16px] border border-[#E2E5EA] bg-white text-left md:rounded-[18px]">
                    <div className="flex min-h-[520px]">

                        {/* Sidebar — matches the app's dark charcoal + blue accent */}
                        <aside className="hidden shrink-0 flex-col border-r border-[#25272E] bg-[#15161B] p-2 md:flex" style={{ width: 200 }}>
                            <div className="px-2 pb-1.5 pt-1.5">
                                <div className="flex items-center gap-2.5 rounded-lg px-2 py-1">
                                    <div
                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-[0_2px_5px_rgba(59,130,246,0.35)]"
                                        style={{ background: "radial-gradient(120% 120% at 20% 15%, #60A5FA 0%, #3B82F6 55%, #1D4ED8 100%)" }}
                                    >
                                        <span className="text-[10px] font-bold leading-none">R</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-[12px] font-semibold leading-snug tracking-[-0.01em] text-white">PromptPulse</div>
                                        <div className="truncate text-[10px] leading-tight text-[#8A8D99]">United States</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mx-2 mb-1.5 border-t border-[#25272E]" />

                            <nav className="flex-1 overflow-y-auto px-0.5">
                                {navGroups.map((group) => (
                                    <div key={group.label}>
                                        <div className="px-2.5 pb-1 pt-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#767986]">
                                            {group.label}
                                        </div>
                                        <div className="space-y-0.5">
                                            {group.items.map((item) => {
                                                const Icon = item.icon
                                                const active = item.label === "Overview"
                                                return (
                                                    <div
                                                        key={item.label}
                                                        className={`relative flex min-w-0 items-center gap-2.5 rounded-md px-2.5 py-[5px] text-[12px] font-medium tracking-[-0.01em] ${active ? "bg-[#232429] font-semibold text-white" : "text-[#D6D8DE]"}`}
                                                    >
                                                        {active && (
                                                            <span className="absolute left-0 top-1/2 h-[12px] w-[2.5px] -translate-y-1/2 rounded-full bg-[#3B82F6]" />
                                                        )}
                                                        <Icon size={13} className={active ? "text-white" : "text-[#8A8D99]"} strokeWidth={2} />
                                                        <span className="min-w-0 truncate">{item.label}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </nav>

                            <div className="border-t border-[#25272E] px-1.5 pb-1.5 pt-1.5">
                                {footerItems.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <div key={item.label} className="flex items-center gap-2.5 rounded-md px-2.5 py-[5px] text-[12px] font-medium text-[#8A8D99]">
                                            <Icon size={13} strokeWidth={2} />
                                            {item.label}
                                        </div>
                                    )
                                })}
                            </div>
                        </aside>

                        {/* Main content */}
                        <section className="min-w-0 flex-1 bg-white">
                            <div className="pp-mock-dashboard-topbar flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF0F3] bg-white px-5 py-2">
                                <div className="pp-mock-dashboard-filters flex min-w-0 items-center gap-2">
                                    <span className="flex h-6 items-center rounded-lg bg-[#15161B] px-2.5 text-[11.5px] font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.3)]">
                                        PromptPulse
                                    </span>
                                    {["All time", "All Topics", "All Models"].map((item) => (
                                        <span key={item} className="pp-mock-dashboard-filter flex h-6 items-center rounded-lg border border-[#E2E5EA] bg-white px-2.5 text-[11.5px] font-medium text-[#475467]">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                <div className="pp-mock-dashboard-actions flex items-center gap-2">
                                    <span className="flex h-6 items-center gap-1.5 rounded-lg border border-[#E2E5EA] bg-white px-2.5 text-[11.5px] font-medium text-[#475467]">
                                        PDF
                                    </span>
                                    <span className="flex h-6 items-center gap-1.5 rounded-lg bg-[#15161B] px-2.5 text-[11.5px] font-semibold text-white">
                                        CSV
                                    </span>
                                </div>
                            </div>

                            <div className="p-2.5">
                                <div className="pp-mock-dashboard-kpis grid grid-cols-2 gap-2.5 md:grid-cols-4">
                                    <KpiCard label="Visibility" tagLabel="Brand line" tagTone="blue" value="94%" delta="+6.3" detail="PromptPulse share across AI answers" />
                                    <KpiCard label="Position" tagLabel="Rank" tagTone="plain" value="4.1" delta="+0.2" detail="Average rank when mentioned" />
                                    <KpiCard label="Sentiment" tagLabel="Tone" tagTone="green" value="71" delta="+3.7" detail="Weighted response sentiment" />
                                    <KpiCard label="Sources" tagLabel="Evidence" tagTone="slate" value="9" delta="+0.0" detail="Domains influencing answers" />
                                </div>

                                <div className="mt-2.5 overflow-hidden rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                                    <div
                                        className="pp-mock-dashboard-split grid gap-0"
                                        style={{ gridTemplateColumns: "minmax(0, 1.15fr) minmax(430px, 0.85fr)" }}
                                    >
                                        <div className="border-b border-[#E2E5EA] lg:border-b-0 lg:border-r">
                                            <div className="flex items-center justify-between border-b border-[#EEF0F3] px-4 py-2">
                                                <div>
                                                    <div className="text-[12.5px] font-semibold text-[#0F172A]">Visibility</div>
                                                    <div className="text-[10.5px] text-[#98A2B3]">Percentage of chats mentioning each brand</div>
                                                </div>
                                            </div>
                                            <div className="px-4 pb-2.5 pt-2.5">
                                                <svg viewBox="0 0 660 190" className="h-[190px] w-full">
                                                    {yLabels.map((label, i) => (
                                                        <text key={label} x="34" y={16 + i * 26} fontSize="10" fill="#98A2B3" textAnchor="end">{label}</text>
                                                    ))}
                                                    {yLabels.map((_, i) => (
                                                        <line key={i} x1="48" x2="648" y1={12 + i * 26} y2={12 + i * 26} stroke="#EEF1F5" />
                                                    ))}
                                                    {xLabels.map((d, i) => (
                                                        <text key={d} x={48 + i * 120} y="176" fontSize="10" fill="#98A2B3" textAnchor="middle">{d}</text>
                                                    ))}
                                                    {chartLines.map((line) => (
                                                        <polyline
                                                            key={line.name}
                                                            points={line.points.split(" ").map((pt) => {
                                                                const [x, y] = pt.split(",")
                                                                return `${48 + (parseFloat(x) / 600) * 600},${12 + (parseFloat(y) / 100) * 130}`
                                                            }).join(" ")}
                                                            fill="none"
                                                            stroke={line.color}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={line.primary ? 2.6 : 1.8}
                                                            opacity={line.primary ? 1 : 0.85}
                                                        />
                                                    ))}
                                                    {chartLines.map((line) => (
                                                        <text key={line.name} x="654" y={12 + (parseFloat(line.points.split(" ").pop()!.split(",")[1]) / 100) * 130 + 4} fontSize="10" fontWeight="600" fill={line.color}>
                                                            {line.end}
                                                        </text>
                                                    ))}
                                                </svg>
                                                <div className="mt-1 flex flex-wrap gap-3">
                                                    {chartLines.map((line) => (
                                                        <span key={line.name} className="flex items-center gap-1.5 text-[11px] font-medium text-[#667085]">
                                                            <span className="h-2 w-2 rounded-full" style={{ background: line.color }} />
                                                            {line.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between border-b border-[#EEF0F3] px-4 py-2.5">
                                                <div>
                                                    <div className="text-[12.5px] font-semibold text-[#0F172A]">Brands</div>
                                                    <div className="text-[10.5px] text-[#98A2B3]">with highest visibility</div>
                                                </div>
                                                <span className="text-[11px] font-semibold text-[#2563EB]">Show all →</span>
                                            </div>
                                            <table className="w-full table-fixed border-collapse">
                                                <colgroup>
                                                    <col style={{ width: 32 }} />
                                                    <col />
                                                    <col style={{ width: 96 }} />
                                                    <col className="pp-mock-dashboard-hide-sm" style={{ width: 96 }} />
                                                    <col className="pp-mock-dashboard-hide-sm" style={{ width: 78 }} />
                                                </colgroup>
                                                <thead>
                                                    <tr className="border-b border-[#EEF0F3] bg-[#F7F8FA]">
                                                        {["#", "Brand", "Visibility", "Sentiment", "Position"].map((h) => (
                                                            <th key={h} className={`px-3 py-1.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-[#98A2B3] ${h === "Sentiment" || h === "Position" ? "pp-mock-dashboard-hide-sm" : ""}`}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {brandRows.map((row) => (
                                                        <tr key={row.rank} className="border-b border-[#EEF0F3] last:border-b-0">
                                                            <td className="px-3 py-1.5 text-[11.5px] text-[#98A2B3]">{row.rank}</td>
                                                            <td className="px-3 py-1.5">
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <MonoIcon letter={row.mono} bg={row.monoBg} size={16} />
                                                                    <span className="truncate text-[12px] font-semibold text-[#344054]">{row.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-1.5">
                                                                <div className="flex items-center gap-1.5 text-[11.5px]">
                                                                    <DeltaPill value={row.visChange} />
                                                                    <span className="font-semibold text-[#0F172A]">{row.vis}</span>
                                                                </div>
                                                            </td>
                                                            <td className="pp-mock-dashboard-hide-sm px-3 py-1.5">
                                                                <div className="flex items-center gap-1.5 text-[11.5px]">
                                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: row.sentDot }} />
                                                                    <DeltaPill value={row.sentChange} />
                                                                    <span className="text-[#667085]">{row.sent}</span>
                                                                </div>
                                                            </td>
                                                            <td className="pp-mock-dashboard-hide-sm px-3 py-1.5">
                                                                <div className="flex items-center gap-1.5 text-[11.5px]">
                                                                    {row.posChange && <DeltaPill value={row.posChange} />}
                                                                    <span className="text-[#667085]">#{row.pos}</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div
                                        className="pp-mock-dashboard-source-split grid border-t border-[#E2E5EA]"
                                        style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(380px, 0.75fr)" }}
                                    >
                                        <div className="border-b border-[#E2E5EA] lg:border-b-0 lg:border-r">
                                            <div className="flex items-center justify-between border-b border-[#EEF0F3] px-4 py-2">
                                                <div>
                                                    <div className="text-[12.5px] font-semibold text-[#0F172A]">Top Sources</div>
                                                    <div className="text-[10.5px] text-[#98A2B3]">Sources across active models</div>
                                                </div>
                                            </div>
                                            <table className="w-full table-fixed border-collapse">
                                                <colgroup>
                                                    <col style={{ width: 36 }} />
                                                    <col />
                                                    <col style={{ width: 110 }} />
                                                    <col style={{ width: 76 }} />
                                                </colgroup>
                                                <thead>
                                                    <tr className="border-b border-[#EEF0F3] bg-[#F7F8FA]">
                                                        {["#", "Domain", "Type", "Used"].map((h) => (
                                                            <th key={h} className="px-4 py-1.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-[#98A2B3]">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sourceRows.map((row, index) => {
                                                        const tone = typeTone[row.tone]
                                                        return (
                                                            <tr key={row.domain} className="border-b border-[#EEF0F3] last:border-b-0">
                                                                <td className="px-4 py-1.5 text-[11.5px] text-[#98A2B3]">{index + 1}</td>
                                                                <td className="px-4 py-1.5">
                                                                    <div className="flex min-w-0 items-center gap-2">
                                                                        <MonoIcon letter={row.mono} bg={row.monoBg} size={16} />
                                                                        <span className="truncate text-[12px] font-medium text-[#344054]">{row.domain}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-1.5">
                                                                    <span
                                                                        className="inline-flex w-fit rounded-md border px-2 py-0.5 text-[10.5px] font-semibold"
                                                                        style={{ background: tone.bg, color: tone.text, borderColor: tone.border }}
                                                                    >
                                                                        {row.type}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-1.5 text-[11.5px] font-semibold text-[#344054]">{row.used}</td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between border-b border-[#EEF0F3] px-4 py-2.5">
                                                <div>
                                                    <div className="text-[12.5px] font-semibold text-[#0F172A]">Sources Type</div>
                                                    <div className="text-[10.5px] text-[#98A2B3]">Most used domains categorized by type</div>
                                                </div>
                                            </div>
                                            <DonutChart />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

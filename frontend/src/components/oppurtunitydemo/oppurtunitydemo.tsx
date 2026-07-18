import {
    BarChart3,
    Bot,
    BriefcaseBusiness,
    ChevronDown,
    FileText,
    Filter,
    Gauge,
    Globe2,
    HelpCircle,
    LayoutGrid,
    LogOut,
    MessageSquare,
    RefreshCcw,
    Search,
    Settings,
    Sparkles,
    Trophy,
    User,
    Zap,
} from "lucide-react"

type NavItem = {
    label: string
    icon: React.ElementType
    active?: boolean
    badge?: string
}

type NavGroup = {
    title: string
    items: NavItem[]
}

const navGroups: NavGroup[] = [
    {
        title: "GENERAL",
        items: [
            { label: "Overview", icon: LayoutGrid },
            { label: "Opportunities", icon: Sparkles, active: true },
            { label: "GEO Articles", icon: FileText },
            { label: "Prompts", icon: MessageSquare },
            { label: "Sources", icon: Globe2 },
            { label: "Competitors", icon: Trophy },
            { label: "Web Analytics", icon: BarChart3 },
            { label: "Chat", icon: MessageSquare },
        ],
    },
    {
        title: "SETTINGS",
        items: [
            { label: "Profile", icon: User },
            { label: "Subscription", icon: BriefcaseBusiness },
            { label: "Settings", icon: Settings },
            { label: "Admin Panel", icon: Gauge, badge: "Admin" },
        ],
    },
]

const stats = [
    {
        title: "CONTENT GAPS",
        value: "29",
        text: "Prompt intents where content can improve AI visibility",
        icon: Bot,
        tone: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
        title: "HIGH IMPACT",
        value: "0",
        text: "Issues likely to move visibility fastest",
        icon: Zap,
        tone: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
        title: "CREATE PAGES",
        value: "0",
        text: "New content likely needed for missing intents",
        icon: FileText,
        tone: "text-orange-600 bg-orange-50 border-orange-100",
    },
    {
        title: "REFRESH PAGES",
        value: "29",
        text: "Existing pages likely need proof or positioning",
        icon: RefreshCcw,
        tone: "text-slate-600 bg-slate-50 border-slate-100",
    },
]

const gaps = [
    {
        competitor: "PromptMonitor",
        title: "PromptMonitor is ranking ahead",
        subtitle: "PromptMonitor ranks at #2.8 while your brand ranks at #4.2 for this prompt.",
        score: 39,
        category: "Category landing page",
        recommendation:
            "Which sources influence ChatGPT answers for AI visibility software: a practical guide from PromptPulse",
        proof:
            "PromptMonitor has stronger AI-answer evidence for this intent. Sources like linkedin.com and peec.ai are reinforcing competitor answers.",
        intent: "Which sources influence ChatGPT answers for AI visibility software?",
        chips: ["Source intelligence", "18 answers", "PromptMonitor"],
    },
    {
        competitor: "AthenaHQ",
        title: "AthenaHQ is ranking ahead",
        subtitle: "AthenaHQ ranks at #2.8 while your brand ranks at #4.2 for this prompt.",
        score: 39,
        category: "Best tools / category list",
        recommendation:
            "Best tools to monitor competitor visibility across AI answer engines: where PromptPulse fits",
        proof:
            "AthenaHQ has stronger AI-answer evidence for this intent. Sources like g2.com and reddit.com are reinforcing competitor answers.",
        intent: "Best tools to monitor competitor visibility across AI answer engines",
        chips: ["Competitor monitoring", "18 answers", "AthenaHQ"],
    },
]

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold ${className}`}>
            {children}
        </span>
    )
}

function Sidebar() {
    return (
        <aside className="hidden shrink-0 flex-col border-r border-[#25272E] bg-[#15161B] p-2 text-white md:flex" style={{ width: 200 }}>
            <div className="px-2 pb-1.5 pt-1.5">
                <div className="flex items-center gap-2.5 rounded-lg px-2 py-1">
                    <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-[0_2px_5px_rgba(59,130,246,0.35)]"
                        style={{ background: "radial-gradient(120% 120% at 20% 15%, #60A5FA 0%, #3B82F6 55%, #1D4ED8 100%)" }}
                    >
                        <span className="text-[10px] font-bold leading-none">R</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold leading-snug tracking-[-0.01em] text-white">PromptPulse</p>
                        <p className="truncate text-[10px] leading-tight text-[#8A8D99]">United States</p>
                    </div>
                    <ChevronDown size={13} className="text-[#8A8D99]" />
                </div>
            </div>

            <div className="mx-2 mb-1.5 border-t border-[#25272E]" />

            <nav className="flex-1 overflow-hidden px-0.5">
                {navGroups.map((group) => (
                    <div key={group.title}>
                        <p className="px-2.5 pb-1 pt-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#767986]">{group.title}</p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const Icon = item.icon
                                return (
                                    <div
                                        key={item.label}
                                        className={`relative flex min-w-0 items-center gap-2.5 rounded-md px-2.5 py-[5px] text-[12px] font-medium tracking-[-0.01em] ${item.active
                                            ? "bg-[#232429] font-semibold text-white"
                                            : "text-[#D6D8DE]"
                                            }`}
                                    >
                                        {item.active && (
                                            <span className="absolute left-0 top-1/2 h-[12px] w-[2.5px] -translate-y-1/2 rounded-full bg-[#3B82F6]" />
                                        )}
                                        <Icon size={13} className={item.active ? "text-white" : "text-[#8A8D99]"} />
                                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                        {item.badge ? <span className="rounded-full border border-white/20 px-1.5 text-[9px]">{item.badge}</span> : null}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-[#25272E] px-1.5 pb-1.5 pt-1.5 text-[12px] font-medium text-[#8A8D99]">
                <div className="flex items-center gap-2.5 rounded-md px-2.5 py-[5px]"><HelpCircle size={13} />Help</div>
                <div className="flex items-center gap-2.5 rounded-md px-2.5 py-[5px]"><LogOut size={13} />Log out</div>
            </div>
        </aside>
    )
}

function TopFilter({ children }: { children: React.ReactNode }) {
    return (
        <button className="inline-flex h-6 items-center gap-1.5 rounded-lg border border-[#E2E5EA] bg-white px-2.5 text-[11.5px] font-medium text-[#475467]">
            {children}
            <ChevronDown size={12} className="text-[#98A2B3]" />
        </button>
    )
}

function StatCard({ stat }: { stat: (typeof stats)[number] }) {
    const Icon = stat.icon
    return (
        <div className="rounded-xl border border-[#E2E5EA] bg-white px-4 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">{stat.title}</p>
                <div className={`rounded-lg border p-1.5 ${stat.tone}`}><Icon size={13} /></div>
            </div>
            <div className="flex items-end justify-between gap-4">
                <p className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-[#0F172A]">{stat.value}</p>
                <p className="max-w-[150px] text-right text-[11.5px] font-medium leading-snug text-[#667085]">{stat.text}</p>
            </div>
        </div>
    )
}

function GapCard({ gap }: { gap: (typeof gaps)[number] }) {
    return (
        <article className="rounded-2xl border border-[#E2E5EA] bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="mb-2.5 flex items-start justify-between gap-3">
                <div>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                        <Pill className="border-orange-200 bg-orange-50 text-orange-600">↗ Outranked</Pill>
                        <Pill className="border-slate-200 bg-slate-100 text-slate-600">LOW impact</Pill>
                        <Pill className="border-slate-200 bg-slate-100 text-slate-600">MEDIUM effort</Pill>
                        <Pill className="border-blue-200 bg-blue-50 text-blue-700">OPTIMIZE</Pill>
                    </div>
                    <h3 className="text-[13px] font-bold text-[#0F172A]">{gap.title}</h3>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-[#667085]">{gap.subtitle}</p>
                </div>
                <div className="min-w-[66px] text-right">
                    <p className="text-[10px] font-bold tracking-[0.18em] text-[#98A2B3]">SCORE</p>
                    <p className="text-[24px] font-bold leading-none text-[#0F172A]">{gap.score}</p>
                    <div className="ml-auto mt-2 h-1 w-14 rounded-full bg-slate-200">
                        <div className="h-1 w-8 rounded-full bg-slate-400" />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-[#E2E5EA] bg-white p-2.5">
                <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white"><FileText size={14} /></div>
                    <div>
                        <p className="text-[9.5px] font-bold tracking-[0.16em] text-[#98A2B3]">CONTENT GAP RECOMMENDATION</p>
                    </div>
                    <Pill className="border-slate-200 bg-slate-50 text-slate-600">{gap.category}</Pill>
                </div>
                <p className="line-clamp-2 text-[12.5px] font-bold leading-snug text-[#0F172A]">{gap.recommendation}</p>
                <p className="mt-2 line-clamp-2 pl-10 text-[11.5px] leading-relaxed text-[#667085]">{gap.proof}</p>
            </div>

            <div className="mt-2.5 rounded-xl border border-[#E2E5EA] bg-[#F7F8FA] p-2.5">
                <p className="text-[9.5px] font-bold tracking-[0.16em] text-[#98A2B3]">PROMPT INTENT</p>
                <p className="mt-1.5 line-clamp-1 text-[12.5px] font-semibold text-[#344054]">{gap.intent}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {gap.chips.map((chip) => (
                        <span key={chip} className="rounded-md border border-[#E2E5EA] bg-white px-2 py-1 text-[10.5px] font-medium text-[#667085]">{chip}</span>
                    ))}
                </div>
            </div>
        </article>
    )
}

export default function GeoOpportunitiesMock() {
    return (
        <section className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-12">
            <style>{`
                @media (max-width: 767px) {
                    .pp-opportunity-demo-shell {
                        border-radius: 18px !important;
                    }
                    .pp-opportunity-demo-inner {
                        min-width: 0 !important;
                        border-radius: 14px !important;
                    }
                    .pp-opportunity-demo-tabs {
                        width: 100% !important;
                        overflow-x: auto !important;
                        scrollbar-width: none;
                    }
                    .pp-opportunity-demo-tabs::-webkit-scrollbar {
                        display: none;
                    }
                    .pp-opportunity-demo-hero {
                        align-items: stretch !important;
                    }
                    .pp-opportunity-demo-actions {
                        width: 100% !important;
                        justify-content: space-between !important;
                    }
                    .pp-opportunity-demo-filter {
                        flex: 1 1 auto !important;
                        min-width: 0 !important;
                        justify-content: center !important;
                    }
                }
            `}</style>
            <div className="mb-8 max-w-3xl text-center">
                <Pill className="border-blue-100 bg-white/80 text-blue-700 shadow-sm">Opportunity engine</Pill>
                <h2 className="mt-4 text-balance text-[34px] font-extrabold leading-[1.08] tracking-[-0.045em] text-zinc-950 md:text-[46px]">
                    Know exactly what to fix next.
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-balance text-[15px] leading-[1.7] text-zinc-500">
                    PromptPulse turns AI answer evidence into prioritized opportunities, so your team can see which prompts, sources, competitors, and content gaps deserve attention first.
                </p>
            </div>

            <div className="relative mx-auto w-full px-0 sm:px-4">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-12 top-8 h-[320px] rounded-full opacity-80 blur-3xl"
                    style={{ background: "radial-gradient(circle at center, rgba(37,99,235,0.13), rgba(148,163,184,0.10) 42%, transparent 72%)" }}
                />

                <div className="pp-opportunity-demo-shell relative overflow-hidden rounded-[20px] border border-[#E2E5EA] bg-white/95 p-1.5 shadow-[0_34px_110px_rgba(15,23,42,0.16),0_0_0_1px_rgba(255,255,255,0.72)_inset] backdrop-blur sm:rounded-[24px] sm:p-2">
                    <div className="pp-opportunity-demo-inner w-full overflow-hidden rounded-[16px] border border-[#E2E5EA] bg-white text-left md:rounded-[18px]">
                    <div className="flex min-h-[520px]">
                        <Sidebar />

                        <main className="min-w-0 flex-1 bg-white">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F3] bg-white px-5 py-2">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <button className="inline-flex h-6 items-center rounded-lg bg-[#15161B] px-2.5 text-[11.5px] font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.3)]">PromptPulse</button>
                                    <span className="pp-opportunity-demo-filter"><TopFilter>All time</TopFilter></span>
                                    <span className="pp-opportunity-demo-filter"><TopFilter>All Topics</TopFilter></span>
                                    <span className="pp-opportunity-demo-filter"><TopFilter>All Models</TopFilter></span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#EEF8F5] p-2.5">
                                <section className="rounded-2xl border border-[#E2E5EA] bg-white/95 px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="pp-opportunity-demo-hero flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <Pill className="border-blue-100 bg-white/80 text-blue-700 shadow-sm">GEO opportunity intelligence</Pill>
                                            <h2 className="mt-2 text-[22px] font-bold tracking-tight text-[#0F172A]">
                                                Find the pages and angles AI answers are missing.
                                            </h2>
                                            <p className="mt-1 max-w-3xl text-[12.5px] leading-5 text-[#667085]">
                                                Prioritized content gaps from competitor rank, visibility, sentiment, and source evidence.
                                            </p>
                                        </div>
                                        <div className="pp-opportunity-demo-actions flex items-center gap-2 rounded-xl border border-[#E2E5EA] bg-white p-1 shadow-sm">
                                            <button className="rounded-lg bg-[#15161B] px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white">
                                                Create Pages
                                                <span className="block text-xl leading-none">0</span>
                                            </button>
                                            <button className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-xs font-semibold text-[#475467]"><RefreshCcw size={14} /> Refresh</button>
                                        </div>
                                    </div>
                                </section>

                                <div className="mt-2.5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
                                    {stats.map((stat) => <StatCard key={stat.title} stat={stat} />)}
                                </div>

                                <section className="mt-2.5 overflow-hidden rounded-2xl border border-[#E2E5EA] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F3] px-4 py-2.5">
                                        <div className="flex items-start gap-2">
                                            <Filter size={14} className="mt-0.5 text-[#98A2B3]" />
                                            <div>
                                                <h3 className="text-[12.5px] font-semibold text-[#0F172A]">Prioritized content gaps</h3>
                                                <p className="text-[10.5px] text-[#98A2B3]">Filtered by the controls above for PromptPulse.</p>
                                            </div>
                                        </div>
                                        <div className="relative w-full sm:w-auto">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                                            <input
                                                className="h-8 w-full rounded-lg border border-[#E2E5EA] bg-white pl-9 pr-3 text-xs outline-none placeholder:text-[#98A2B3] focus:border-blue-300 sm:w-[270px]"
                                                placeholder="Search content gap, source, competitor"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F3] bg-[#F7F8FA] px-4 py-2.5">
                                        <div className="pp-opportunity-demo-tabs flex gap-1 rounded-lg bg-slate-100 p-1 text-xs font-semibold text-[#667085]">
                                            {['All', 'Create', 'Outranked', 'Sources', 'Sentiment'].map((tab) => (
                                                <button key={tab} className={`rounded-md px-3 py-1.5 ${tab === 'All' ? 'bg-white text-[#0F172A] shadow-sm' : ''}`}>{tab}</button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-[#98A2B3]">29 shown</p>
                                    </div>

                                    <div className="grid gap-3 p-3 xl:grid-cols-2">
                                        {gaps.map((gap) => <GapCard key={gap.competitor} gap={gap} />)}
                                    </div>
                                </section>
                            </div>
                        </main>
                    </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

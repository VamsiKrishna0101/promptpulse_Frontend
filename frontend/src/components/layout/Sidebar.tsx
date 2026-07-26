import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import * as Tooltip from "@radix-ui/react-tooltip"
import { useAuth } from "@/hooks/useAuth"
import { useProjects } from "@/hooks/useProjects"
import { countryByName, countryFlagUrl, countryLabel } from "@/lib/countries"

// ── Icons ─────────────────────────────────────────────────────────────────────
const O = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props} />
)

const icons = {
    overview: <O><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></O>,
    opportunities: <O><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><circle cx="12" cy="12" r="4" /><path d="M15 9l4-4" /><path d="M9 15l-4 4" /></O>,
    aiWorkspace: <O><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" /><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" /><path d="M5 15l.6 1.6L7 17l-1.4.4L5 19l-.6-1.6L3 17l1.4-.4L5 15Z" /></O>,
    geoArticles: <O><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" /><path d="M14 2v5h5" /><path d="M8 13h8" /><path d="M8 17h5" /><path d="M9 9h1" /></O>,
    prompts: <O><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></O>,
    sources: <O><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></O>,
    seo: <O><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 15l3-3 2 2 5-6" /><path d="M17 8h1v1" /></O>,
    competitors: <O><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M17 6h3a3 3 0 0 1-3 3" /><path d="M7 6H4a3 3 0 0 0 3 3" /></O>,
    analytics: <O><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></O>,
    chat: <O><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5Z" /><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" /></O>,
    profile: <O><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></O>,
    subscription: <O><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /><path d="M15 15h2" /></O>,
    agency: <O><path d="M3 21h18" /><path d="M5 21V9l7-5 7 5v12" /><path d="M9 21v-7h6v7" /></O>,
    admin: <O><path d="M12 3l8 4v5c0 5-3.4 8.7-8 9-4.6-.3-8-4-8-9V7l8-4Z" /><path d="M9.5 12.5l1.6 1.6 3.6-4.1" /></O>,
    settings: <O><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></O>,
    help: <O><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></O>,
    logout: <O><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></O>,
    plus: <O><path d="M12 5v14" /><path d="M5 12h14" /></O>,
    chevron: <O width="11" height="11"><polyline points="6 9 12 15 18 9" /></O>,
    check: <O width="12" height="12"><polyline points="20 6 9 17 4 12" /></O>,
    billing: <O><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></O>,
}

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({
    icon, label, href, badge, onClick, tourId, tone = "default",
}: {
    icon: React.ReactNode
    label: string
    href?: string
    badge?: string
    onClick?: () => void
    tourId?: string
    tone?: "default" | "support" | "danger"
}) {
    const location = useLocation()
    const isActive = href
        ? href === "/admin"
            ? location.pathname.startsWith("/admin")
            : href === "/ai-workspace"
                ? location.pathname.startsWith("/ai-workspace")
                : location.pathname === href
        : false

    const base = "relative flex w-full items-center justify-center gap-2.5 rounded-xl px-3 py-2 text-[14px] text-left appearance-none border-0 transition-all duration-200 ease-out active:scale-[0.985] group min-[1440px]:justify-start min-[1440px]:px-3.5"

    const state = tone === "support"
        ? "premium-support-nav text-white font-black"
        : tone === "danger"
            ? "premium-logout-nav font-semibold"
            : isActive
                ? "premium-nav-item-active text-white font-bold"
                : "bg-transparent text-[#D6D8DE] font-semibold hover:text-white hover:bg-white/[0.07]"

    const iconColor = tone === "support"
        ? "text-white"
        : tone === "danger"
            ? "premium-logout-icon"
            : isActive
                ? "text-[#93C5FD]"
                : "text-[#A9AFBD] group-hover:text-white"

    const inner = (
        <>
            {isActive && tone !== "support" && tone !== "danger" && (
                <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[#60A5FA] shadow-[0_0_18px_rgba(96,165,250,0.72)]" />
            )}
            <span className={["flex-shrink-0 transition-colors duration-150", iconColor].join(" ")}>
                {icon}
            </span>
            <span className="hidden flex-1 leading-none min-[1440px]:block transition-colors duration-150">{label}</span>
            {badge && (
                <span className="hidden rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-bold leading-none text-white min-[1440px]:inline-flex">
                    {badge}
                </span>
            )}
        </>
    )

    const linkContent = onClick ? (
        <button type="button" data-product-tour-id={tourId} onClick={onClick} className={`${base} ${state}`}>{inner}</button>
    ) : (
        <Link to={href ?? "#"} data-product-tour-id={tourId} className={`${base} ${state}`}>{inner}</Link>
    )

    return (
        <Tooltip.Root delayDuration={0}>
            <Tooltip.Trigger asChild>
                {linkContent}
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content
                    side="right"
                    sideOffset={12}
                    className="z-[100] hidden rounded-lg bg-[#0F172A]/95 px-2.5 py-1.5 text-[12px] font-semibold text-slate-100 shadow-[0_8px_16px_rgba(0,0,0,0.4)] backdrop-blur-[2px] max-[1439px]:block"
                >
                    {label}
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, badge }: { label: string; badge?: string }) {
    return (
        <div className="hidden items-center justify-between px-3.5 pb-1 pt-3 min-[1440px]:flex">
            <span className="premium-section-label text-[10.5px] font-black uppercase tracking-wider select-none">
                {label}
            </span>
            {badge && (
                <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-bold leading-none text-white">
                    {badge}
                </span>
            )}
        </div>
    )
}

function ProjectCountry({ location }: { location?: string | null }) {
    const country = countryByName(location)
    const label = countryLabel(location)

    return (
        <span className="inline-flex min-w-0 items-center gap-1">
            {country ? (
                <img
                    src={countryFlagUrl(country.code)}
                    alt={`${country.name} flag`}
                    className="h-2.5 w-3.5 flex-shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.16)]"
                    loading="lazy"
                />
            ) : (
                <span className="h-2.5 w-3.5 flex-shrink-0 rounded-[2px] border border-white/15 bg-white/10" />
            )}
            <span className="min-w-0 truncate">{label}</span>
        </span>
    )
}

// ── Workspace switcher (custom dropdown, replaces native <select>) ───────────
function WorkspaceSwitcher() {
    const { projects, selectedProject, selectProject } = useProjects()
    useAuth()
    const [open, setOpen] = useState(false)
    const [logoFailed, setLogoFailed] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const logoDomain = selectedProject?.brand_url?.trim() || "promptpulse.com"
    const logoSrc = logoFailed
        ? "/favicon.svg"
        : `https://www.google.com/s2/favicons?domain=${encodeURIComponent(logoDomain)}&sz=64`
    const canAddProject = true

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        function onEscape(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false)
        }
        document.addEventListener("mousedown", onClickOutside)
        document.addEventListener("keydown", onEscape)
        return () => {
            document.removeEventListener("mousedown", onClickOutside)
            document.removeEventListener("keydown", onEscape)
        }
    }, [])

    useEffect(() => {
        setLogoFailed(false)
    }, [logoDomain])

    return (
        <div ref={containerRef} data-product-tour-id="workspace-switcher" className="relative px-3 py-3.5 xl:px-4">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-center gap-3 rounded-xl px-1.5 py-1.5 transition hover:bg-white/[0.065] min-[1440px]:justify-start"
            >
                <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white shadow-[0_14px_26px_-18px_rgba(15,23,42,0.95),inset_0_1px_0_rgba(255,255,255,0.42)]"
                >
                    <img
                        src={logoSrc}
                        alt={`${selectedProject?.brand_name ?? "Brand"} logo`}
                        className="h-7 w-7 object-contain"
                        onError={() => setLogoFailed(true)}
                    />
                </div>
                <div className="hidden min-w-0 flex-1 text-left min-[1440px]:block">
                    <p className="truncate text-[16px] font-black leading-tight text-white">
                        {selectedProject?.brand_name ?? "No project"}
                    </p>
                    <p className="mt-0.5 truncate text-[13px] font-semibold leading-tight text-[#9BA8B8]">
                        <ProjectCountry location={selectedProject?.brand_location} />
                    </p>
                </div>
                <span className={["hidden flex-shrink-0 text-[#9BA8B8] transition-transform min-[1440px]:block", open ? "rotate-180" : ""].join(" ")}>
                    {icons.chevron}
                </span>
            </button>

            {open && (
                <div className="absolute left-3 right-3 top-[calc(100%-4px)] z-30 overflow-hidden rounded-2xl border border-white/10 bg-[#172033]/98 py-1 shadow-[0_18px_46px_-12px_rgba(0,0,0,0.55)] backdrop-blur xl:left-4 xl:right-4">
                    {projects.length === 0 ? (
                        <p className="px-3 py-2 text-[12.5px] text-[#9BA8B8]">No projects yet</p>
                    ) : (
                        projects.map((p) => {
                            const active = p.id === selectedProject?.id
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => { selectProject(p.id); setOpen(false) }}
                                    className={[
                                        "flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] transition",
                                        active ? "bg-white/10 text-white font-bold" : "text-[#C8D1DE] hover:bg-white/[0.075]",
                                    ].join(" ")}
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate">{p.brand_name}</span>
                                        <span className="mt-0.5 flex min-w-0 text-[10.5px] font-medium text-[#9BA8B8]">
                                            <ProjectCountry location={p.brand_location} />
                                        </span>
                                    </span>
                                    {active && <span className="flex-shrink-0 text-[#9EE6C8]">{icons.check}</span>}
                                </button>
                            )
                        })
                    )}
                    <div className="my-1 border-t border-white/10" />
                    {canAddProject ? (
                        <Link
                            to="/onboarding"
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] font-bold text-[#C8D1DE] transition hover:bg-white/[0.075] hover:text-white"
                        >
                            <span className="flex-shrink-0 text-[#9EE6C8]">{icons.plus}</span>
                            <span className="min-w-0 flex-1 truncate">Add project</span>
                            <span className="text-[10px] font-semibold text-[#9BA8B8]">Unlimited</span>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            disabled
                            className="flex w-full cursor-not-allowed items-center gap-2 px-3 py-2 text-left text-[12.5px] font-semibold text-[#9BA8B8]"
                        >
                            <span className="flex-shrink-0">{icons.plus}</span>
                            <span className="min-w-0 flex-1 truncate">Add another project</span>
                            <span className="text-[10px]">PAYG</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar() {
    const { logout, user } = useAuth()
    const navigate = useNavigate()
    const isAdmin = user?.role === "ADMIN"
    const [creditsBalance, setCreditsBalance] = useState<number | null>(user?.credits_balance ?? null)

    useEffect(() => {
        import("@/lib/api").then(({ api }) => {
            api.get<{ credits_balance: number; low_balance: boolean }>("/payments/balance")
                .then(res => setCreditsBalance(res.data.credits_balance))
                .catch(() => null)
        })
    }, [])

    return (
        <Tooltip.Provider delayDuration={50}>
        <aside className="premium-sidebar sticky top-0 flex h-screen w-[72px] select-none flex-col min-[1440px]:w-[240px]">
            <style>{`
                .premium-sidebar {
                    background: linear-gradient(180deg, #0B1220 0%, #0A0F1C 55%, #080C16 100%);
                    border-right: 1px solid rgba(255, 255, 255, 0.06);
                    box-shadow: 1px 0 24px rgba(0, 0, 0, 0.35);
                }
                .premium-nav-item-active {
                    background: linear-gradient(90deg, rgba(96, 165, 250, 0.16), rgba(96, 165, 250, 0.03));
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
                }
                .premium-section-label {
                    color: #6B7280;
                    letter-spacing: 0.08em;
                }
                .premium-support-nav {
                    background: linear-gradient(135deg, #16A34A, #059669);
                    box-shadow: 0 8px 20px -8px rgba(16, 185, 129, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12);
                    transition: background 0.2s ease;
                }
                .premium-support-nav:hover {
                    background: linear-gradient(135deg, #15803D, #047857);
                }
                .premium-logout-nav {
                    background: transparent;
                    color: #D6D8DE;
                    transition: background 0.2s ease, color 0.2s ease;
                }
                .premium-logout-nav:hover {
                    background: rgba(239, 68, 68, 0.10);
                    color: #F87171;
                }
                .premium-logout-nav:hover .premium-logout-icon {
                    color: #F87171;
                }
                .premium-logout-icon {
                    color: #9EA1AC;
                    transition: color 0.2s ease;
                }
            `}</style>

            {/* ── Workspace ── */}
            <WorkspaceSwitcher />

            <div className="mx-3 border-t border-white/10 min-[1440px]:mx-5" />

            {/* ── Nav ── */}
            <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 min-[1440px]:px-3">
                <SectionLabel label="General" />
                <NavItem icon={icons.overview} label="Overview" href="/dashboard" tourId="nav-overview" />
                <NavItem icon={icons.opportunities} label="Opportunities" href="/opportunities" tourId="nav-opportunities" />
                <NavItem icon={icons.prompts} label="Prompts" href="/prompts" tourId="nav-prompts" />
                <NavItem icon={icons.sources} label="Sources" href="/sources" tourId="nav-sources" />
                <NavItem icon={icons.seo} label="AI SEO" href="/seo" tourId="nav-seo" />
                <NavItem icon={icons.competitors} label="Competitors" href="/competitors" tourId="nav-competitors" />
                <NavItem icon={icons.analytics} label="Web Analytics" href="/analytics" tourId="nav-analytics" />
                <NavItem icon={icons.chat} label="Chat" href="/chat" tourId="nav-chat" />

                <SectionLabel label="Settings" />
                <NavItem icon={icons.profile} label="Profile" href="/profile" />
                <NavItem
                    icon={icons.billing}
                    label="Billing & Credits"
                    href="/billing"
                    badge={creditsBalance !== null ? `${creditsBalance.toLocaleString()} cr` : undefined}
                />
                <NavItem icon={icons.settings} label="Settings" href="/settings" />
                {user?.account_type === "AGENCY" && <NavItem icon={icons.agency} label="Agency" href="/agency" />}
                {isAdmin && <NavItem icon={icons.admin} label="Admin Panel" href="/admin" badge="Admin" />}
            </nav>

            {/* ── Bottom ── */}
            <div className="flex-shrink-0 px-2 pb-4 min-[1440px]:px-3">
                <div className="mb-3 border-t border-white/10" />
                <NavItem icon={icons.aiWorkspace} label="AI Workspace" href="/ai-workspace" tourId="nav-ai-workspace" />
                <NavItem icon={icons.help} label="Help" href="/help" tourId="nav-help" tone="support" />
                <NavItem icon={icons.logout} label="Log out" tone="danger" onClick={() => { logout(); navigate("/login") }} />
            </div>

        </aside>
        </Tooltip.Provider>
    )
}

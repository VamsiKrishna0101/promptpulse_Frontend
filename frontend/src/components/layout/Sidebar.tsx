import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import * as Tooltip from "@radix-ui/react-tooltip"
import {
    Building2,
    FileText,
    Gauge,
    Link2,
    ScanSearch,
    Search,
    UsersRound,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useProjects } from "@/hooks/useProjects"
import { countryByName, countryFlagUrl, countryLabel } from "@/lib/countries"
import { useWorkspaceMode } from "@/features/workspace-mode/useWorkspaceMode"

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
    seo: <O><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /><path d="M8.5 11a2.5 2.5 0 0 1 5 0" /><path d="M11 8.5v5" /></O>,
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
    campaigns: (
        <O>
            <path d="m3 11 18-5v12L3 14v-3z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </O>
    ),
    phoneDesk: (
        <O>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </O>
    ),
}

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({
    icon, label, href, badge, onClick, tourId, tone = "default", disabled = false, disabledTooltip,
}: {
    icon: React.ReactNode
    label: string
    href?: string
    badge?: string
    onClick?: () => void
    tourId?: string
    tone?: "default" | "support" | "danger"
    disabled?: boolean
    disabledTooltip?: string
}) {
    const location = useLocation()
    const isActive = !disabled && href
        ? href === "/admin"
            ? location.pathname.startsWith("/admin")
            : href === "/ai-workspace"
                ? location.pathname.startsWith("/ai-workspace")
                : href === "/campaigns"
                    ? location.pathname.startsWith("/campaigns")
                    : href === "/voice-ai"
                        ? location.pathname.startsWith("/voice-ai")
                        : href === "/seo"
                            ? location.pathname === "/seo"
                            : href.startsWith("/seo/")
                                ? location.pathname === href || location.pathname.startsWith(`${href}/`)
                                : location.pathname === href
        : false

    const base = "relative flex w-full items-center gap-2.5 rounded-[4px] px-2.5 py-[6px] text-[13px] text-left appearance-none border-0 transition-all duration-150 ease-out group min-[1440px]:justify-start"

    const state = disabled
        ? "opacity-50 cursor-not-allowed select-none text-slate-400"
        : tone === "support"
        ? "semrush-support-nav"
        : tone === "danger"
            ? "semrush-logout-nav"
            : isActive
                ? "semrush-nav-active"
                : "semrush-nav-default"

    const iconColor = disabled
        ? "text-slate-400"
        : tone === "support"
        ? "text-white"
        : tone === "danger"
            ? "semrush-logout-icon"
            : isActive
                ? "text-slate-900"
                : "text-slate-400 group-hover:text-slate-600"

    const inner = (
        <>
            <span className={["flex-shrink-0 transition-colors duration-150", iconColor].join(" ")}>
                {icon}
            </span>
            <span className="hidden flex-1 leading-none min-[1440px]:block transition-colors duration-150">{label}</span>
            {badge && (
                <span className="hidden rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-slate-500 min-[1440px]:inline-flex">
                    {badge}
                </span>
            )}
        </>
    )

    const linkContent = disabled ? (
        <div data-product-tour-id={tourId} className={`${base} ${state}`}>{inner}</div>
    ) : onClick ? (
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
                    className="z-[100] hidden rounded-md bg-slate-900 px-2.5 py-1.5 text-[12px] font-medium text-white shadow-lg max-[1439px]:block"
                >
                    {disabledTooltip || label}
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, badge }: { label: string; badge?: string }) {
    return (
        <div className="hidden items-center justify-between px-2.5 pb-0.5 pt-5 min-[1440px]:flex">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.07em] select-none text-slate-400">
                {label}
            </span>
            {badge && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-slate-500">
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
                    className="h-2.5 w-3.5 flex-shrink-0 rounded-[2px] object-cover"
                    loading="lazy"
                />
            ) : (
                <span className="h-2.5 w-3.5 flex-shrink-0 rounded-[2px] border border-slate-200 bg-slate-100" />
            )}
            <span className="min-w-0 truncate">{label}</span>
        </span>
    )
}

// ── Workspace switcher ────────────────────────────────────────────────────────
function WorkspaceSwitcher() {
    const { projects, selectedProject, selectProject } = useProjects()
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [logoFailed, setLogoFailed] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const logoDomain = selectedProject?.brand_url?.trim() || "promptpulse.com"
    const logoSrc = logoFailed
        ? "/favicon.svg"
        : `https://www.google.com/s2/favicons?domain=${encodeURIComponent(logoDomain)}&sz=64`

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
        <div ref={containerRef} data-product-tour-id="workspace-switcher" className="relative px-3 py-3 xl:px-4">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center gap-2.5 rounded-md px-1 py-1.5 transition hover:bg-slate-50 min-[1440px]:justify-start"
            >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
                    <img
                        src={logoSrc}
                        alt={`${selectedProject?.brand_name ?? "Brand"} logo`}
                        className="h-5 w-5 object-contain"
                        onError={() => setLogoFailed(true)}
                    />
                </div>
                <div className="hidden min-w-0 flex-1 text-left min-[1440px]:block">
                    <p className="truncate text-[14px] font-semibold leading-tight text-slate-900">
                        {selectedProject?.brand_name ?? "No project"}
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] font-normal leading-tight text-slate-500">
                        <ProjectCountry location={selectedProject?.brand_location} />
                    </p>
                </div>
                <span className={["hidden flex-shrink-0 text-slate-400 transition-transform min-[1440px]:block", open ? "rotate-180" : ""].join(" ")}>
                    {icons.chevron}
                </span>
            </button>

            {open && (
                <div className="absolute left-3 right-3 top-[calc(100%-4px)] z-30 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg xl:left-4 xl:right-4">
                    {projects.length === 0 ? (
                        <p className="px-3 py-2 text-[12.5px] text-slate-500">No projects yet</p>
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
                                        active ? "bg-slate-50 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50",
                                    ].join(" ")}
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate">{p.brand_name}</span>
                                        <span className="mt-0.5 flex min-w-0 text-[10.5px] font-normal text-slate-400">
                                            <ProjectCountry location={p.brand_location} />
                                        </span>
                                    </span>
                                    {active && <span className="flex-shrink-0 text-slate-900">{icons.check}</span>}
                                </button>
                            )
                        })
                    )}
                    <div className="my-1 border-t border-slate-100" />
                    {projects.length >= 1 && (user?.plan === "FREE" || !user?.credits_balance || user?.credits_balance <= 0) ? (
                        <Link
                            to="/billing"
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                            <span className="flex-shrink-0">{icons.plus}</span>
                            <span className="min-w-0 flex-1 truncate">{user?.account_type === "AGENCY" ? "Add client brand" : "Add brand"}</span>
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9.5px] font-semibold text-emerald-800">Upgrade</span>
                        </Link>
                    ) : (
                        <Link
                            to="/onboarding"
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                            <span className="flex-shrink-0 text-slate-500">{icons.plus}</span>
                            <span className="min-w-0 flex-1 truncate">{user?.account_type === "AGENCY" ? "Add client brand" : "Add brand"}</span>
                            <span className="text-[10px] font-medium text-slate-400">Workspace</span>
                        </Link>
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
    const { mode } = useWorkspaceMode()
    const isAdmin = user?.role === "ADMIN"
    const [creditsBalance, setCreditsBalance] = useState<number | null>(user?.credits_balance ?? null)
    const isSeo = mode === "SEO"

    useEffect(() => {
        import("@/lib/api").then(({ api }) => {
            api.get<{ credits_balance: number; low_balance: boolean }>("/payments/balance")
                .then(res => setCreditsBalance(res.data.credits_balance))
                .catch(() => null)
        })
    }, [])

    return (
        <Tooltip.Provider delayDuration={50}>
            <aside className="sticky top-0 flex h-screen w-[72px] select-none flex-col min-[1440px]:w-[220px]"
                style={{ background: "#f5f5f5", borderRight: "1px solid #e0e0e0" }}
            >
                <style>{`
                .semrush-nav-active {
                    background: #e8e8e8;
                    color: #1a1a1a;
                    font-weight: 600;
                }
                .semrush-nav-default {
                    background: transparent;
                    color: #444746;
                    font-weight: 400;
                }
                .semrush-nav-default:hover {
                    background: #ebebeb;
                    color: #1a1a1a;
                }
                .semrush-logout-nav {
                    background: transparent;
                    color: #666;
                    font-weight: 400;
                    transition: background 0.15s ease, color 0.15s ease;
                }
                .semrush-logout-nav:hover {
                    background: #fef2f2;
                    color: #ef4444;
                }
                .semrush-logout-nav:hover .semrush-logout-icon {
                    color: #ef4444;
                }
                .semrush-logout-icon {
                    color: #9ca3af;
                    transition: color 0.15s ease;
                }
                .semrush-support-nav {
                    background: #1a1a1a;
                    color: white;
                    font-weight: 500;
                    border-radius: 4px;
                }
                .semrush-support-nav:hover {
                    background: #333;
                }
            `}</style>

                {/* ── Workspace ── */}
                <WorkspaceSwitcher />

                <div className="mx-3 border-t border-slate-100 min-[1440px]:mx-4" />

                {/* ── Nav ── */}
                <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 min-[1440px]:px-3">
                    {mode === "GEO" ? (
                        <>
                            <SectionLabel label="GEO Intelligence" />
                            <NavItem icon={icons.overview} label="Overview" href="/dashboard" tourId="nav-overview" />
                            <NavItem icon={icons.opportunities} label="Opportunities" href="/opportunities" tourId="nav-opportunities" />
                            <NavItem icon={icons.prompts} label="Prompts" href="/prompts" tourId="nav-prompts" />
                            <NavItem icon={icons.sources} label="Sources" href="/sources" tourId="nav-sources" />
                            <NavItem icon={icons.competitors} label="Competitors" href="/competitors" tourId="nav-competitors" />
                            <NavItem icon={icons.chat} label="Chat" href="/chat" tourId="nav-chat" />
                            <SectionLabel label="Outreach" />
                            <NavItem
                                icon={icons.campaigns}
                                label="Campaigns"
                                href="/campaigns"
                                tourId="nav-campaigns"
                            />
                        </>
                    ) : (
                        <>
                            <SectionLabel label="SEO Toolkit" />
                            <NavItem icon={<Gauge size={14} />} label="SEO Overview" href="/seo" />
                            <NavItem icon={<Building2 size={14} />} label="Domain Overview" href="/seo/domain-research" />
                            <NavItem icon={<FileText size={14} />} label="Top Pages" href="/seo/top-pages" />
                            <NavItem icon={<UsersRound size={14} />} label="Organic Competitors" href="/seo/organic-competitors" />
                            <NavItem icon={<Search size={14} />} label="Keyword Research" href="/seo/keyword-research" />
                            <NavItem icon={<ScanSearch size={14} />} label="Site Audit" href="/seo/site-audit" />
                            <NavItem icon={<Link2 size={14} />} label="Backlinks" href="/seo/backlinks" />
                        </>
                    )}

                    <SectionLabel label="Settings" />
                    <NavItem icon={icons.profile} label="Profile" href="/profile" />
                    <NavItem
                        icon={icons.billing}
                        label="Billing & Credits"
                        href="/billing"
                        badge={creditsBalance !== null ? `${creditsBalance.toLocaleString()} cr` : undefined}
                    />
                    <NavItem icon={icons.settings} label="Settings" href="/settings" />
                    <NavItem
                        icon={icons.agency}
                        label="Agency Portal"
                        disabled
                        badge="Soon"
                        disabledTooltip="Agency Portal is temporarily disabled"
                    />
                    {isAdmin && <NavItem icon={icons.admin} label="Admin Panel" href="/admin" badge="Admin" />}
                </nav>

                {/* ── Bottom ── */}
                <div className="flex-shrink-0 px-2 pb-4 min-[1440px]:px-3">
                    <div className="mb-2 border-t border-slate-100" />
                    {mode === "GEO" && (
                        <NavItem icon={icons.aiWorkspace} label="AI Workspace" href="/ai-workspace" tourId="nav-ai-workspace" />
                    )}
                    {/* Sara / Help chat — only shown in GEO mode */}
                    {!isSeo && (
                        <NavItem icon={icons.help} label="Help" href="/help" tourId="nav-help" tone="support" />
                    )}
                    <NavItem icon={icons.logout} label="Log out" tone="danger" onClick={() => { logout(); navigate("/login") }} />
                </div>

            </aside>
        </Tooltip.Provider>
    )
}

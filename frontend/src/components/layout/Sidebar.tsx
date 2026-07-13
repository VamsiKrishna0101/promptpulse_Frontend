import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useProjects } from "@/hooks/useProjects"

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
    competitors: <O><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M17 6h3a3 3 0 0 1-3 3" /><path d="M7 6H4a3 3 0 0 0 3 3" /></O>,
    analytics: <O><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></O>,
    chat: <O><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5Z" /><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" /></O>,
    profile: <O><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></O>,
    subscription: <O><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /><path d="M15 15h2" /></O>,
    admin: <O><path d="M12 3l8 4v5c0 5-3.4 8.7-8 9-4.6-.3-8-4-8-9V7l8-4Z" /><path d="M9.5 12.5l1.6 1.6 3.6-4.1" /></O>,
    settings: <O><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></O>,
    help: <O><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></O>,
    logout: <O><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></O>,
    chevron: <O width="11" height="11"><polyline points="6 9 12 15 18 9" /></O>,
    check: <O width="12" height="12"><polyline points="20 6 9 17 4 12" /></O>,
}

// ── NavItem ───────────────────────────────────────────────────────────────────
// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({
    icon, label, href, badge, onClick, tourId,
}: {
    icon: React.ReactNode
    label: string
    href?: string
    badge?: string
    onClick?: () => void
    tourId?: string
}) {
    const location = useLocation()
    const isActive = href
        ? href === "/admin"
            ? location.pathname.startsWith("/admin")
            : href === "/ai-workspace"
                ? location.pathname.startsWith("/ai-workspace")
                : location.pathname === href
        : false

    const base = "relative flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-[14px] text-left appearance-none border-0 bg-transparent transition-all duration-200 ease-out active:scale-[0.985] group"
    const state = isActive
        ? "premium-nav-item-active text-white font-bold"
        : "text-[#D6D8DE] font-semibold hover:text-white hover:bg-white/[0.07]"

    const inner = (
        <>
            {isActive && (
                <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[#60A5FA] shadow-[0_0_18px_rgba(96,165,250,0.72)]" />
            )}
            <span className={["flex-shrink-0", isActive ? "text-[#93C5FD]" : "text-[#9EA1AC] group-hover:text-white"].join(" ")}>
                {icon}
            </span>
            <span className="flex-1 leading-none">{label}</span>
            {badge && (
                <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-bold leading-none text-white">
                    {badge}
                </span>
            )}
        </>
    )

    if (onClick) return <button type="button" data-product-tour-id={tourId} onClick={onClick} className={`${base} ${state}`}>{inner}</button>
    return <Link to={href ?? "#"} data-product-tour-id={tourId} className={`${base} ${state}`}>{inner}</Link>
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, badge }: { label: string; badge?: string }) {
    return (
        <div className="flex items-center justify-between px-3.5 pb-1 pt-3">
            <span className="premium-section-label text-[10.5px] font-black uppercase select-none">
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

// ── Workspace switcher (custom dropdown, replaces native <select>) ───────────
function WorkspaceSwitcher() {
    const { projects, selectedProject, selectProject } = useProjects()
    const [open, setOpen] = useState(false)
    const [logoFailed, setLogoFailed] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const logoDomain = selectedProject?.brand_url?.trim() || "refractone.com"
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
        <div ref={containerRef} data-product-tour-id="workspace-switcher" className="relative px-5 py-4">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center gap-3 rounded-2xl px-1 py-1 transition hover:bg-white/[0.045]"
            >
                <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white shadow-[0_14px_30px_-16px_rgba(59,130,246,0.75),inset_0_1px_0_rgba(255,255,255,0.32)]"
                >
                    <img
                        src={logoSrc}
                        alt={`${selectedProject?.brand_name ?? "Brand"} logo`}
                        className="h-7 w-7 object-contain"
                        onError={() => setLogoFailed(true)}
                    />
                </div>
                <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[16px] font-black leading-tight text-white">
                        {selectedProject?.brand_name ?? "No project"}
                    </p>
                    <p className="mt-0.5 truncate text-[13px] font-medium leading-tight text-[#969BA8]">
                        {selectedProject?.brand_location ?? "India"}
                    </p>
                </div>
                <span className={["flex-shrink-0 text-[#858A97] transition-transform", open ? "rotate-180" : ""].join(" ")}>
                    {icons.chevron}
                </span>
            </button>

            {open && (
                <div className="absolute left-5 right-5 top-[calc(100%-4px)] z-30 overflow-hidden rounded-2xl border border-white/10 bg-[#101218]/95 py-1 shadow-[0_18px_46px_-12px_rgba(0,0,0,0.65)] backdrop-blur">
                    {projects.length === 0 ? (
                        <p className="px-3 py-2 text-[12.5px] text-[#858A97]">No projects yet</p>
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
                                        active ? "bg-[#3B82F6]/18 text-white font-bold" : "text-[#D6D8DE] hover:bg-white/[0.07]",
                                    ].join(" ")}
                                >
                                    <span className="min-w-0 flex-1 truncate">{p.brand_name}</span>
                                    {active && <span className="flex-shrink-0 text-[#60A5FA]">{icons.check}</span>}
                                </button>
                            )
                        })
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

    return (
        <aside className="premium-sidebar sticky top-0 flex h-screen w-[280px] select-none flex-col">

            {/* ── Workspace ── */}
            <WorkspaceSwitcher />

            <div className="mx-5 border-t border-white/10" />

            {/* ── Nav ── */}
            <nav className="min-h-0 flex-1 overflow-hidden px-3 py-1">
                <SectionLabel label="General" />
                <NavItem icon={icons.overview} label="Overview" href="/dashboard" tourId="nav-overview" />
                <NavItem icon={icons.opportunities} label="Opportunities" href="/opportunities" tourId="nav-opportunities" />
                <NavItem icon={icons.prompts} label="Prompts" href="/prompts" tourId="nav-prompts" />
                <NavItem icon={icons.sources} label="Sources" href="/sources" tourId="nav-sources" />
                <NavItem icon={icons.competitors} label="Competitors" href="/competitors" tourId="nav-competitors" />
                <NavItem icon={icons.analytics} label="Web Analytics" href="/analytics" tourId="nav-analytics" />
                <NavItem icon={icons.chat} label="Chat" href="/chat" tourId="nav-chat" />

                <SectionLabel label="Settings" />
                <NavItem icon={icons.profile} label="Profile" href="/profile" />
                <NavItem icon={icons.subscription} label="Subscription" href="/subscription" />
                <NavItem icon={icons.settings} label="Settings" href="/settings" />
                {isAdmin && <NavItem icon={icons.admin} label="Admin Panel" href="/admin" badge="Admin" />}
            </nav>

            {/* ── Bottom ── */}
            <div className="flex-shrink-0 px-3 pb-4">
                <div className="mb-3 border-t border-white/10" />
                <NavItem icon={icons.aiWorkspace} label="AI Workspace" href="/ai-workspace" tourId="nav-ai-workspace" />
                <NavItem icon={icons.help} label="Help" href="/help" tourId="nav-help" />
                <NavItem icon={icons.logout} label="Log out" onClick={() => { logout(); navigate("/login") }} />
            </div>

        </aside>
    )
}

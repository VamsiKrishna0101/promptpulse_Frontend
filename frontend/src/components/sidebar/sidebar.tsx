import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useProjects } from "@/hooks/useProjects"

// ── Palette — charcoal, not pure black ──────────────────────────────────────
// BASE:    sidebar background
// SURFACE: hover / active pill background
// ELEVATED:dropdown panel background
// Borders are translucent white so they read correctly against the charcoal.
const BASE = "#1b1c1f"
const ELEVATED = "#202126"
const BORDER = "rgba(255,255,255,0.08)"
const BORDER_STRONG = "rgba(255,255,255,0.12)"
const TEXT_PRIMARY = "#f4f4f5"
const TEXT_MUTED = "#8b8d98"
const TEXT_FAINT = "#5b5d66"
const ACCENT = "#3b82f6"

// ── Icons ─────────────────────────────────────────────────────────────────────
const O = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...props} />
)

const icons = {
    overview: <O><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></O>,
    prompts: <O><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></O>,
    sources: <O><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></O>,
    competitors: <O><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M17 6h3a3 3 0 0 1-3 3" /><path d="M7 6H4a3 3 0 0 0 3 3" /></O>,
    analytics: <O><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></O>,
    chat: <O><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5Z" /><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" /></O>,
    settings: <O><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></O>,
    help: <O><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></O>,
    logout: <O><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></O>,
    chevron: <O width="11" height="11"><polyline points="6 9 12 15 18 9" /></O>,
    check: <O width="12" height="12"><polyline points="20 6 9 17 4 12" /></O>,
}

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({
    icon, label, href, badge, onClick,
}: {
    icon: React.ReactNode
    label: string
    href?: string
    badge?: string
    onClick?: () => void
}) {
    const location = useLocation()
    const isActive = href ? location.pathname === href : false

    const base = "relative flex w-full items-center gap-2 rounded-md px-2 py-[4.5px] text-[13px] transition-colors duration-100 group"

    const inner = (
        <>
            {isActive && (
                <span className="absolute left-0 top-1/2 h-[14px] w-[2.5px] -translate-y-1/2 rounded-full" style={{ background: ACCENT }} />
            )}
            <span className="flex-shrink-0" style={{ color: isActive ? ACCENT : TEXT_MUTED }}>
                {icon}
            </span>
            <span className="flex-1 leading-none">{label}</span>
            {badge && (
                <span
                    className="rounded-sm border px-1.5 py-[2px] text-[10px] font-semibold leading-none"
                    style={{ background: "rgba(59,130,246,0.15)", color: "#7db4fb", borderColor: "rgba(59,130,246,0.3)" }}
                >
                    {badge}
                </span>
            )}
        </>
    )

    const style = {
        color: isActive ? TEXT_PRIMARY : TEXT_MUTED,
        fontWeight: isActive ? 600 : 400,
        background: isActive ? ELEVATED : "transparent",
        boxShadow: isActive ? "0 0 0 1px rgba(255,255,255,0.06)" : undefined,
    }

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className={base}
                style={style}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)" }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent" }}
            >
                {inner}
            </button>
        )
    }

    return (
        <Link
            to={href ?? "#"}
            className={base}
            style={style}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)" }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent" }}
        >
            {inner}
        </Link>
    )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, badge }: { label: string; badge?: string }) {
    return (
        <div className="flex items-center justify-between px-2 pb-0.5 pt-3">
            <span className="select-none text-[10.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: TEXT_FAINT }}>
                {label}
            </span>
            {badge && (
                <span
                    className="rounded-sm border px-1.5 py-[2px] text-[10px] font-semibold leading-none"
                    style={{ background: "rgba(59,130,246,0.15)", color: "#7db4fb", borderColor: "rgba(59,130,246,0.3)" }}
                >
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
    const containerRef = useRef<HTMLDivElement>(null)

    const initials = selectedProject?.brand_name?.slice(0, 1).toUpperCase() ?? "G"

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

    return (
        <div ref={containerRef} className="relative px-3 py-3">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center gap-2 rounded-lg px-1 py-1 transition"
                style={{ background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
                <div
                    className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-md text-white shadow-[0_2px_5px_rgba(37,99,235,0.35)]"
                    style={{ background: "radial-gradient(120% 120% at 20% 15%, #60A5FA 0%, #2563EB 55%, #1D4ED8 100%)" }}
                >
                    <span className="text-[11px] font-bold leading-none">{initials}</span>
                </div>
                <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[13px] font-semibold leading-tight" style={{ color: TEXT_PRIMARY }}>
                        {selectedProject?.brand_name ?? "No project"}
                    </p>
                    <p className="truncate text-[11px] leading-tight" style={{ color: TEXT_MUTED }}>
                        {selectedProject?.brand_location ?? "India"}
                    </p>
                </div>
                <span
                    className="flex-shrink-0 transition-transform"
                    style={{ color: TEXT_FAINT, transform: open ? "rotate(180deg)" : undefined }}
                >
                    {icons.chevron}
                </span>
            </button>

            {open && (
                <div
                    className="absolute left-3 right-3 top-[calc(100%-2px)] z-30 overflow-hidden rounded-lg border py-1"
                    style={{ background: ELEVATED, borderColor: BORDER_STRONG, boxShadow: "0 16px 40px -8px rgba(0,0,0,0.55)" }}
                >
                    {projects.length === 0 ? (
                        <p className="px-3 py-2 text-[12.5px]" style={{ color: TEXT_MUTED }}>No projects yet</p>
                    ) : (
                        projects.map((p) => {
                            const active = p.id === selectedProject?.id
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => { selectProject(p.id); setOpen(false) }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] transition-colors"
                                    style={{
                                        background: active ? "rgba(59,130,246,0.15)" : "transparent",
                                        color: active ? "#7db4fb" : TEXT_MUTED,
                                        fontWeight: active ? 500 : 400,
                                    }}
                                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent" }}
                                >
                                    <span className="min-w-0 flex-1 truncate">{p.brand_name}</span>
                                    {active && <span className="flex-shrink-0" style={{ color: ACCENT }}>{icons.check}</span>}
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
    const { logout } = useAuth()
    const navigate = useNavigate()

    return (
        <aside
            className="sticky top-0 flex h-screen w-[200px] select-none flex-col border-r"
            style={{ background: BASE, borderColor: BORDER }}
        >
            {/* ── Workspace ── */}
            <WorkspaceSwitcher />

            <div className="mx-3 border-t" style={{ borderColor: BORDER }} />

            {/* ── Nav ── */}
            <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-1">
                <SectionLabel label="General" />
                <NavItem icon={icons.overview} label="Overview" href="/dashboard" />
                <NavItem icon={icons.prompts} label="Prompts" href="/prompts" />
                <NavItem icon={icons.sources} label="Sources" href="/sources" />
                <NavItem icon={icons.competitors} label="Competitors" href="/competitors" />
                <NavItem icon={icons.analytics} label="Web Analytics" href="/analytics" />
                <NavItem icon={icons.chat} label="Chat" href="/chat" />

                <SectionLabel label="Settings" />
                <NavItem icon={icons.settings} label="Settings" href="/settings" />
            </nav>

            {/* ── Bottom ── */}
            <div className="flex-shrink-0 px-2 pb-3">
                <div className="mb-1 border-t" style={{ borderColor: BORDER }} />
                <NavItem icon={icons.help} label="Help" href="/help" />
                <NavItem icon={icons.logout} label="Log out" onClick={() => { logout(); navigate("/login") }} />
            </div>
        </aside>
    )
}
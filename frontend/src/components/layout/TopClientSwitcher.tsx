import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Check, Search } from "lucide-react"
import { useProjects } from "@/hooks/useProjects"
import { countryByName, countryFlagUrl } from "@/lib/countries"

type Props = {
    brandIcon?: React.ReactNode
}

export const TopClientSwitcher: React.FC<Props> = () => {
    const { projects, selectedProject, selectProject } = useProjects()
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [logoFailed, setLogoFailed] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const logoDomain = selectedProject?.brand_url?.trim() || "promptpulse.com"
    const logoSrc = logoFailed
        ? "/favicon.svg"
        : `https://www.google.com/s2/favicons?domain=${encodeURIComponent(logoDomain)}&sz=64`

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
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

    const filtered = projects.filter(
        (p) =>
            p.brand_name.toLowerCase().includes(search.toLowerCase()) ||
            p.brand_url.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="relative z-[85] flex-shrink-0" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={[
                    "flex h-8 max-w-[190px] items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition-all select-none whitespace-nowrap flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.12)]",
                    open
                        ? "border-slate-800 bg-slate-900 text-white ring-2 ring-slate-900/10"
                        : "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-900",
                ].join(" ")}
                title={selectedProject ? `Current workspace: ${selectedProject.brand_name}` : "Select workspace"}
            >
                <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-white/10">
                    <img
                        src={logoSrc}
                        alt=""
                        className="h-3.5 w-3.5 object-contain"
                        onError={() => setLogoFailed(true)}
                    />
                </div>
                <span className="truncate font-semibold max-w-[110px] leading-none">
                    {selectedProject?.brand_name ?? "Select Brand"}
                </span>
                <ChevronDown
                    size={11}
                    className={`ml-0.5 flex-shrink-0 text-white/60 transition-transform duration-150 ${open ? "rotate-180 text-white" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-[130] w-72 origin-top-left rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.2)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                    {/* Search bar for multi-client agencies */}
                    {projects.length > 4 && (
                        <div className="p-1 border-b border-slate-100 mb-1">
                            <div className="relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search client brands…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-7 w-full rounded-lg border border-slate-200 bg-slate-50 pl-7 pr-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin">
                        {filtered.length === 0 ? (
                            <p className="p-3 text-center text-xs text-slate-400">No client workspaces found</p>
                        ) : (
                            filtered.map((p) => {
                                const active = p.id === selectedProject?.id
                                const country = countryByName(p.brand_location)
                                const flag = country ? countryFlagUrl(country.code) : null

                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                            selectProject(p.id)
                                            setOpen(false)
                                        }}
                                        className={[
                                            "flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition-all",
                                            active
                                                ? "bg-slate-900 text-white font-bold"
                                                : "text-slate-700 hover:bg-slate-50 font-medium",
                                        ].join(" ")}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-black/10 bg-white/10 text-xs font-bold">
                                                {p.brand_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs leading-tight">{p.brand_name}</p>
                                                <p className={`truncate text-[10px] mt-0.5 ${active ? "text-slate-300" : "text-slate-400"}`}>
                                                    {p.brand_url.replace(/^https?:\/\//, "")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {flag && (
                                                <img src={flag} alt="" className="h-2.5 w-3.5 rounded-[2px] object-cover" />
                                            )}
                                            {active && <Check size={13} className="text-white" />}
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>


                </div>
            )}
        </div>
    )
}

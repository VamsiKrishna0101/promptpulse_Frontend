import React, { useState, useRef, useEffect } from "react"
import { Download, ChevronDown, FileText, Presentation, Loader2 } from "lucide-react"

export type ExportFormat = "pdf" | "pptx"

type Props = {
    exportResource?: string
    exporting: ExportFormat | null
    onExport: (format: ExportFormat) => void
}

export const ExportDropdown: React.FC<Props> = ({
    exportResource,
    exporting,
    onExport,
}) => {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

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

    if (!exportResource) return null

    const isBusy = Boolean(exporting)

    return (
        <div className="relative z-[85] flex-shrink-0" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                disabled={isBusy}
                className={[
                    "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition-all select-none whitespace-nowrap flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                    open
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                    isBusy ? "cursor-wait opacity-80" : "",
                ].join(" ")}
                title="Export report"
            >
                {isBusy ? (
                    <Loader2 size={13} className="animate-spin text-sky-500" />
                ) : (
                    <Download size={13} className={open ? "text-white" : "text-slate-500"} />
                )}
                <span className="whitespace-nowrap leading-none">{isBusy ? "Exporting..." : "Export"}</span>
                <ChevronDown
                    size={11}
                    className={`text-slate-400 transition-transform duration-150 ${open ? "rotate-180 text-white" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+5px)] z-[130] w-60 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_36px_-8px_rgba(15,23,42,0.18)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Export As
                    </div>

                    {/* PDF (.pdf) */}
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false)
                            onExport("pdf")
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-rose-50/70"
                    >
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700">
                            <FileText size={13} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 leading-tight">PDF Document</p>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Print-ready executive summary</p>
                        </div>
                    </button>

                    {/* PPTX (.pptx) - shown on overview */}
                    {exportResource === "overview" && (
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false)
                                onExport("pptx")
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-amber-50/70"
                        >
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                                <Presentation size={13} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 leading-tight">PowerPoint Deck (.pptx)</p>
                                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Editable presentation slides</p>
                            </div>
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

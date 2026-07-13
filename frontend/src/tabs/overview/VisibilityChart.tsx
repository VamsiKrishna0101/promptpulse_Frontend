import { useMemo, useRef, useState } from "react"
import type { TimeSeriesDay } from "@/hooks/useVisibilityTimeSeries"

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#7C3AED", "#EF4444", "#0891B2", "#DB2777", "#64748B"]

const W = 800
const PAD_L = 38
const PAD_R = 46 // extra room for end-of-line value labels
const PAD_T = 20 // more headroom so peaks don't touch the ceiling
const PAD_B = 26

function fmtDate(iso: string) {
    const d = new Date(iso + "T00:00:00")
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function smoothPath(points: { x: number; y: number }[]): string {
    if (points.length === 0) return ""
    if (points.length === 1) return `M ${points[0].x - 2} ${points[0].y} L ${points[0].x + 2} ${points[0].y}`
    if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`

    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] ?? points[i]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = points[i + 2] ?? p2
        const cp1x = p1.x + (p2.x - p0.x) / 6
        const cp1y = p1.y + (p2.y - p0.y) / 6
        const cp2x = p2.x - (p3.x - p1.x) / 6
        const cp2y = p2.y - (p3.y - p1.y) / 6
        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    }
    return d
}

export function VisibilityChart({ data, height = 220 }: { data: TimeSeriesDay[]; height?: number }) {
    const svgRef = useRef<SVGSVGElement>(null)
    const [hoverIdx, setHoverIdx] = useState<number | null>(null)
    const [pinnedIdx, setPinnedIdx] = useState<number | null>(null)
    const [focusBrand, setFocusBrand] = useState<string | null>(null)

    const chartH = height - PAD_T - PAD_B
    const chartW = W - PAD_L - PAD_R

    const brands = useMemo(() => (data.length ? Object.keys(data[0].brands) : []), [data])

    const maxVal = useMemo(() => {
        let m = 10
        for (const day of data) for (const v of Object.values(day.brands)) if (v > m) m = v
        return Math.ceil(m / 10) * 10 + 5
    }, [data])

    function xOf(i: number): number {
        if (data.length <= 1) return PAD_L + chartW / 2
        return PAD_L + (i / (data.length - 1)) * chartW
    }
    function yOf(val: number): number {
        return PAD_T + chartH - (val / maxVal) * chartH
    }
    function pointsFor(brand: string) {
        return data.map((day, i) => ({ x: xOf(i), y: yOf(day.brands[brand] ?? 0) }))
    }

    const yTicks = useMemo(() => {
        const ticks: number[] = []
        const step = maxVal <= 25 ? 5 : maxVal <= 60 ? 10 : 20
        for (let t = 0; t <= maxVal; t += step) ticks.push(t)
        return ticks
    }, [maxVal])

    const labelEvery = data.length > 20 ? Math.ceil(data.length / 8) : data.length > 10 ? 2 : 1

    function indexFromPointer(e: React.MouseEvent<SVGSVGElement>) {
        const rect = svgRef.current?.getBoundingClientRect()
        if (!rect || data.length < 1) return null
        const relX = (e.clientX - rect.left) / rect.width
        const frac = Math.max(0, Math.min(1, (relX - PAD_L / W) / (chartW / W)))
        const idx = Math.round(frac * (data.length - 1))
        return Math.max(0, Math.min(data.length - 1, idx))
    }

    function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
        const idx = indexFromPointer(e)
        if (idx !== null) setHoverIdx(idx)
    }

    function onClick(e: React.MouseEvent<SVGSVGElement>) {
        const idx = indexFromPointer(e)
        if (idx !== null) setPinnedIdx(current => current === idx ? null : idx)
    }

    if (!data.length) {
        return (
            <div className="flex items-center justify-center text-[12.5px] text-[#98A2B3]" style={{ height }}>
                No visibility data yet
            </div>
        )
    }

    const activeIdx = hoverIdx ?? pinnedIdx
    const activeDay = activeIdx !== null ? data[activeIdx] : null
    const tooltipX = activeIdx !== null ? (xOf(activeIdx) / W) * 100 : 0
    const lastIdx = data.length - 1
    const primaryPoints = pointsFor(brands[0] ?? "")
    // Fade the area fill much faster so it doesn't wash out competitor lines crossing beneath it.
    const primaryAreaPath =
        primaryPoints.length > 0
            ? `${smoothPath(primaryPoints)} L ${primaryPoints[primaryPoints.length - 1].x.toFixed(1)} ${(height - PAD_B).toFixed(1)} L ${primaryPoints[0].x.toFixed(1)} ${(height - PAD_B).toFixed(1)} Z`
            : ""

    return (
        <div className="relative select-none">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${height}`}
                preserveAspectRatio="none"
                className="cursor-pointer"
                style={{ width: "100%", height, display: "block" }}
                onMouseMove={onMouseMove}
                onMouseLeave={() => setHoverIdx(null)}
                onClick={onClick}
            >
                <defs>
                    <linearGradient id="visibility-primary-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS[0]} stopOpacity="0.14" />
                        <stop offset="35%" stopColor={COLORS[0]} stopOpacity="0.04" />
                        <stop offset="100%" stopColor={COLORS[0]} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {yTicks.map((t) => (
                    <g key={t}>
                        <line x1={PAD_L} y1={yOf(t).toFixed(1)} x2={W - PAD_R} y2={yOf(t).toFixed(1)} stroke="#E8EDF4" strokeWidth="1" strokeDasharray={t === 0 ? "0" : "3 5"} />
                        <text x={PAD_L - 6} y={(yOf(t) + 3.2).toFixed(1)} fontSize="9.5" fill="#94A3B8" textAnchor="end" fontFamily="ui-sans-serif,system-ui,sans-serif">
                            {t}%
                        </text>
                    </g>
                ))}

                {data.map((day, i) => {
                    if (i % labelEvery !== 0) return null
                    return (
                        <text key={day.date} x={xOf(i).toFixed(1)} y={height - 6} fontSize="9.5" fill="#98A2B3" textAnchor="middle" fontFamily="ui-sans-serif,system-ui,sans-serif">
                            {fmtDate(day.date)}
                        </text>
                    )
                })}

                {primaryAreaPath && (!focusBrand || focusBrand === brands[0]) && (
                    <path d={primaryAreaPath} fill="url(#visibility-primary-fill)" stroke="none" />
                )}

                {data.map((day, i) => {
                    const x = xOf(i)
                    const bandWidth = Math.max(34, chartW / Math.max(data.length - 1, 1))
                    return (
                        <rect
                            key={`${day.date}-hit-area`}
                            x={x - bandWidth / 2}
                            y={PAD_T - 8}
                            width={bandWidth}
                            height={chartH + 16}
                            fill="transparent"
                            className="cursor-pointer"
                        />
                    )
                })}

                {activeIdx !== null && (
                    <>
                        <rect x={xOf(activeIdx) - 14} y={PAD_T} width="28" height={chartH} rx="10" fill="#2563EB" opacity="0.055" />
                        <line x1={xOf(activeIdx).toFixed(1)} y1={PAD_T} x2={xOf(activeIdx).toFixed(1)} y2={height - PAD_B} stroke="#94A3B8" strokeWidth="1.4" strokeDasharray="4 4" />
                    </>
                )}

                {brands.map((brand, bi) => {
                    const isPrimary = bi === 0
                    const dimmed = focusBrand !== null && focusBrand !== brand
                    return (
                        <path
                            key={brand}
                            d={smoothPath(pointsFor(brand))}
                            fill="none"
                            stroke={COLORS[bi % COLORS.length]}
                            strokeWidth={isPrimary ? 3 : 2}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            opacity={dimmed ? 0.15 : isPrimary ? 1 : 0.85}
                            style={{ transition: "opacity 150ms ease" }}
                        />
                    )
                })}

                {/* End-of-line value labels — read the latest number without hovering */}
                {brands.map((brand, bi) => {
                    const dimmed = focusBrand !== null && focusBrand !== brand
                    if (dimmed) return null
                    const val = data[lastIdx].brands[brand] ?? 0
                    const x = xOf(lastIdx)
                    const y = yOf(val)
                    return (
                        <g key={brand}>
                            <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r={bi === 0 ? 3.5 : 2.75} fill={COLORS[bi % COLORS.length]} stroke="white" strokeWidth="1.5" />
                            <text
                                x={(x + 7).toFixed(1)} y={(y + 3.2).toFixed(1)}
                                fontSize={bi === 0 ? "10.5" : "9.5"}
                                fontWeight={bi === 0 ? 700 : 600}
                                fill={bi === 0 ? "#0F172A" : "#667085"}
                                fontFamily="ui-sans-serif,system-ui,sans-serif"
                            >
                                {val.toFixed(0)}%
                            </text>
                        </g>
                    )
                })}

                {activeIdx !== null && activeDay && brands.map((brand, bi) => {
                    const dimmed = focusBrand !== null && focusBrand !== brand
                    if (dimmed) return null
                    return (
                        <circle
                            key={brand}
                            cx={xOf(activeIdx).toFixed(1)}
                            cy={yOf(activeDay.brands[brand] ?? 0).toFixed(1)}
                            r={bi === 0 ? 5.5 : 4.5}
                            fill={COLORS[bi % COLORS.length]}
                            stroke="white"
                            strokeWidth="2.4"
                        />
                    )
                })}
            </svg>

            {activeIdx !== null && activeDay && (
                <div
                    className="pointer-events-none absolute top-1 z-20 min-w-[178px] rounded-xl bg-[#111113] px-3.5 py-3 text-white shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
                    style={{ left: `${Math.min(tooltipX + 2, 62)}%` }}
                >
                    <p className="mb-2 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                        {fmtDate(activeDay.date)}
                        {pinnedIdx === activeIdx && <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[8.5px] text-zinc-300">Pinned</span>}
                    </p>
                    <div className="flex flex-col gap-1.5">
                        {brands.map((brand, bi) => {
                            const dimmed = focusBrand !== null && focusBrand !== brand
                            return (
                                <div key={brand} className="flex items-center justify-between gap-3" style={{ opacity: dimmed ? 0.35 : 1 }}>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: COLORS[bi % COLORS.length] }} />
                                        <img
                                            src={`https://www.google.com/s2/favicons?domain=${brand.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&sz=32`}
                                            alt="" width={13} height={13}
                                            className="flex-shrink-0 rounded-[2px] object-contain"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                                        />
                                    <span className="truncate text-[11.5px] text-zinc-300">{brand}</span>
                                </div>
                                    <span className="text-[11.5px] font-semibold tabular-nums text-white">
                                        {(activeDay.brands[brand] ?? 0).toFixed(0)}%
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {brands.map((brand, bi) => {
                    const active = focusBrand === brand
                    return (
                        <button
                            key={brand}
                            type="button"
                            onMouseEnter={() => setFocusBrand(brand)}
                            onMouseLeave={() => setFocusBrand(null)}
                            className={[
                                "flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] transition",
                                active ? "border-[#BFD4FB] bg-[#EFF6FF] text-[#1D4ED8]" : "border-[#E2E5EA] bg-white text-[#667085] hover:border-[#D0D5DD] hover:bg-[#F7F8FA]",
                            ].join(" ")}
                        >
                            <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: COLORS[bi % COLORS.length] }} />
                            {brand}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

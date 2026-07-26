type DemandLabel = "HIGH" | "MODERATE" | "LOW" | "NOT_ENOUGH_DATA"

const styles: Record<DemandLabel, string> = {
    HIGH: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MODERATE: "bg-blue-50 text-blue-700 border-blue-200",
    LOW: "bg-slate-100 text-slate-600 border-slate-200",
    NOT_ENOUGH_DATA: "bg-amber-50 text-amber-700 border-amber-200",
}

const labels: Record<DemandLabel, string> = {
    HIGH: "High observed demand",
    MODERATE: "Moderate observed demand",
    LOW: "Low observed demand",
    NOT_ENOUGH_DATA: "Not enough data",
}

export function ObservedDemandIndicator({ label, score, runs }: {
    label: DemandLabel
    score: number | null
    runs: number
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className={`inline-flex w-fit rounded-md border px-2 py-1 text-[11px] font-semibold ${styles[label]}`}>
                {labels[label]}
            </span>
            <span className="text-[11px] text-zinc-500">
                {runs > 0 ? `${runs} AI runs in the last 30 days${score !== null ? ` · score ${score}` : ""}` : "Based on PromptPulse run history"}
            </span>
        </div>
    )
}

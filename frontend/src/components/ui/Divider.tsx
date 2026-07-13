export interface DividerProps {
    label?: string
}

export function Divider({ label }: DividerProps) {
    if (!label) {
        return <div className="h-px w-full bg-ink-200" />
    }

    return (
        <div className="flex items-center gap-3" role="separator">
            <div className="h-px flex-1 bg-ink-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</span>
            <div className="h-px flex-1 bg-ink-200" />
        </div>
    )
}
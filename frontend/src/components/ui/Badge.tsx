// src/components/ui/Badge.tsx
import type { ReactNode } from "react"

type BadgeVariant = "neutral" | "success" | "danger" | "solid" | "outline"

const VARIANT_STYLES: Record<BadgeVariant, string> = {
    neutral: "bg-ink-100 text-ink-600 ring-ink-200",
    success: "bg-success-50 text-success-600 ring-success-500/20",
    danger: "bg-danger-50 text-danger-600 ring-danger-500/20",
    solid: "bg-ink-950 text-white ring-ink-950",
    outline: "bg-white text-ink-600 ring-ink-200",
}

export function Badge({
    children,
    variant = "neutral",
    icon,
    dot,
}: {
    children: ReactNode
    variant?: BadgeVariant
    icon?: ReactNode
    dot?: boolean
}) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ring-1 ring-inset ${VARIANT_STYLES[variant]}`}>
            {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            {icon}
            {children}
        </span>
    )
}
import { forwardRef } from "react"
import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export type ButtonVariant = "primary" | "brand" | "outline" | "ghost"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    isLoading?: boolean
    fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
    // Default action button — solid, neutral, matches Peec's actual UI (not a purple gradient).
    primary: "bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-60",
    // Reserve the brand gradient for marketing/CTA contexts (e.g. navbar "Start free trial"), not app UI.
    brand:
        "bg-gradient-to-br from-brand-700 to-brand-600 text-white shadow-[0_1px_12px_0_rgba(124,58,237,0.28)] hover:shadow-[0_2px_18px_0_rgba(124,58,237,0.38)] disabled:opacity-60 disabled:shadow-none",
    outline: "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 disabled:opacity-60",
    ghost: "text-ink-600 hover:bg-ink-100 disabled:opacity-50",
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-9 px-3 text-sm gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-11 px-5 text-[15px] gap-2",
}

function SpinnerIcon() {
    return (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            isLoading = false,
            fullWidth = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed",
                    variantStyles[variant],
                    sizeStyles[size],
                    fullWidth && "w-full",
                    className
                )}
                {...props}
            >
                {isLoading && <SpinnerIcon />}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

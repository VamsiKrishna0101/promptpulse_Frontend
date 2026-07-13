import { type InputHTMLAttributes, forwardRef, useId } from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
    hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, id, ...props }, ref) => {
        const generatedId = useId()
        const inputId = id ?? generatedId

        return (
            <div className="flex flex-col gap-1.5">
                <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
                    {label}
                </label>
                <input
                    id={inputId}
                    ref={ref}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    className={cn(
                        "h-11 rounded-lg border border-ink-200 bg-white px-3.5 text-sm text-ink-900 transition-colors",
                        "placeholder:text-ink-400",
                        "focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100",
                        error && "border-danger-500 focus:border-danger-500 focus:ring-danger-50",
                        className
                    )}
                    {...props}
                />
                {error ? (
                    <span id={`${inputId}-error`} className="text-xs font-medium text-danger-600">
                        {error}
                    </span>
                ) : hint ? (
                    <span id={`${inputId}-hint`} className="text-xs text-ink-500">
                        {hint}
                    </span>
                ) : null}
            </div>
        )
    }
)
Input.displayName = "Input"
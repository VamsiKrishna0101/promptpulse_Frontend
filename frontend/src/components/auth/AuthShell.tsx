import type { ReactNode } from "react"
import { Link } from "react-router-dom"

function RefractOneMark() {
    return (
        <span
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 bg-white shadow-[0_10px_30px_-18px_rgba(24,24,27,0.45)]"
            aria-hidden="true"
        >
            <span className="flex h-7 items-end gap-[3px]">
                {[16, 22, 28].map((height) => (
                    <span
                        key={height}
                        className="block w-[5px] -skew-y-[28deg] rounded-[2px] bg-ink-900"
                        style={{ height }}
                    />
                ))}
            </span>
        </span>
    )
}

export interface AuthShellProps {
    title: string
    subtitle: string
    footer: ReactNode
    children: ReactNode
    proof: ReactNode
}

export function AuthShell({ title, subtitle, footer, children, proof }: AuthShellProps) {
    return (
        <main className="relative grid min-h-screen w-full grid-cols-1 overflow-hidden bg-white lg:grid-cols-2">
            {/* faint grid background, same pattern as the real hero */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(#f0f0f2 1px, transparent 1px), linear-gradient(90deg, #f0f0f2 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                    maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 40%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 40%, transparent 100%)",
                }}
            />

            <section className="relative flex items-center justify-center px-6 py-16 sm:px-10">
                <div className="flex w-full max-w-[380px] flex-col items-center gap-7 text-center">
                    <Link to="/" aria-label="RefractOne home">
                        <RefractOneMark />
                    </Link>

                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
                        <p className="text-sm text-ink-500">{subtitle}</p>
                    </div>

                    <div className="w-full text-left">{children}</div>

                    {footer}
                </div>
            </section>

            <aside className="relative hidden bg-white/60 lg:block">{proof}</aside>
        </main>
    )
}

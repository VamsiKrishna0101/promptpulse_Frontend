import type { ReactNode } from "react"

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

            <section className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-10 sm:py-16 lg:min-h-0">
                <div className="flex w-full max-w-[400px] flex-col items-center gap-6 rounded-[24px] border border-zinc-200/80 bg-white/82 px-5 py-7 text-center shadow-[0_24px_70px_-48px_rgba(15,23,42,0.6)] backdrop-blur sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none">
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-[24px] font-semibold tracking-tight text-ink-900 sm:text-2xl">{title}</h1>
                        <p className="text-balance text-sm leading-6 text-ink-500">{subtitle}</p>
                    </div>

                    <div className="w-full text-left">{children}</div>

                    {footer}
                </div>
            </section>

            <aside className="relative hidden bg-white/60 lg:block">{proof}</aside>
        </main>
    )
}

import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

const PromptPulseMark = () => (
    <div className="flex h-8 w-7 items-center justify-center">
        <div className="flex h-6 items-end gap-[3px]">
            {[15, 20, 25].map((height) => (
                <span
                    key={height}
                    className="block w-[5px] -skew-y-[28deg] rounded-[2px] bg-black"
                    style={{ height }}
                />
            ))}
        </div>
    </div>
)

const footerGroups = [
    {
        title: "Product",
        links: [
            { label: "Overview", href: "/dashboard" },
            { label: "Prompts", href: "/prompts" },
            { label: "Opportunities", href: "/opportunities" },
            { label: "GEO Articles", href: "/geo-articles" },
        ],
    },
    {
        title: "Intelligence",
        links: [
            { label: "Sources", href: "/sources" },
            { label: "Competitors", href: "/competitors" },
            { label: "Web Analytics", href: "/analytics" },
            { label: "Chat Evidence", href: "/chat" },
        ],
    },
    {
        title: "Account",
        links: [
            { label: "Pricing", href: "/pricing" },
            { label: "Subscription", href: "/subscription" },
            { label: "Help Center", href: "/help" },
            { label: "Login", href: "/login" },
        ],
    },
]

const socials = [
    { label: "X", href: "https://twitter.com" },
    { label: "in", href: "https://linkedin.com" },
    { label: "GH", href: "https://github.com" },
]

const protectedFooterHrefs = new Set([
    "/dashboard",
    "/prompts",
    "/opportunities",
    "/geo-articles",
    "/sources",
    "/competitors",
    "/analytics",
    "/chat",
    "/subscription",
    "/help",
])

export function Footer() {
    const { isAuthenticated } = useAuth()
    const hrefFor = (href: string) => protectedFooterHrefs.has(href) && !isAuthenticated ? "/login" : href

    return (
        <footer className="relative border-t border-zinc-200 bg-white">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />

            <div className="mx-auto max-w-7xl px-6 py-14">
                <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2.5" aria-label="PromptPulse home">
                            <PromptPulseMark />
                            <span className="text-[19px] font-black tracking-[-0.04em] text-zinc-950">PromptPulse</span>
                        </Link>
                        <p className="mt-4 max-w-sm text-[14px] leading-6 text-zinc-500">
                            AI visibility analytics for brands that need to know how ChatGPT, Gemini, and Perplexity describe them.
                        </p>

                        <div className="mt-5 flex items-center gap-2">
                            {socials.map(({ label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={label}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                                >
                                    <span className="text-[10px] font-black">{label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                        {footerGroups.map((group) => (
                            <div key={group.title}>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-zinc-400">{group.title}</h3>
                                <ul className="mt-4 space-y-2.5">
                                    {group.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                to={hrefFor(link.href)}
                                                className="group inline-flex items-center text-[14px] font-medium text-zinc-600 transition hover:text-zinc-950"
                                            >
                                                <span className="relative">
                                                    {link.label}
                                                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-zinc-950 transition-all duration-200 group-hover:w-full" />
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-4 border-t border-zinc-200 pt-6 text-[13px] font-medium text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-4">
                        <p>&copy; {new Date().getFullYear()} PromptPulse. All rights reserved.</p>
                        <span className="hidden h-3 w-px bg-zinc-200 sm:inline-block" />
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-zinc-400">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </span>
                            All systems operational
                        </span>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link to="/privacy" className="transition hover:text-zinc-950">Privacy</Link>
                        <Link to="/terms" className="transition hover:text-zinc-950">Terms</Link>
                        <Link to="/contact" className="transition hover:text-zinc-950">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

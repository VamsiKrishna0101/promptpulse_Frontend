import { useState } from "react"
import type { ReactNode, SVGProps } from "react"
import { Link } from "react-router-dom"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Hero } from "@/components/hero/hero"

type IconProps = SVGProps<SVGSVGElement>

interface NavItem {
    icon: ReactNode
    title: string
    desc: string
    href: string
}

const ArrowRight = (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" {...props}>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

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

const MenuIcon = (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" {...props}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
)

const AnalyticsIcon = (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" {...props}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
)

const CompetitorIcon = (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" {...props}>
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
        <path d="M17 6h3a3 3 0 0 1-3 3" />
        <path d="M7 6H4a3 3 0 0 0 3 3" />
    </svg>
)

const SourceIcon = (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
)

const AiIcon = (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)

const BlogIcon = (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
)

const productItems: NavItem[] = [
    {
        icon: <AnalyticsIcon />,
        title: "AI Visibility Analytics",
        desc: "Track visibility, position, sentiment, and movement",
        href: "/product/analytics",
    },
    {
        icon: <CompetitorIcon />,
        title: "Competitor Intelligence",
        desc: "See why competitors win AI recommendations",
        href: "/product/competitors",
    },
    {
        icon: <SourceIcon />,
        title: "Source Intelligence",
        desc: "Find the domains and pages shaping AI answers",
        href: "/product/sources",
    },
    {
        icon: <AiIcon />,
        title: "Opportunity Engine",
        desc: "Prioritize gaps your team should fix first",
        href: "/product/opportunities",
    },
    {
        icon: <BlogIcon />,
        title: "GEO Articles",
        desc: "Create article briefs from AI answer evidence",
        href: "/product/geo-articles",
    },
    {
        icon: <AiIcon />,
        title: "Sara Assistant",
        desc: "Ask your project data what changed and what to fix",
        href: "/product/sara",
    },
]

export function Navbar() {
    return (
        <>
            <NavHeader />
            <Hero />
        </>
    )
}

/** Standalone nav header — used on pages like /pricing that render their own body */
export function NavHeader() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full">
            <div className="border-b border-black bg-black px-3 py-2 text-center text-[12px] font-bold leading-snug text-white sm:text-[13px]">
                <a href="/signup" className="flex items-center justify-center gap-1.5 text-white no-underline transition hover:text-zinc-200">
                    Track your brand across AI search - free for 7 days<ArrowRight className="h-3.5 w-3.5" />
                </a>
            </div>

            <nav
                role="navigation"
                aria-label="Main navigation"
                className="border-b border-ink-200 bg-white/90 backdrop-blur"
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
                    <Link to="/" aria-label="PromptPulse home" className="flex shrink-0 items-center gap-2.5">
                        <PromptPulseMark />
                        <span className="text-[18px] font-black tracking-[-0.035em] text-ink-900">
                            PromptPulse
                        </span>
                    </Link>

                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList className="m-0 flex list-none items-center gap-3 p-0">
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="rounded-md bg-transparent px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-100 hover:text-ink-900 data-[state=open]:bg-ink-100 data-[state=open]:text-ink-900">
                                    Product
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="w-[700px] rounded-xl border border-ink-200 bg-white p-3 shadow-xl shadow-ink-900/5">
                                        <div className="grid grid-cols-2 gap-1">
                                            {productItems.map((item) => (
                                                <NavigationMenuLink key={item.title} asChild>
                                                    <Link
                                                        to={item.href}
                                                        className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-zinc-50"
                                                    >
                                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
                                                            {item.icon}
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="text-sm font-bold text-ink-900">
                                                                {item.title}
                                                            </div>
                                                            <div className="text-[13px] leading-snug text-ink-500">
                                                                {item.desc}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </NavigationMenuLink>
                                            ))}
                                        </div>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link
                                        to="/pricing"
                                        className="inline-flex h-10 items-center rounded-md px-4 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
                                    >
                                        Pricing
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    <div className="hidden shrink-0 items-center gap-2.5 md:flex">
                        <Link
                            to="/book-demo"
                            className="rounded-lg border border-ink-200 bg-white px-3.5 py-1.5 text-[12px] font-bold text-ink-700 transition-all hover:border-ink-300 hover:text-ink-900 hover:shadow-sm"
                        >
                            Book a Demo
                        </Link>
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-1.5 text-[12px] font-black text-white shadow-[0_12px_28px_-18px_rgba(0,0,0,0.75)] transition hover:bg-zinc-800"
                        >
                            Start Free Trial
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <button
                        type="button"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((value) => !value)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-ink-600 hover:bg-ink-100 md:hidden"
                    >
                        <MenuIcon />
                    </button>
                </div>

                {mobileOpen && (
                    <div className="border-t border-zinc-200 bg-white px-4 py-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.65)] md:hidden">
                        <div className="grid gap-4">
                            <div>
                                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">Product</p>
                                <div className="grid gap-1">
                                    {productItems.slice(0, 5).map((item) => (
                                        <Link
                                            key={item.title}
                                            to={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5"
                                        >
                                            <span className="block text-[13px] font-bold text-zinc-950">{item.title}</span>
                                            <span className="mt-0.5 block text-[11.5px] leading-4 text-zinc-500">{item.desc}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Link onClick={() => setMobileOpen(false)} to="/pricing" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-center text-[13px] font-bold text-zinc-800">Pricing</Link>
                                <Link onClick={() => setMobileOpen(false)} to="/book-demo" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-center text-[13px] font-bold text-zinc-800">Book Demo</Link>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Link onClick={() => setMobileOpen(false)} to="/login" className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-[13px] font-black text-zinc-800">Login</Link>
                                <Link onClick={() => setMobileOpen(false)} to="/signup" className="rounded-xl bg-black px-4 py-3 text-center text-[13px] font-black text-white">Start Free</Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}

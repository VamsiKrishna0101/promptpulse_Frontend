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

interface ResourceItem {
    icon: ReactNode
    label: string
    href: string
}

const ArrowRight = (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" {...props}>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

const RefractOneMark = () => (
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

const DocsIcon = (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" {...props}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
)

const GeoIcon = (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" {...props}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
)

const ChangelogIcon = (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" {...props}>
        <path d="M12 8v5l3 2" />
        <circle cx="12" cy="12" r="10" />
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

const resourceItems: ResourceItem[] = [
    { icon: <BlogIcon />, label: "Blog", href: "/blog" },
    { icon: <GeoIcon />, label: "GEO Guide", href: "/geo-guide" },
    { icon: <DocsIcon />, label: "Help Center", href: "/help-center" },
    { icon: <ChangelogIcon />, label: "Changelog", href: "/changelog" },
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
    return (
        <header className="sticky top-0 z-50 w-full">
            <div className="border-b border-black bg-black px-4 py-2 text-center text-[13px] font-bold text-white">
                <a href="/signup" className="flex items-center justify-center gap-1.5 text-white no-underline transition hover:text-zinc-200">
                    Track your brand across ChatGPT & Gemini - free for 7 days<ArrowRight className="h-3.5 w-3.5" />
                </a>
            </div>

            <nav
                role="navigation"
                aria-label="Main navigation"
                className="border-b border-ink-200 bg-white/90 backdrop-blur"
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
                    <Link to="/" aria-label="RefractOne home" className="flex shrink-0 items-center gap-2.5">
                        <RefractOneMark />
                        <span className="text-[18px] font-black tracking-[-0.035em] text-ink-900">
                            RefractOne
                        </span>
                    </Link>

                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList className="m-0 flex list-none items-center gap-0 p-0">
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="rounded-md bg-transparent px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-100 hover:text-ink-900 data-[state=open]:bg-ink-100 data-[state=open]:text-ink-900">
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
                                        className="inline-flex h-10 items-center rounded-md px-3 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
                                    >
                                        Pricing
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="rounded-md bg-transparent px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-100 hover:text-ink-900 data-[state=open]:bg-ink-100 data-[state=open]:text-ink-900">
                                    Resources
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="w-56 rounded-xl border border-ink-200 bg-white p-2 shadow-xl shadow-ink-900/5">
                                        {resourceItems.map((item, i) => (
                                            <div key={item.label}>
                                                <NavigationMenuLink asChild>
                                                    <Link
                                                        to={item.href}
                                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-zinc-50 hover:text-ink-900 [&_svg]:text-ink-400 hover:[&_svg]:text-zinc-950"
                                                    >
                                                        {item.icon}
                                                        {item.label}
                                                    </Link>
                                                </NavigationMenuLink>
                                                {i === 1 && <div className="my-1.5 h-px bg-ink-200" />}
                                            </div>
                                        ))}
                                    </div>
                                </NavigationMenuContent>
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
                        aria-label="Open menu"
                        className="inline-flex items-center justify-center rounded-md p-2 text-ink-600 hover:bg-ink-100 md:hidden"
                    >
                        <MenuIcon />
                    </button>
                </div>
            </nav>
        </header>
    )
}

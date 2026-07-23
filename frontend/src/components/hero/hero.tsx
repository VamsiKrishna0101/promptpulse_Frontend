import { Link } from "react-router-dom"
import { FeaturesGrid } from "@/components/featuregrid/featuregrid"
import { FeatureShowcase } from "@/components/featureshowcase/featureshowcase"
import { MockDashboard } from "@/components/mockdashboard/mockdashboard"
import { SaraSection } from "@/components/sara/sara"
import GeoOpportunitiesMock from "@/components/oppurtunitydemo/oppurtunitydemo"
import { FinalCTA } from "@/components/cta/cta"
import { Footer } from "@/components/footer/footer"

const ArrowRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

const CheckIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const models = [
    { name: "ChatGPT", domain: "chatgpt.com" },
    { name: "Gemini", domain: "gemini.google.com" },
    { name: "Perplexity", domain: "perplexity.ai" },
]

const trust = [
    "No credit card required",
    "Setup in 2 minutes",
    "Cancel anytime",
]

export function Hero() {
    return (
        <main className="relative isolate overflow-hidden bg-white">
            <style>{`
                @keyframes fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
                .fade-up-1 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
                .fade-up-2 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
                .fade-up-3 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
                .fade-up-4 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
                .fade-up-5 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.45s both; }
                .fade-up-6 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.55s both; }
            `}</style>

            {/* Grid */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(24,24,27,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(24,24,27,0.045) 1px, transparent 1px)
          `,
                    backgroundSize: "80px 80px",
                    maskImage: "radial-gradient(ellipse 70% 65% at 50% 15%, black 30%, transparent 85%)",
                    WebkitMaskImage: "radial-gradient(ellipse 70% 65% at 50% 15%, black 30%, transparent 85%)",
                }}
            />

            {/* Monochrome + amber glow, replaces the old blue radial */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center"
            >
                <div
                    className="h-[440px] w-[860px] opacity-70"
                    style={{
                        background:
                            "radial-gradient(ellipse at center top, rgba(24,24,27,0.09) 0%, transparent 65%)",
                    }}
                />
                <div
                    className="absolute left-1/2 top-8 h-64 w-64 -translate-x-[220px] rounded-full opacity-60 blur-3xl"
                    style={{ background: "rgba(251,191,36,0.14)" }}
                />
            </div>

            {/* Subtle grain for texture */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 inset-x-0 h-20 -z-10 bg-gradient-to-t from-white to-transparent"
            />

            <section className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 pb-12 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-14">

                <div className="fade-up-1 mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/90 px-3 py-1 shadow-[0_1px_3px_rgba(0,0,0,0.06)] backdrop-blur">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[12px] font-medium text-zinc-500">7-day trial - no credit card required</span>
                </div>

                <h1 className="fade-up-2 max-w-2xl text-balance text-[38px] font-extrabold leading-[1.04] tracking-[-0.055em] text-zinc-950 sm:text-[44px] md:text-[52px]">
                    Your competitors are in{" "}
                    <span className="relative inline-block">
                        <span className="relative z-10 bg-gradient-to-b from-zinc-500 to-zinc-400 bg-clip-text text-transparent">
                            ChatGPT.
                        </span>
                        <span
                            aria-hidden="true"
                            className="absolute -inset-x-2 inset-y-1 -z-0 rounded-lg opacity-60 blur-md"
                            style={{ background: "rgba(251,191,36,0.16)" }}
                        />
                    </span>
                    <br />
                    Are you?
                </h1>

                <p className="fade-up-3 mt-4 max-w-lg text-balance text-[14.5px] font-normal leading-[1.65] text-zinc-500 sm:text-[15px]">
                    Track your brand across every major AI model. See who gets recommended, who gets missed, and exactly what to fix.
                </p>

                <div className="fade-up-4 mt-6 flex w-full max-w-sm flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
                    <Link
                        to="/signup"
                        className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-5 text-[13.5px] font-bold text-white shadow-[0_12px_28px_-18px_rgba(0,0,0,0.75)] ring-1 ring-black/5 transition-all hover:bg-zinc-800 hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.85)] active:scale-[0.98] sm:h-10"
                    >
                        Start tracking free
                        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                            <ArrowRight />
                        </span>
                    </Link>
                    <Link
                        to="/demo"
                        className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 text-[13.5px] font-medium text-zinc-600 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:border-zinc-300 hover:bg-zinc-50 sm:h-10"
                    >
                        Book a demo
                    </Link>
                </div>

                <div className="fade-up-5 mt-3.5 flex flex-wrap items-center justify-center gap-4">
                    {trust.map((t) => (
                        <span key={t} className="flex items-center gap-1.5 text-[11.5px] text-zinc-400">
                            <CheckIcon />
                            {t}
                        </span>
                    ))}
                </div>

                <Link
                    to="/pricing"
                    className="fade-up-5 mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-zinc-400 transition hover:text-zinc-700"
                >
                    See full pricing
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </Link>

                <div className="fade-up-6 mt-8 flex w-full max-w-xs items-center gap-3">
                    <div className="h-px flex-1 bg-zinc-100" />
                    <span className="text-[10.5px] font-semibold uppercase tracking-widest text-zinc-400">Tracks across</span>
                    <div className="h-px flex-1 bg-zinc-100" />
                </div>

                <div className="fade-up-6 mt-3.5 flex flex-wrap items-center justify-center gap-2">
                    {models.map((m) => (
                        <div
                            key={m.name}
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white px-3 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_8px_20px_-10px_rgba(0,0,0,0.25)]"
                        >
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${m.domain}&sz=32`}
                                alt={m.name}
                                width={14}
                                height={14}
                                className="rounded-[3px]"
                            />
                            <span className="text-[12px] font-medium text-zinc-600">{m.name}</span>
                        </div>
                    ))}
                </div>

                <MockDashboard />

            </section>
            <FeatureShowcase />
            <FeaturesGrid />
            <SaraSection />
            <GeoOpportunitiesMock />
            <FinalCTA />
            <Footer />
        </main>
    )
}

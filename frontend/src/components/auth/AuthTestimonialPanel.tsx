import type { LucideIcon } from "lucide-react"
import { useState } from "react"
import { ShieldCheck, Sparkles } from "lucide-react"

export interface AuthTrackedEngine {
    name: string
    slug: string | null
}

export interface AuthPanelFeature {
    title: string
    description: string
    icon: LucideIcon
}

export interface AuthTestimonialPanelProps {
    eyebrow: string
    headline: string
    description: string
    trackedEngines: AuthTrackedEngine[]
    features: AuthPanelFeature[]
    footNote: string
}

const domainMap: Record<string, string> = {
    chatgpt: "https://chatgpt.com/",
    openai: "https://chatgpt.com/",
    perplexity: "https://www.perplexity.ai/",
    claude: "https://claude.ai/",
    anthropic: "https://anthropic.ai/",
    gemini: "https://gemini.google.com/",
    google_ai_mode: "https://www.google.com/",
    googleMode: "https://www.google.com/",
    copilot: "https://copilot.microsoft.com/",
}

function EngineAvatar({ name, slug, zIndex }: { name: string; slug: string | null; zIndex: number }) {
    const [failed, setFailed] = useState(false)
    const domainUrl = slug ? domainMap[slug] : null
    const showMonogram = !domainUrl || failed

    return (
        <div
            className="relative flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-white bg-white shadow-sm transition-transform hover:-translate-y-0.5"
            style={{ zIndex }}
            title={name}
        >
            {showMonogram ? (
                <span className="text-[11px] font-bold text-ink-900">{name.charAt(0).toUpperCase()}</span>
            ) : (
                <img
                    src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(domainUrl)}&sz=128`}
                    alt={name}
                    className="h-4.5 w-4.5 rounded-sm object-contain"
                    style={{ width: '18px', height: '18px' }}
                    onError={() => setFailed(true)}
                />
            )}
        </div>
    )
}

export function AuthTestimonialPanel({
    eyebrow,
    headline,
    description,
    trackedEngines = [],
    features = [],
    footNote,
}: AuthTestimonialPanelProps) {
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 py-8">
            {/* faint grid background, exactly matching AuthShell */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(#f0f0f2 1px, transparent 1px), linear-gradient(90deg, #f0f0f2 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                    maskImage: "radial-gradient(ellipse 90% 70% at 50% 50%, black 40%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 50%, black 40%, transparent 100%)",
                }}
            />
            <div className="relative z-10 flex w-full max-w-[460px] flex-col gap-5">

                {/* Header */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-500 shadow-sm">
                        <Sparkles size={11} strokeWidth={2.5} className="text-ink-400" />
                        {eyebrow}
                    </span>
                    <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.035em] text-ink-950">
                        {headline}
                    </h2>
                    <p className="max-w-[380px] text-[13.5px] leading-relaxed text-ink-500">
                        {description}
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Supported Engines */}
                    <div className="col-span-2 flex items-center justify-between gap-4 rounded-[22px] border border-ink-100 bg-white/90 p-4 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.45)] backdrop-blur">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">Coverage</span>
                            <span className="text-[13px] font-semibold text-ink-900">Supported AI Engines</span>
                        </div>
                        <div className="flex -space-x-2.5">
                            {trackedEngines.map((engine, i) => (
                                <EngineAvatar key={engine.name} {...engine} zIndex={10 - i} />
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    {features.map((feature, idx) => {
                        const Icon = feature.icon
                        // Make the first feature span 2 columns if there are an odd number of features
                        const isWide = features.length % 2 !== 0 && idx === 0;

                        return (
                            <div
                                key={feature.title}
                                className={`flex flex-col gap-3 rounded-[22px] border border-ink-100 bg-white/70 p-4 shadow-[0_12px_35px_-32px_rgba(15,23,42,0.55)] transition-colors hover:bg-white ${isWide ? 'col-span-2 flex-row items-center gap-4' : 'col-span-1'}`}
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-ink-100 bg-white shadow-sm">
                                    <Icon size={16} className="text-ink-800" strokeWidth={2.25} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <h3 className="text-[13px] font-semibold tracking-tight text-ink-950">{feature.title}</h3>
                                    <p className="text-[12px] leading-relaxed text-ink-500 line-clamp-2">{feature.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer Note */}
                <div className="mt-1 flex items-center justify-center gap-2 rounded-2xl border border-ink-100 bg-white/90 px-4 py-3 text-center shadow-[0_16px_42px_-34px_rgba(15,23,42,0.45)]">
                    <ShieldCheck size={15} className="shrink-0 text-emerald-500" strokeWidth={2.5} />
                    <span className="text-[12px] font-semibold leading-5 text-ink-600">{footNote}</span>
                </div>

            </div>
        </div>
    )
}

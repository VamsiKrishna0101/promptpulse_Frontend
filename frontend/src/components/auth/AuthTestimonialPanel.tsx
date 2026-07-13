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
    chatgpt: "chatgpt.com",
    openai: "chatgpt.com",
    perplexity: "perplexity.ai",
    claude: "claude.ai",
    anthropic: "anthropic.ai",
    gemini: "gemini.google.com",
}

function GraphiteChip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <span
            className={`flex items-center justify-center rounded-[12px] bg-gradient-to-b from-ink-800 to-ink-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.25),0_10px_20px_-14px_rgba(24,24,27,0.5)] ${className}`}
        >
            {children}
        </span>
    )
}

function EngineAvatar({ name, slug, zIndex }: { name: string; slug: string | null; zIndex: number }) {
    const [failed, setFailed] = useState(false)
    const domain = slug ? domainMap[slug] : null
    const showMonogram = !domain || failed

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
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
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
            <div className="relative z-10 w-full max-w-[420px] flex flex-col gap-6">

                {/* Header */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <GraphiteChip className="mb-1 h-10 w-10 shrink-0">
                        <span className="block h-2.5 w-2.5 rotate-45 rounded-[2px] bg-white" />
                    </GraphiteChip>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-500 shadow-sm">
                        <Sparkles size={11} strokeWidth={2.5} className="text-ink-400" />
                        {eyebrow}
                    </span>
                    <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-ink-950">
                        {headline}
                    </h2>
                    <p className="text-[13px] leading-relaxed text-ink-500 max-w-[360px]">
                        {description}
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Supported Engines */}
                    <div className="col-span-2 flex items-center justify-between rounded-[20px] border border-ink-100 bg-white p-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
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
                                className={`flex flex-col gap-3 rounded-[20px] border border-ink-100 bg-ink-50/50 p-4 transition-colors hover:bg-ink-50 ${isWide ? 'col-span-2 flex-row items-center gap-4' : 'col-span-1'}`}
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
                <div className="mt-2 flex items-center justify-center gap-2 rounded-full border border-ink-100 bg-white py-2 shadow-sm">
                    <ShieldCheck size={14} className="text-ink-400" strokeWidth={2.5} />
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-500">{footNote}</span>
                </div>

            </div>
        </div>
    )
}

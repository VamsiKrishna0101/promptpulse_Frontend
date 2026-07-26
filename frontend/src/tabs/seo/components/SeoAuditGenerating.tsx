import { useEffect, useState } from "react"
import { BarChart3, FileSearch, Globe2, SearchCheck, Sparkles } from "lucide-react"

const STEPS = [
  { label: "Preparing your site crawl", icon: Globe2 },
  { label: "Checking technical SEO", icon: FileSearch },
  { label: "Mapping keywords and pages", icon: SearchCheck },
  { label: "Checking Google positions", icon: BarChart3 },
  { label: "Compiling your SEO report", icon: Sparkles },
]

const PROGRESS_CAP = 92
const PROGRESS_TAU_SECONDS = 300

export function SeoAuditGenerating() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const startedAt = Date.now()
    const interval = window.setInterval(() => {
      setElapsedSeconds((Date.now() - startedAt) / 1000)
    }, 250)
    return () => window.clearInterval(interval)
  }, [])

  const progress = Math.min(
    PROGRESS_CAP,
    Math.max(3, Math.round(PROGRESS_CAP * (1 - Math.exp(-elapsedSeconds / PROGRESS_TAU_SECONDS)))),
  )
  const activeIndex = Math.min(STEPS.length - 1, Math.floor((progress / PROGRESS_CAP) * STEPS.length))
  const ActiveIcon = STEPS[activeIndex].icon

  return (
    <div className="relative flex min-h-[620px] items-center justify-center overflow-hidden rounded-[28px] border border-zinc-200 bg-white px-6 py-16 shadow-[0_18px_58px_-48px_rgba(15,23,42,0.65)]">
      <style>{`
        @keyframes seo-spin { to { transform: rotate(360deg); } }
        @keyframes seo-shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(260%); } }
        @keyframes seo-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .seo-spinner { animation: seo-spin 2.8s linear infinite; }
        .seo-shimmer { animation: seo-shimmer 1.7s ease-in-out infinite; }
        .seo-fade-up { animation: seo-fade-up .55s ease-out both; }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(14,165,233,0.08), transparent 70%), linear-gradient(to right, rgba(24,24,27,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      />

      <div className="seo-fade-up relative w-full max-w-xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-700">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500" />
          </span>
          Audit in progress
        </span>

        <div className="relative mx-auto mt-8 h-28 w-28">
          <div className="absolute inset-0 rounded-full bg-sky-400/15 blur-2xl" />
          <div className="absolute inset-0 rounded-full border border-sky-100" />
          <div className="seo-spinner absolute inset-0 rounded-full border-2 border-transparent border-r-sky-500 border-t-zinc-900" />
          <div className="absolute inset-3 flex items-center justify-center rounded-full border border-zinc-100 bg-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.4)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg">
              <ActiveIcon size={21} className="text-sky-300" />
            </div>
          </div>
        </div>

        <h2 className="mt-8 text-2xl font-bold tracking-[-0.05em] text-zinc-950">Building your SEO intelligence report</h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-zinc-500">
          We are crawling your website, mapping high-value queries, and checking Google results. This can take 5–10 minutes.
        </p>

        <div className="mt-8 grid gap-2 text-left sm:grid-cols-5">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const active = index === activeIndex
            const complete = index < activeIndex
            return (
              <div key={step.label} className={`rounded-2xl border px-3 py-3 transition ${active ? "border-zinc-900 bg-zinc-950 text-white shadow-lg" : complete ? "border-sky-100 bg-sky-50 text-sky-700" : "border-zinc-200 bg-white text-zinc-400"}`}>
                <Icon size={14} className={active ? "text-sky-300" : complete ? "text-sky-600" : "text-zinc-300"} />
                <p className="mt-2 text-[10px] font-bold leading-4">{step.label}</p>
              </div>
            )
          })}
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-md items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div className="relative h-full rounded-full bg-zinc-950 transition-all duration-700" style={{ width: `${progress}%` }}>
              <div className="seo-shimmer absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
            </div>
          </div>
          <span className="w-9 text-right text-[11px] font-bold tabular-nums text-zinc-400">{progress}%</span>
        </div>
        <p className="mt-3 text-[12px] font-medium text-zinc-400">Keep this tab open. Your report will appear automatically when complete.</p>
      </div>
    </div>
  )
}

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

const STEPS = [
  { label: "Scanning ChatGPT", domain: "openai.com" },
  { label: "Scanning Gemini", domain: "gemini.google.com" },
  { label: "Scanning Claude", domain: "claude.ai" },
  { label: "Scanning Perplexity", domain: "perplexity.ai" },
  { label: "Compiling visibility report", domain: null },
]

const STEP_CAP_PERCENT = 90
// Controls how quickly progress approaches the cap. Tuned so it feels
// natural across a 6-8 minute generation window without ever hitting 100%
// on its own (the parent swaps this component out once isGenerating flips).
const PROGRESS_TAU_SECONDS = 150

const PARTICLES = [
  { top: "18%", left: "22%", size: 5, delay: "0s", duration: "5.5s" },
  { top: "28%", left: "78%", size: 4, delay: "0.8s", duration: "6.2s" },
  { top: "72%", left: "18%", size: 3, delay: "1.6s", duration: "5s" },
  { top: "78%", left: "82%", size: 5, delay: "0.4s", duration: "6.8s" },
  { top: "50%", left: "10%", size: 3, delay: "2.1s", duration: "5.8s" },
  { top: "45%", left: "90%", size: 4, delay: "1.1s", duration: "6.4s" },
]

export function ReportGenerating({ brandName }: { brandName: string }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const startedAt = Date.now()
    const interval = setInterval(() => {
      setElapsedSeconds((Date.now() - startedAt) / 1000)
    }, 250)
    return () => clearInterval(interval)
  }, [])

  // Asymptotic curve: climbs quickly at first, then eases off and
  // creeps toward the cap the longer generation runs, but never reaches it.
  const progress = Math.min(
    STEP_CAP_PERCENT,
    Math.round(STEP_CAP_PERCENT * (1 - Math.exp(-elapsedSeconds / PROGRESS_TAU_SECONDS)))
  )

  const scannableSteps = STEPS.filter((step) => step.domain)
  const activeIndex = Math.min(
    STEPS.length - 1,
    Math.floor((progress / STEP_CAP_PERCENT) * STEPS.length)
  )
  const isFinishingUp = progress >= STEP_CAP_PERCENT - 3

  return (
    <div className="report-page relative flex items-center justify-center overflow-hidden">
      <style>{`
                @keyframes spin-slow { to { transform: rotate(360deg); } }
                @keyframes spin-slow-reverse { to { transform: rotate(-360deg); } }
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(220%); } }
                @keyframes float-particle { 0%, 100% { transform: translateY(0) scale(1); opacity: 0.35; } 50% { transform: translateY(-14px) scale(1.15); opacity: 0.8; } }
                @keyframes fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .sara-ring-outer { animation: spin-slow 3.2s linear infinite; }
                .sara-ring-inner { animation: spin-slow-reverse 2.4s linear infinite; }
                .shimmer-bar { animation: shimmer 1.6s ease-in-out infinite; }
                .particle { animation: float-particle ease-in-out infinite; }
                .fade-up { animation: fade-up 0.6s ease-out both; }
            `}</style>

      {/* Backdrop: grid + radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-white"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 55% at 50% 42%, rgba(24,24,27,0.05), transparent 70%), linear-gradient(to right, rgba(24,24,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      />

      {/* Floating particles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="particle absolute rounded-full bg-zinc-900"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <div className="fade-up relative text-center">
        <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-[11px] font-semibold text-zinc-600 shadow-sm backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Generating live
        </span>

        {/* Orb */}
        <div className="relative mx-auto h-32 w-32">
          <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-2xl" />
          <div className="absolute inset-0 rounded-full bg-zinc-900/10 blur-xl" />
          <div className="absolute inset-0 rounded-full border border-zinc-200" />
          <div className="absolute inset-3 rounded-full border border-zinc-100" />
          <div
            className="sara-ring-outer absolute inset-0 rounded-full border-2 border-transparent"
            style={{ borderTopColor: "#18181b", borderRightColor: "rgba(24,24,27,0.15)" }}
          />
          <div
            className="sara-ring-inner absolute inset-3 rounded-full border-2 border-transparent"
            style={{ borderBottomColor: "#a1a1aa" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
              <Sparkles size={22} className="text-amber-400" />
            </div>
          </div>
        </div>

        <h2 className="mt-8 text-2xl font-bold tracking-tight text-zinc-950">
          Sara is building your report
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-6 text-zinc-500">
          Analyzing ChatGPT, Gemini, Claude and Perplexity signals for{" "}
          <span className="font-semibold text-zinc-800">{brandName}</span>.
        </p>

        {/* Live step + platform row */}
        <div className="mt-7 flex items-center justify-center gap-2">
          {scannableSteps.map((step, index) => {
            const isActive = index === activeIndex
            const isDone = index < activeIndex || activeIndex >= STEPS.length - 1
            return (
              <div
                key={step.domain}
                title={step.label}
                className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border bg-white transition-all duration-300 ${isActive
                    ? "scale-110 border-zinc-900 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.4)]"
                    : isDone
                      ? "border-zinc-300 opacity-90"
                      : "border-zinc-200 opacity-40"
                  }`}
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${step.domain}&sz=64`}
                  alt={step.label}
                  className="h-full w-full object-cover"
                />
              </div>
            )
          })}
        </div>

        <p className="mt-3 text-[12px] font-semibold text-zinc-400 transition-all duration-300">
          {isFinishingUp ? "Finishing up, almost there..." : `${STEPS[activeIndex].label}...`}
        </p>

        {/* Progress bar */}
        <div className="mx-auto mt-6 flex w-72 items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="relative h-full rounded-full bg-zinc-900 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="shimmer-bar absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          </div>
          <span className="w-9 text-right text-[11px] font-bold tabular-nums text-zinc-400">
            {progress}%
          </span>
        </div>
        <p className="mt-3 text-[12px] font-medium text-zinc-400">This usually takes 6–8 minutes.</p>
      </div>
    </div>
  )
}
import { useEffect, useState } from "react"
import { Radio } from "lucide-react"
import type { RedditScanMode } from "@/lib/redditIntelligenceApi"

export function RedditScanGenerating({ mode, brandName }: { mode: RedditScanMode; brandName: string }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const startedAt = Date.now()
    const interval = setInterval(() => {
      setElapsedSeconds((Date.now() - startedAt) / 1000)
    }, 250)
    return () => clearInterval(interval)
  }, [])

  const cap = mode === "deep" ? 92 : 88
  const tau = mode === "deep" ? 110 : 70
  const progress = Math.min(cap, Math.round(cap * (1 - Math.exp(-elapsedSeconds / tau))))
  const steps = [
    "Building tuned Reddit keywords",
    "Triggering Bright Data scan",
    "Collecting public discussions",
    "Scoring buyer intent",
    "Summarizing themes and actions",
  ]
  const activeStep = steps[Math.min(steps.length - 1, Math.floor((progress / cap) * steps.length))]

  return (
    <div className="relative flex min-h-[calc(100vh-160px)] items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 32%, rgba(249,115,22,0.12), transparent 26rem), linear-gradient(to right, rgba(16,24,40,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,24,40,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 38px 38px, 38px 38px",
        }}
      />
      <div className="relative w-full max-w-xl px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-orange-700">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
          </span>
          Reddit scan running
        </span>

        <div className="relative mx-auto mt-8 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-orange-300/20 blur-3xl" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-zinc-950" />
          <div className="absolute inset-4 animate-[spin_2.4s_linear_infinite_reverse] rounded-full border-2 border-transparent border-b-orange-500" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white">
            <Radio size={22} />
          </div>
        </div>

        <h2 className="mt-7 text-[20px] font-bold tracking-tight text-zinc-950">
          Scanning Reddit for {brandName}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-6 text-zinc-500">
          We are collecting public Reddit posts, removing duplicates, scoring buyer intent, and turning signal into clean themes and actions.
        </p>

        <div className="mx-auto mt-7 max-w-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">
            <span>{activeStep}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-zinc-950 transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-[12px] font-medium text-zinc-400">Standard usually takes 1-3 minutes. Deep can take longer.</p>
        </div>
      </div>
    </div>
  )
}
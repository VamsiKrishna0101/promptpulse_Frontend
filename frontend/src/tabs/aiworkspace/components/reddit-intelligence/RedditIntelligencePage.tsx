import { useEffect, useState } from "react"
import { ArrowLeft, Bot, MessageSquare, Radio, Settings2, Sparkles } from "lucide-react"
import {
  getBrandPreference,
  saveBrandPreference,
  type BrandPreference,
  type BrandPreferencePayload,
} from "@/lib/brandPreferencesApi"
import {
  getRedditIntelligence,
  runRedditScan,
  type RedditIntelligenceResponse,
  type RedditScanMode,
} from "@/lib/redditIntelligenceApi"
import { useProjects } from "@/hooks/useProjects"
import { RedditPreferenceModal } from "./RedditPreferenceModal"
import { RedditRunDetailPage } from "./RedditRunDetailPage"
import { RedditRunsList } from "./RedditRunsList"
import { RedditScanGenerating } from "./RedditScanGenerating"
import { isRunnablePreference } from "./redditHelpers"

export function RedditIntelligencePage({ onBack }: { onBack: () => void }) {
  const { selectedProject } = useProjects()
  const projectId = selectedProject?.id ?? null
  const [data, setData] = useState<RedditIntelligenceResponse | null>(null)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [brandPreference, setBrandPreference] = useState<BrandPreference | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [runningMode, setRunningMode] = useState<RedditScanMode | null>(null)
  const [pendingMode, setPendingMode] = useState<RedditScanMode | null>(null)
  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false)
  const [isSavingPreference, setIsSavingPreference] = useState(false)
  const [preferenceError, setPreferenceError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedRun = data?.runs.find((run) => run.id === selectedRunId) ?? null

  async function run(mode: RedditScanMode) {
    if (!projectId || runningMode) return
    if (!brandPreference || !isRunnablePreference(brandPreference)) {
      setPendingMode(mode)
      setPreferenceError(null)
      setIsPreferenceModalOpen(true)
      return
    }
    await runWithPreference(mode, brandPreference)
  }

  async function runWithPreference(mode: RedditScanMode, preference: BrandPreference) {
    if (!projectId || runningMode || !isRunnablePreference(preference)) return
    setRunningMode(mode)
    setError(null)
    try {
      const response = await runRedditScan(projectId, mode)
      setData(response.intelligence)
      setBrandPreference(response.intelligence.brand_preference ?? preference)
      setSelectedRunId(null)
    } catch (err: any) {
      if (err?.response?.data?.code === "BRAND_PREFERENCES_REQUIRED") {
        setPendingMode(mode)
        setPreferenceError(null)
        setIsPreferenceModalOpen(true)
        return
      }
      setError(err?.response?.data?.error ?? "Reddit scan failed")
    } finally {
      window.dispatchEvent(new Event("credits:changed"))
      setRunningMode(null)
    }
  }

  async function savePreferences(payload: BrandPreferencePayload) {
    if (!projectId) return
    setIsSavingPreference(true)
    setPreferenceError(null)
    try {
      const saved = await saveBrandPreference(projectId, payload)
      setBrandPreference(saved)
      setData((current) => current ? { ...current, brand_preference: saved } : current)
      setIsPreferenceModalOpen(false)
      const modeToRun = pendingMode
      setPendingMode(null)
      if (modeToRun) await runWithPreference(modeToRun, saved)
    } catch (err: any) {
      setPreferenceError(err?.response?.data?.error ?? "Failed to save brand preferences")
    } finally {
      setIsSavingPreference(false)
    }
  }

  useEffect(() => {
    if (!projectId) return
    let cancelled = false

    async function loadProjectRedditIntelligence() {
      setIsLoading(true)
      setError(null)
      try {
        const [response, preference] = await Promise.all([
          getRedditIntelligence(projectId as string),
          getBrandPreference(projectId as string),
        ])
        if (!cancelled) {
          setData(response)
          setBrandPreference(response.brand_preference ?? preference)
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.error ?? "Failed to load Reddit Intelligence")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadProjectRedditIntelligence()
    return () => {
      cancelled = true
    }
  }, [projectId])

  if (runningMode) {
    return <RedditScanGenerating mode={runningMode} brandName={selectedProject?.brand_name ?? "your brand"} />
  }

  if (selectedRun && data) {
    return <RedditRunDetailPage run={selectedRun} baseData={data} onBack={() => setSelectedRunId(null)} />
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      {isPreferenceModalOpen && (
        <RedditPreferenceModal
          brandName={selectedProject?.brand_name ?? "your brand"}
          preference={brandPreference}
          isSaving={isSavingPreference}
          error={preferenceError}
          onClose={() => {
            if (isSavingPreference) return
            setIsPreferenceModalOpen(false)
            setPendingMode(null)
          }}
          onSave={(payload) => void savePreferences(payload)}
        />
      )}

      <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(24,24,27,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 70% 100% at 0% 0%, black 30%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 100% at 0% 0%, black 30%, transparent 85%)",
          }}
        />

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-700"
              >
                <ArrowLeft size={14} />
              </button>
              <Radio size={14} className="text-orange-600" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                AI Workspace / Reddit Intelligence
              </span>
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-zinc-950">
              Reddit Intelligence scans
            </h1>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-zinc-500">
              Generate saved Reddit snapshots, then open a scan to review buyer discussions, AI-cited threads,
              themes, risks, and recommended actions.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { icon: MessageSquare, label: "Buyer language" },
                { icon: Bot, label: "AI-cited threads" },
                { icon: Sparkles, label: "Action ideas" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-medium text-zinc-600">
                  <Icon size={12} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
            <button
              type="button"
              onClick={() => {
                setPendingMode(null)
                setPreferenceError(null)
                setIsPreferenceModalOpen(true)
              }}
              className="mb-3 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <p className="flex items-center gap-2 text-[12px] font-semibold text-zinc-950">
                <Settings2 size={14} />
                {isRunnablePreference(brandPreference) ? "Brand preferences ready" : "Set brand preferences first"}
              </p>
              <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500">
                {isRunnablePreference(brandPreference)
                  ? `${brandPreference?.industry_category} - ${brandPreference?.keywords?.slice(0, 3).join(", ")}`
                  : "Required before paid scans to avoid bad matches."}
              </p>
            </button>

            <div className="grid gap-2 sm:grid-cols-2">
              <ScanButton title="Standard scan" detail="1 credit - up to 25 posts" variant="dark" disabled={Boolean(runningMode)} onClick={() => void run("standard")} />
              <ScanButton title="Deep scan" detail="3 credits - up to 100 posts" variant="light" disabled={Boolean(runningMode)} onClick={() => void run("deep")} />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
          {error}
        </div>
      )}

      <RedditRunsList runs={data?.runs ?? []} isLoading={isLoading} onOpen={setSelectedRunId} />

      {!isLoading && data?.cited_threads?.length ? (
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[12px] font-medium text-zinc-500">
          You also have {data.cited_threads.length} AI-cited Reddit thread{data.cited_threads.length === 1 ? "" : "s"} available inside each scan detail.
        </div>
      ) : null}
    </div>
  )
}

function ScanButton({
  title,
  detail,
  variant,
  disabled,
  onClick,
}: {
  title: string
  detail: string
  variant: "dark" | "light"
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-xl px-4 py-4 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "dark"
          ? "bg-zinc-950 text-white shadow-[0_12px_28px_-20px_rgba(15,23,42,0.7)]"
          : "border border-orange-200 bg-orange-50 text-orange-950",
      ].join(" ")}
    >
      <p className="text-[12px] font-semibold">{title}</p>
      <p className={["mt-1 text-[11px]", variant === "dark" ? "text-white/60" : "text-orange-700"].join(" ")}>{detail}</p>
    </button>
  )
}

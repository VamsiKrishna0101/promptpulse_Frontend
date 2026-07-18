import { useEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Loader2, Rocket, ShieldCheck, Upload } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/Toast"
import { GEO_COUNTRIES, countryFlagUrl } from "@/lib/countries"
import { BrandReviewCard } from "./components/BrandReviewCard"
import { PromptSelectionCard } from "./components/PromptSelectionCard"
import { SetupProgress } from "./components/SetupProgress"
import {
  createProject,
  enqueueInitialRun,
  getPlanQuota,
  generatePrompts,
  researchBrand,
} from "./onboardingApi"
import type { PlanQuota } from "./onboardingApi"
import type {
  BrandResearchData,
  BrandResearchResult,
  SuggestedPrompt,
} from "./types"
import { PROMPT_LIMIT_BY_PLAN, PROJECT_LIMIT_BY_PLAN } from "./types"

type Step = "brand" | "review" | "prompts" | "launch"

const stepIndex: Record<Step, number> = {
  brand: 0,
  review: 1,
  prompts: 2,
  launch: 3,
}

export function OnboardingSetupPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>("brand")
  const [brandName, setBrandName] = useState("")
  const [brandUrl, setBrandUrl] = useState("")
  const [brandLocation, setBrandLocation] = useState("United States")
  const [research, setResearch] = useState<BrandResearchResult | null>(null)
  const [brandData, setBrandData] = useState<BrandResearchData | null>(null)
  const [prompts, setPrompts] = useState<SuggestedPrompt[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [isWorking, setIsWorking] = useState(false)
  const [customBrief, setCustomBrief] = useState("")
  const [customPromptText, setCustomPromptText] = useState("")
  const [quota, setQuota] = useState<PlanQuota | null>(null)
  const [isQuotaLoading, setIsQuotaLoading] = useState(true)

  const plan = user?.plan ?? "FREE"
  const totalPromptLimit = quota?.limits.prompts ?? PROMPT_LIMIT_BY_PLAN[plan]
  const promptLimit = quota?.remaining.prompts ?? totalPromptLimit
  const projectLimit = quota?.limits.projects ?? PROJECT_LIMIT_BY_PLAN[plan]
  const projectCount = quota?.usage.project_count ?? 0
  const canCreateProject = (quota?.remaining.projects ?? Math.max(0, projectLimit - projectCount)) > 0

  const selectedPrompts = useMemo(
    () => prompts.filter((_, index) => selected.has(index)),
    [prompts, selected],
  )

  useEffect(() => {
    let cancelled = false

    async function loadQuota() {
      setIsQuotaLoading(true)
      try {
        const nextQuota = await getPlanQuota()
        if (!cancelled) setQuota(nextQuota)
      } catch (error) {
        toast({
          title: "Plan usage unavailable",
          description: getErrorMessage(error, "We could not load your plan capacity yet."),
          type: "warning",
        })
      } finally {
        if (!cancelled) setIsQuotaLoading(false)
      }
    }

    void loadQuota()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleResearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!brandName.trim() || !brandUrl.trim()) return

    setIsWorking(true)

    try {
      const result = await researchBrand({
        brand_name: brandName.trim(),
        brand_url: brandUrl.trim(),
      })

      setResearch(result)
      setBrandData(result.data)
      setStep("review")
    } catch (error) {
      toast({
        title: "Brand crawl failed",
        description: getErrorMessage(error, "We could not read this website yet."),
        type: "warning",
      })
    } finally {
      setIsWorking(false)
    }
  }

  async function handleGeneratePrompts() {
    if (!brandData || !research) return

    setIsWorking(true)

    try {
      const nextPrompts = await generatePrompts({
        brand_name: brandName.trim(),
        brand_url: research.brand_url,
        brand_data: customBrief.trim()
          ? {
            ...brandData,
            description: `${brandData.description}\n\nCustomer brief:\n${customBrief.trim()}`,
          }
          : brandData,
      })

      setPrompts(nextPrompts)
      setSelected(new Set(nextPrompts.slice(0, promptLimit).map((_, index) => index)))
      setStep("prompts")
    } catch (error) {
      toast({
        title: "Prompt generation failed",
        description: getErrorMessage(error, "Try again after reviewing your brand profile."),
        type: "warning",
      })
    } finally {
      setIsWorking(false)
    }
  }

  function togglePrompt(index: number) {
    setSelected((current) => {
      const next = new Set(current)

      if (next.has(index)) {
        next.delete(index)
        return next
      }

      if (next.size >= promptLimit) return next

      next.add(index)
      return next
    })
  }

  function addCustomPrompt() {
    const text = customPromptText.trim()
    if (!text) return

    setPrompts((current) => {
      const exists = current.some(prompt => prompt.text.trim().toLowerCase() === text.toLowerCase())
      if (exists) return current

      const nextIndex = current.length
      if (selected.size < promptLimit) {
        setSelected((currentSelected) => new Set(currentSelected).add(nextIndex))
      }

      return [
        ...current,
        {
          topic: "Custom",
          type: "user prompt",
          text,
        },
      ]
    })
    setCustomPromptText("")
  }

  function removePrompt(index: number) {
    setPrompts((current) => current.filter((_, promptIndex) => promptIndex !== index))
    setSelected((current) => {
      const next = new Set<number>()
      current.forEach((selectedIndex) => {
        if (selectedIndex < index) next.add(selectedIndex)
        if (selectedIndex > index) next.add(selectedIndex - 1)
      })
      return next
    })
  }

  async function handleLaunch() {
    if (!research || !brandData || selectedPrompts.length === 0 || !canCreateProject) return

    setStep("launch")
    setIsWorking(true)

    try {
      const project = await createProject({
        brand_name: brandName.trim(),
        brand_url: research.brand_url,
        brand_location: brandLocation.trim() || "United States",
        competitors: [],
        prompts: selectedPrompts,
      })

      await enqueueInitialRun(project.id)

      toast({
        title: "Workspace launched",
        description: "Your first prompt run has been queued.",
        type: "success",
      })

      localStorage.setItem("promptpulse_selected_project_id", project.id)
      navigate("/dashboard", { replace: true })
    } catch (error) {
      setStep("prompts")

      toast({
        title: "Launch failed",
        description: getErrorMessage(error, "Project was not created."),
        type: "warning",
      })
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f4f5] px-5 py-5">
      <div className="mx-auto flex max-w-5xl flex-col gap-3">
        <header className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4e4e7] pb-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
                <ShieldCheck size={12} />
                AI visibility setup
              </p>

              <SetupProgress current={stepIndex[step]} />
            </div>

            <div className="max-w-3xl">
              <h1 className="text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-[#18181b] md:text-[38px]">
                Build your first AI visibility benchmark.
              </h1>

              <p className="mt-2.5 max-w-2xl text-[13px] font-medium leading-6 text-[#52525b]">
                Crawl your website, review the brand facts, select buyer-style prompts,
                then launch an AI visibility run. Prompts are shared across all projects in your plan.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-[11.5px] font-semibold text-[#52525b]">
                <span className="rounded-lg border border-[#e4e4e7] bg-white px-2.5 py-1.5">
                  Projects {projectCount} / {projectLimit}
                </span>
                <span className="rounded-lg border border-[#e4e4e7] bg-white px-2.5 py-1.5">
                  Prompts {quota?.usage.prompt_count ?? 0} / {totalPromptLimit}
                </span>
                <span className="rounded-lg border border-[#e4e4e7] bg-white px-2.5 py-1.5">
                  {promptLimit} prompts available
                </span>
              </div>
            </div>
          </div>
        </header>

        {!isQuotaLoading && !canCreateProject && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] font-medium leading-6 text-amber-800">
            Your {plan} plan already has {projectCount} / {projectLimit} projects. Upgrade or remove a project before adding another.
          </section>
        )}

        {step === "brand" && canCreateProject && (
          <form
            onSubmit={handleResearch}
            className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]"
          >
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_230px_auto] md:items-end">
              <Field
                label="Brand name"
                value={brandName}
                onChange={setBrandName}
                placeholder="Acme AI"
              />

              <Field
                label="Brand URL"
                value={brandUrl}
                onChange={setBrandUrl}
                placeholder="https://example.com"
              />

              <CountrySelect
                label="Primary market"
                value={brandLocation}
                onChange={setBrandLocation}
              />

              <button
                disabled={isWorking}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#09090b] px-4 text-[12px] font-semibold text-white transition hover:bg-[#27272a] disabled:opacity-60"
              >
                {isWorking ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ArrowRight size={14} />
                )}
                Crawl brand
              </button>
            </div>
          </form>
        )}

        {step === "review" && research && brandData && (
          <>
            <BrandReviewCard research={research} data={brandData} onChange={setBrandData} />

            <section className="rounded-2xl border border-dashed border-[#d4d4d8] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.04)]">
              <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
                <Upload size={12} />
                Optional customer brief
              </div>

              <textarea
                value={customBrief}
                onChange={(event) => setCustomBrief(event.target.value)}
                rows={3}
                placeholder="Paste positioning, ICP, product notes, or anything the crawler missed."
                className="mt-3 w-full resize-none rounded-xl border border-[#e4e4e7] bg-white px-3 py-2.5 text-[13px] font-medium leading-6 text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#09090b]"
              />
            </section>

            <div className="flex justify-end">
              <button
                onClick={handleGeneratePrompts}
                disabled={isWorking}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#09090b] px-4 text-[12px] font-semibold text-white transition hover:bg-[#27272a] disabled:opacity-60"
              >
                {isWorking ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ArrowRight size={14} />
                )}
                Generate prompt set
              </button>
            </div>
          </>
        )}

        {step === "prompts" && (
          <>
            <PromptSelectionCard
              prompts={prompts}
              selected={selected}
              limit={promptLimit}
              plan={plan}
              totalLimit={totalPromptLimit}
              usedAcrossProjects={quota?.usage.prompt_count ?? 0}
              onToggle={togglePrompt}
              customPromptText={customPromptText}
              onCustomPromptTextChange={setCustomPromptText}
              onAddCustomPrompt={addCustomPrompt}
              onRemovePrompt={removePrompt}
            />

            <div className="flex justify-end">
              <button
                onClick={handleLaunch}
                disabled={isWorking || selectedPrompts.length === 0 || !canCreateProject}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#09090b] px-4 text-[12px] font-semibold text-white transition hover:bg-[#27272a] disabled:opacity-60"
              >
                {isWorking ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                Launch first run
              </button>
            </div>
          </>
        )}

        {step === "launch" && (
          <div className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-8 text-center shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
            <Loader2 className="mx-auto animate-spin text-[#09090b]" size={28} />

            <h2 className="mt-4 text-[24px] font-semibold tracking-[-0.04em] text-[#18181b]">
              Creating workspace and queueing today’s run.
            </h2>

            <p className="mt-2 text-[13px] font-medium text-[#52525b]">
              Your selected prompts will appear in the dashboard as soon as jobs begin completing.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { error?: unknown; detail?: unknown; message?: unknown } } })
      .response?.data === "object"
  ) {
    const data = (
      error as { response: { data: { error?: unknown; detail?: unknown; message?: unknown } } }
    ).response.data

    const message = data.detail || data.error || data.message

    if (typeof message === "string") return message
  }

  if (error instanceof Error) return error.message
  return fallback
}

function CountrySelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const selected = GEO_COUNTRIES.find(country => country.name === value) ?? GEO_COUNTRIES[0]
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const filteredCountries = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return GEO_COUNTRIES

    return GEO_COUNTRIES.filter(country => (
      country.name.toLowerCase().includes(normalized) ||
      country.code.toLowerCase().includes(normalized)
    ))
  }, [query])

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onClickOutside)
    document.addEventListener("keydown", onEscape)

    return () => {
      document.removeEventListener("mousedown", onClickOutside)
      document.removeEventListener("keydown", onEscape)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery("")
      return
    }

    const timeout = window.setTimeout(() => searchRef.current?.focus(), 20)
    return () => window.clearTimeout(timeout)
  }, [open])

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa]">
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        className="flex h-10 w-full items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-3 text-left text-[13px] font-semibold text-[#18181b] outline-none transition hover:border-[#d4d4d8] focus:border-[#09090b]"
      >
        <CountryFlag code={selected.code} name={selected.name} />
        <span className="min-w-0 flex-1 truncate">{selected.name}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={["flex-shrink-0 text-[#a1a1aa] transition-transform", open ? "rotate-180" : ""].join(" ")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-[#e4e4e7] bg-white shadow-[0_18px_45px_-18px_rgba(24,24,27,0.35)]">
          <div className="border-b border-[#e4e4e7] p-2">
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search countries..."
              className="h-9 w-full rounded-lg border border-[#e4e4e7] bg-[#fafafa] px-3 text-[12.5px] font-semibold text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#09090b] focus:bg-white"
            />
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
          {filteredCountries.length === 0 ? (
            <div className="px-3 py-5 text-center text-[12px] font-semibold text-[#a1a1aa]">
              No countries found
            </div>
          ) : filteredCountries.map(country => {
            const active = country.code === selected.code

            return (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onChange(country.name)
                  setOpen(false)
                  setQuery("")
                }}
                className={[
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] font-semibold transition",
                  active ? "bg-[#f4f4f5] text-[#09090b]" : "text-[#52525b] hover:bg-[#fafafa] hover:text-[#18181b]",
                ].join(" ")}
              >
                <CountryFlag code={country.code} name={country.name} />
                <span className="min-w-0 flex-1 truncate">{country.name}</span>
                {active && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0 text-[#09090b]"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            )
          })}
          </div>
        </div>
      )}
    </div>
  )
}

function CountryFlag({ code, name }: { code: string; name: string }) {
  return (
    <img
      src={countryFlagUrl(code)}
      alt={`${name} flag`}
      className="h-4 w-5 flex-shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(24,24,27,0.08)]"
      loading="lazy"
    />
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label>
      <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 text-[13px] font-medium text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#09090b]"
      />
    </label>
  )
}

import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Loader2, Rocket, ShieldCheck, Upload } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/Toast"
import { BrandReviewCard } from "./components/BrandReviewCard"
import { PromptSelectionCard } from "./components/PromptSelectionCard"
import { SetupProgress } from "./components/SetupProgress"
import {
  createProject,
  enqueueInitialRun,
  generatePrompts,
  researchBrand,
} from "./onboardingApi"
import type {
  BrandResearchData,
  BrandResearchResult,
  SuggestedPrompt,
} from "./types"
import { PROMPT_LIMIT_BY_PLAN } from "./types"

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

  const plan = user?.plan ?? "FREE"
  const promptLimit = PROMPT_LIMIT_BY_PLAN[plan]

  const selectedPrompts = useMemo(
    () => prompts.filter((_, index) => selected.has(index)),
    [prompts, selected],
  )

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
    if (!research || !brandData || selectedPrompts.length === 0) return

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

      localStorage.setItem("geolens_selected_project_id", project.id)
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
                then launch your first AI visibility run.
              </p>
            </div>
          </div>
        </header>

        {step === "brand" && (
          <form
            onSubmit={handleResearch}
            className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]"
          >
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_190px_auto] md:items-end">
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

              <Field
                label="Primary market"
                value={brandLocation}
                onChange={setBrandLocation}
                placeholder="United States"
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
              onToggle={togglePrompt}
              customPromptText={customPromptText}
              onCustomPromptTextChange={setCustomPromptText}
              onAddCustomPrompt={addCustomPrompt}
              onRemovePrompt={removePrompt}
            />

            <div className="flex justify-end">
              <button
                onClick={handleLaunch}
                disabled={isWorking || selectedPrompts.length === 0}
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

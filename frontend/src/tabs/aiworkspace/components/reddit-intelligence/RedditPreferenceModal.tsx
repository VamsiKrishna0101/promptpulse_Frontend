import { useState, type FormEvent } from "react"
import { Loader2, Save, Settings2, X } from "lucide-react"
import type { BrandPreference, BrandPreferencePayload } from "@/lib/brandPreferencesApi"
import { buildPreferencePayload, defaultRedditFocus, listToText } from "./redditHelpers"

export function RedditPreferenceModal({
  brandName,
  preference,
  isSaving,
  error,
  onClose,
  onSave,
}: {
  brandName: string
  preference: BrandPreference | null
  isSaving: boolean
  error: string | null
  onClose: () => void
  onSave: (payload: BrandPreferencePayload) => void
}) {
  const [industryCategory, setIndustryCategory] = useState(preference?.industry_category ?? "")
  const [buyerPersona, setBuyerPersona] = useState(preference?.buyer_persona ?? "")
  const [keywords, setKeywords] = useState(listToText(preference?.keywords))
  const [avoidKeywords, setAvoidKeywords] = useState(listToText(preference?.avoid_keywords))
  const [competitorContext, setCompetitorContext] = useState(preference?.competitor_context ?? "")
  const [redditFocus, setRedditFocus] = useState(listToText(preference?.reddit_focus?.length ? preference.reddit_focus : defaultRedditFocus))

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave(buildPreferencePayload({ industryCategory, buyerPersona, keywords, avoidKeywords, competitorContext, redditFocus }))
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/60 px-4">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_30px_80px_-40px_rgba(16,24,40,0.5)]">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 bg-zinc-50/60 p-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
              <Settings2 size={13} />
              Brand preferences
            </span>
            <h2 className="mt-3 text-[20px] font-bold tracking-tight text-zinc-950">Tune Reddit scans for {brandName}</h2>
            <p className="mt-2 max-w-xl text-[13px] leading-6 text-zinc-500">
              These settings prevent broad brand-name matches and help PromptPulse scan the exact market your buyers care about.
            </p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900">
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Industry / category" value={industryCategory} onChange={setIndustryCategory} placeholder="AI visibility software, streetwear brand..." />
            <Field label="Buyer persona" value={buyerPersona} onChange={setBuyerPersona} placeholder="B2B SaaS marketers, streetwear buyers..." />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextArea label="Keywords to include" value={keywords} onChange={setKeywords} placeholder={"ai visibility tracking\nbrand monitoring\nGEO tools"} />
            <TextArea label="Avoid bad matches" value={avoidKeywords} onChange={setAvoidKeywords} placeholder={"profound books\nprofound lyrics\nhearing loss"} />
          </div>

          <TextArea label="Competitor context" value={competitorContext} onChange={setCompetitorContext} rows={3} placeholder="QueryForge and RankPilot are SEO competitors, not direct GEO tools." />
          <TextArea label="Reddit focus" value={redditFocus} onChange={setRedditFocus} rows={3} placeholder={"reviews\nalternatives\npricing complaints\nrecommendations"} />

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">{error}</div>}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-4">
          <p className="text-[12px] font-medium text-zinc-500">Used for Reddit now, and later for prompt generation, Sara, reports, and content briefs.</p>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save and continue
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-[13.5px] font-medium outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  placeholder,
  rows = 6,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  rows?: number
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-[13.5px] font-medium leading-6 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  )
}

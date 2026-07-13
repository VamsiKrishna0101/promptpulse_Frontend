import type { ElementType } from "react"
import {
  FileText,
  Sparkles,
  Building2,
  Users,
  Package,
  BriefcaseBusiness,
  Swords,
  Gem,
  Mic2,
} from "lucide-react"
import type { BrandResearchData, BrandResearchResult } from "../types"

type Field = keyof BrandResearchData

const fields: {
  key: Field
  label: string
  rows?: number
  icon: ElementType
  tone: "zinc" | "emerald" | "amber" | "red"
  helper: string
}[] = [
    {
      key: "description",
      label: "Brand description",
      rows: 4,
      icon: FileText,
      tone: "zinc",
      helper: "What the company does and how AI engines should understand it.",
    },
    {
      key: "industry",
      label: "Industry",
      icon: Building2,
      tone: "emerald",
      helper: "The market category this brand belongs to.",
    },
    {
      key: "target_audience",
      label: "Target audience",
      rows: 3,
      icon: Users,
      tone: "amber",
      helper: "The buyers, teams, or users this brand should appear for.",
    },
    {
      key: "key_products_services",
      label: "Products and services",
      rows: 3,
      icon: Package,
      tone: "zinc",
      helper: "Core products, services, features, and use cases.",
    },
    {
      key: "business_model",
      label: "Business model",
      rows: 2,
      icon: BriefcaseBusiness,
      tone: "zinc",
      helper: "How the company delivers and monetizes its value.",
    },
    {
      key: "competitors",
      label: "Likely competitors",
      rows: 2,
      icon: Swords,
      tone: "red",
      helper: "Competitors AI engines may compare against this brand.",
    },
    {
      key: "unique_value_proposition",
      label: "Unique value proposition",
      rows: 3,
      icon: Gem,
      tone: "emerald",
      helper: "The strongest reason this brand should be recommended.",
    },
    {
      key: "tone_and_brand_voice",
      label: "Tone and brand voice",
      rows: 2,
      icon: Mic2,
      tone: "amber",
      helper: "The writing style and positioning tone used in prompts.",
    },
  ]

const TONE_STYLE = {
  zinc: {
    card: "border-[#e4e4e7] bg-white",
    icon: "border-[#e4e4e7] bg-[#f4f4f5] text-[#18181b]",
    helper: "text-[#71717a]",
  },
  emerald: {
    card: "border-emerald-200 bg-emerald-50/45",
    icon: "border-emerald-200 bg-emerald-50 text-emerald-700",
    helper: "text-emerald-900/65",
  },
  amber: {
    card: "border-amber-200 bg-amber-50/45",
    icon: "border-amber-200 bg-amber-50 text-amber-700",
    helper: "text-amber-900/65",
  },
  red: {
    card: "border-red-200 bg-red-50/45",
    icon: "border-red-200 bg-red-50 text-red-700",
    helper: "text-red-900/65",
  },
}

export function BrandReviewCard({
  research,
  data,
  onChange,
}: {
  research: BrandResearchResult
  data: BrandResearchData
  onChange: (next: BrandResearchData) => void
}) {
  function update(key: Field, value: string) {
    onChange({ ...data, [key]: value || null })
  }

  return (
    <section className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#e4e4e7] pb-4">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
            <Sparkles size={12} />
            Review brand profile
          </p>

          <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-[#18181b]">
            Confirm what AI should know about your brand.
          </h2>

          <p className="mt-2 max-w-2xl text-[13px] font-medium leading-6 text-[#52525b]">
            Edit the important brand facts before generating prompts. This keeps your
            benchmark accurate and prevents weak prompt recommendations.
          </p>
        </div>

        <div className="rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-right">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa]">
            Website
          </p>
          <p className="mt-0.5 max-w-[220px] truncate text-[12px] font-semibold text-[#18181b]">
            {research.brand_url}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {fields.map((field, index) => {
          const Icon = field.icon
          const tone = TONE_STYLE[field.tone]

          return (
            <div
              key={field.key}
              className={`rounded-xl border p-3.5 shadow-[0_1px_2px_rgba(9,9,11,0.03)] ${tone.card}`}
            >
              <div className="mb-2.5 flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone.icon}`}
                >
                  <Icon size={15} strokeWidth={2.1} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3 className="text-[13px] font-semibold text-[#18181b]">
                      {field.label}
                    </h3>
                  </div>

                  <p className={`mt-1 text-[12px] font-medium leading-5 ${tone.helper}`}>
                    {field.helper}
                  </p>
                </div>
              </div>

              <textarea
                value={String(data[field.key] ?? "")}
                onChange={(event) => update(field.key, event.target.value)}
                rows={field.rows ?? 1}
                className="w-full resize-none rounded-xl border border-[#e4e4e7] bg-white px-3 py-2.5 text-[13px] font-medium leading-6 text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#09090b]"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
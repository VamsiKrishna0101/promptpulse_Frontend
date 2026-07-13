import type { ComponentInsight } from "../utils/reportMapper"

function scoreTier(score: number | null) {
  if (score === null) {
    return {
      label: "No score",
      card: "border-[#e4e4e7] bg-white",
      value: "text-[#18181b]",
    }
  }

  if (score >= 70) {
    return {
      label: "Strong",
      card: "border-emerald-200 bg-emerald-50/80",
      value: "text-emerald-800",
    }
  }

  if (score >= 40) {
    return {
      label: "Needs attention",
      card: "border-amber-200 bg-amber-50/80",
      value: "text-amber-800",
    }
  }

  return {
    label: "Weak",
    card: "border-red-200 bg-red-50/80",
    value: "text-red-800",
  }
}

function cleanComponentName(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function ScoreBreakdown({ components }: { components: ComponentInsight[] }) {
  if (!components || !components.length) return null

  return (
    <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
      {components.map((component) => {
        const hasScore = typeof component.score === "number" && Number.isFinite(component.score)
        const score = hasScore ? component.score as number : null
        const tier = scoreTier(score)

        return (
          <div key={component.component} className={`rounded-xl border p-4 shadow-[0_1px_2px_rgba(9,9,11,0.04)] ${tier.card}`}>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-[12.5px] font-semibold text-[#18181b]">
                {cleanComponentName(component.component)}
              </h4>
              <span className="rounded-full border border-white/70 bg-white/75 px-1.5 py-0.5 text-[9.5px] font-semibold text-[#52525b]">
                {tier.label}
              </span>
            </div>

            <div className="mt-2.5 flex items-end justify-between gap-3">
              <p className={`text-[22px] font-semibold leading-none tracking-[-0.04em] ${tier.value}`}>
                {hasScore ? score : "NA"}
              </p>
              {component.raw_value && (
                <p className="line-clamp-2 max-w-[66%] text-right text-[11.5px] font-medium leading-4 text-[#52525b]">
                  {component.raw_value}
                </p>
              )}
            </div>

            {component.interpretation_signal && (
              <p className="mt-2.5 line-clamp-2 border-t border-black/5 pt-2.5 text-[12px] font-medium leading-5 text-[#52525b]">
                {component.interpretation_signal}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

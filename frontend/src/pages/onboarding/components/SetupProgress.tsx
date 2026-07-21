import { Check, CircleDashed } from "lucide-react"

const steps = ["Brand", "Review", "Prompts", "Engines", "Launch"] as const

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function SetupProgress({ current }: { current: number }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#e4e4e7] bg-white p-1.5 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
      {steps.map((step, index) => {
        const done = index < current
        const active = index === current

        return (
          <div
            key={step}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] transition",
              active && "border-[#09090b] bg-[#09090b] text-white",
              done && "border-emerald-200 bg-emerald-50 text-emerald-800",
              !active && !done && "border-[#e4e4e7] bg-[#fafafa] text-[#71717a]",
            )}
          >
            <span
              className={cn(
                "flex h-4.5 w-4.5 items-center justify-center rounded-full",
                active && "bg-white text-[#09090b]",
                done && "bg-emerald-600 text-white",
                !active && !done && "bg-white text-[#a1a1aa]",
              )}
            >
              {done ? <Check size={10} /> : <CircleDashed size={10} />}
            </span>

            {step}
          </div>
        )
      })}
    </div>
  )
}

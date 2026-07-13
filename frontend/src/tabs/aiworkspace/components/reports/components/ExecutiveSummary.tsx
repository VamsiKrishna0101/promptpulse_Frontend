import { Sparkles } from "lucide-react"

export function ExecutiveSummary({
  summary,
  timeline,
}: {
  summary: string
  timeline: string[]
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e4e4e7] bg-[#fafafa] shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#09090b] shadow-sm">
              <Sparkles size={13} className="text-white" strokeWidth={2.1} />
            </div>

            <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[#18181b]">
              Executive Summary
            </h2>
          </div>

          <p className="text-[14px] font-medium leading-[1.6] text-[#52525b]">
            {summary}
          </p>
        </div>

        {timeline && timeline.length > 0 && (
          <div className="border-t border-[#e4e4e7] bg-[#f4f4f5] p-4 lg:w-[42%] lg:border-l lg:border-t-0">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
              What changed
            </h2>

            <div className="relative flex flex-col gap-3">
              {timeline.length > 1 && (
                <div className="absolute bottom-2 left-[10px] top-2 w-px bg-[#d4d4d8]" />
              )}

              {timeline.map((item, i) => (
                <div key={i} className="relative flex items-start gap-2.5">
                  <span className="relative z-10 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[9.5px] font-semibold tabular-nums text-[#52525b]">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <p className="mt-[1px] text-[12.5px] font-medium leading-[1.55] text-[#52525b]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
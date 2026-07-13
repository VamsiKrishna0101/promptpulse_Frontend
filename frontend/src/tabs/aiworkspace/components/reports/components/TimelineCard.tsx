import { Inbox } from "lucide-react"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function TimelineCard({
  items,
  tone = "neutral",
}: {
  items: string[]
  tone?: "good" | "risk" | "neutral"
}) {
  if (!items || !items.length) {
    return (
      <div className="flex items-center gap-2 py-1 text-[#a1a1aa]">
        <Inbox size={13} />

        <p className="text-[12px] font-medium text-[#a1a1aa]">
          No items.
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span
            className={cn(
              "mt-[6px] h-[5px] w-[5px] shrink-0 rounded-full",
              tone === "good" && "bg-emerald-500",
              tone === "risk" && "bg-red-500",
              tone === "neutral" && "bg-[#a1a1aa]",
            )}
          />

          <p
            className={cn(
              "text-[12.5px] font-medium leading-[1.55]",
              tone === "good" && "text-emerald-900/80",
              tone === "risk" && "text-red-900/80",
              tone === "neutral" && "text-[#52525b]",
            )}
          >
            {item}
          </p>
        </li>
      ))}
    </ul>
  )
}
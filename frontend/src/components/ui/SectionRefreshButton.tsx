import { RefreshCw } from "lucide-react"

export function SectionRefreshButton({
  onClick,
  loading,
  label = "Refresh",
}: {
  onClick: () => void | Promise<void>
  loading?: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={loading}
      title={label}
      aria-label={label}
      className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-[11px] font-semibold text-zinc-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 disabled:cursor-wait disabled:opacity-60"
    >
      <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
      <span className="hidden sm:inline">{loading ? "Refreshing" : label}</span>
    </button>
  )
}

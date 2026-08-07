import { useEffect } from "react"
import type { WorkspaceMode } from "./workspaceMode"

const OPTIONS: Array<{
  id: WorkspaceMode
  label: string
}> = [
  { id: "GEO", label: "GEO" },
  { id: "SEO", label: "SEO" },
]

export function WorkspaceModeSwitcher({
  mode,
  onChange,
}: {
  mode: WorkspaceMode
  onChange: (mode: WorkspaceMode) => void
}) {
  // Preload SEO bundle on mount so switching is instant without lazy-load delay
  useEffect(() => {
    void import("../../tabs/seo/workspace/SeoWorkspacePage")
  }, [])

  return (
    <div
      role="group"
      aria-label="Workspace mode"
      className="inline-flex h-7.5 items-center rounded-lg border border-slate-200/90 bg-slate-100/90 p-0.5 shadow-2xs"
    >
      {OPTIONS.map((option) => {
        const selected = option.id === mode
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            onMouseEnter={() => {
              if (option.id === "SEO") {
                void import("../../tabs/seo/workspace/SeoWorkspacePage")
              }
            }}
            aria-pressed={selected}
            aria-label={`Switch to ${option.label} workspace`}
            className={`flex h-6.5 min-w-[46px] items-center justify-center rounded-md px-2.5 text-[11.5px] font-bold tracking-tight transition-all duration-150 ${
              selected
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

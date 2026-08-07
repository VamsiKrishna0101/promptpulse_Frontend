import { useMemo, useState } from "react"
import { useCompetitors, type DiscoveredCompetitor, type TrackedCompetitor } from "@/hooks/useCompetitors"
import { useProjects } from "@/hooks/useProjects"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/Toast"

import { Avatar, Sk } from "@/tabs/overview/overview"

type TabKey = "tracked" | "discovered" | "ignored"
type CompetitorLike = TrackedCompetitor | DiscoveredCompetitor
type ConfirmAction =
  | { type: "add"; name: string; url?: string }
  | { type: "track"; row: DiscoveredCompetitor }
  | { type: "remove"; row: TrackedCompetitor }

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const SortIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-zinc-300">
    <path d="M7 9l5-5 5 5" />
    <path d="M17 15l-5 5-5-5" />
  </svg>
)

function brandName(row: CompetitorLike) {
  return "name" in row ? row.name : row.brand_name
}

function brandUrl(row: CompetitorLike) {
  if ("url" in row && row.url) return row.url
  if ("domain" in row && row.domain) return row.domain
  return `${brandName(row).toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
}

function sentimentColor(value: number | null) {
  if (value === null) return "bg-zinc-300"
  if (value >= 60) return "bg-lime-400"
  if (value >= 40) return "bg-amber-400"
  return "bg-rose-500"
}

function confidence(row: DiscoveredCompetitor) {
  if (row.mention_count >= 8 || row.visibility >= 35) return { label: "High", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" }
  if (row.mention_count >= 3 || row.visibility >= 15) return { label: "Medium", cls: "bg-amber-50 text-amber-600 border-amber-100" }
  return { label: "Low", cls: "bg-zinc-100 text-zinc-500 border-zinc-200" }
}

function SegmentButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 rounded-md px-2.5 text-[12px] font-semibold transition-all ${active
        ? "bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
        : "text-zinc-500 hover:text-zinc-800"
      }`}
    >
      {children}
    </button>
  )
}

function MetricChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-4 py-2.5">
      <p className="text-[9.5px] font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-[17px] font-bold leading-none tabular-nums text-zinc-900">{value}</p>
    </div>
  )
}

function MentionDots({ count }: { count: number }) {
  const filled = Math.max(1, Math.min(5, Math.ceil(count / 2)))
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={`h-3 w-1 rounded-full ${index < filled ? "bg-emerald-500" : "bg-zinc-200"}`} />
      ))}
    </div>
  )
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const maybe = error as { response?: { data?: { error?: string; message?: string } }; message?: string }
  return maybe.response?.data?.error ?? maybe.response?.data?.message ?? maybe.message ?? fallback
}

function AddCompetitorDrawer({
  open,
  isSaving,
  onClose,
  onSubmit,
}: {
  open: boolean
  isSaving: boolean
  onClose: () => void
  onSubmit: (input: { name: string; url?: string }) => Promise<void>
}) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")

  if (!open) return null

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    await onSubmit({ name: name.trim(), url: url.trim() || undefined })
    setName("")
    setUrl("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/40" onClick={onClose}>
      <aside className="flex h-full w-full max-w-[430px] flex-col border-l border-zinc-200 bg-[#f7f7f8] shadow-[-18px_0_45px_rgba(15,23,42,0.16)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-5">
          <div>
            <p className="text-[14px] font-semibold text-zinc-900">Add competitor</p>
            <p className="text-[11px] font-medium text-zinc-400">Track a brand in Overview and reports</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-1 flex-col p-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <label className="block text-[12px] font-semibold text-zinc-700">Brand name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="SignalNest"
              className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-[13px] font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300"
            />

            <label className="mt-4 block text-[12px] font-semibold text-zinc-700">Website / domain</label>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://signalnest.example"
              className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-[13px] font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300"
            />

            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-[12px] font-medium leading-relaxed text-zinc-500">
              After adding, this brand becomes tracked and will appear in the Overview graph/table when backend runs include matching mentions.
            </div>
          </div>

          <div className="mt-auto flex items-center justify-end gap-2 pt-5">
            <button type="button" onClick={onClose} className="h-8 rounded-md border border-zinc-200 bg-white px-3 text-[12px] font-semibold text-zinc-600 hover:bg-zinc-50">
              Cancel
            </button>
            <button type="submit" disabled={isSaving || !name.trim()} className="h-8 rounded-md bg-zinc-900 px-3 text-[12px] font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50">
              {isSaving ? "Adding..." : "Add competitor"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}

function ConfirmDialog({
  action,
  isSaving,
  onCancel,
  onConfirm,
}: {
  action: ConfirmAction | null
  isSaving: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!action) return null

  const name = action.type === "remove" ? action.row.name : action.type === "track" ? action.row.brand_name : action.name
  const title = action.type === "remove" ? "Remove competitor?" : "Track this competitor?"
  const body = action.type === "remove"
    ? `${name} will be removed from tracked competitors and will stop appearing as a tracked comparison brand.`
    : `${name} will be added to tracked competitors and included in Overview after matching AI runs are available.`
  const confirmLabel = action.type === "remove" ? "Remove" : "Track competitor"

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-[380px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.18)]" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-zinc-100 px-4 py-3">
          <p className="text-[14px] font-semibold text-zinc-900">{title}</p>
          <p className="mt-1 text-[12px] font-medium leading-relaxed text-zinc-500">{body}</p>
        </div>
        <div className="flex items-center gap-2 bg-[#fafafa] px-4 py-3">
          <Avatar name={name} url={action.type === "remove" ? brandUrl(action.row) : `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`} />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-semibold text-zinc-900">{name}</p>
            <p className="text-[11px] font-medium text-zinc-400">{action.type === "remove" ? "Currently tracked" : "Ready to track"}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-100 px-4 py-3">
          <button onClick={onCancel} className="h-7 rounded-md border border-zinc-200 bg-white px-3 text-[11.5px] font-semibold text-zinc-600 hover:bg-zinc-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaving}
            className={`h-7 rounded-md px-3 text-[11.5px] font-semibold text-white shadow-sm disabled:opacity-50 ${action.type === "remove" ? "bg-rose-600 hover:bg-rose-500" : "bg-zinc-900 hover:bg-zinc-800"}`}
          >
            {isSaving ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function CompetitorDetailsDrawer({
  row,
  ownBrand,
  onClose,
}: {
  row: CompetitorLike
  ownBrand: string
  onClose: () => void
}) {
  const name = brandName(row)
  const visibility = row.visibility ?? 0
  const mentions = row.mention_count ?? 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/40" onClick={onClose}>
      <aside className="flex h-full w-full max-w-[480px] flex-col border-l border-zinc-200 bg-[#f7f7f8] shadow-[-18px_0_45px_rgba(15,23,42,0.16)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar name={name} url={brandUrl(row)} />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-zinc-900">{name}</p>
              <p className="truncate text-[11px] font-medium text-zinc-400">{brandUrl(row)}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-3 divide-x divide-zinc-100 border-b border-zinc-100">
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Visibility</p>
                <p className="mt-1 text-[20px] font-bold text-zinc-900">{visibility.toFixed(0)}%</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Sentiment</p>
                <p className="mt-1 text-[20px] font-bold text-zinc-900">{row.avg_sentiment !== null ? row.avg_sentiment.toFixed(0) : "-"}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Position</p>
                <p className="mt-1 text-[20px] font-bold text-zinc-900">{row.avg_position !== null ? `#${row.avg_position.toFixed(1)}` : "-"}</p>
              </div>
            </div>
            <div className="px-4 py-4">
              <p className="text-[12px] font-semibold text-zinc-800">Comparison note</p>
              <p className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-[12.5px] font-medium leading-relaxed text-zinc-600">
                {name} has appeared in {mentions} AI answers for this project. Keep it tracked to compare it against {ownBrand} in Overview and future prompt runs.
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-semibold text-zinc-800">Where this becomes useful</p>
            <div className="mt-3 space-y-2 text-[12.5px] font-medium text-zinc-600">
              <p className="rounded-lg bg-[#f8f8f9] px-3 py-2">Overview graph: visibility trend beside your brand.</p>
              <p className="rounded-lg bg-white px-3 py-2 ring-1 ring-zinc-100">Sources gaps: pages where this competitor appears but you do not.</p>
              <p className="rounded-lg bg-[#f8f8f9] px-3 py-2">Prompts: competitor mentions and ranking context.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export function CompetitorsTab() {
  const { user } = useAuth()
  const isViewer = user?.agency_role === "CLIENT_VIEWER"

  const { selectedProject } = useProjects()
  const { toast } = useToast()
  const projectId = selectedProject?.id ?? null

  const {
    tracked,
    discovered,
    ignored,
    isLoading,
    isSaving,
    addCompetitor,
    removeCompetitor,
    ignoreCompetitor,
    restoreIgnored,
  } = useCompetitors(projectId)

  const [tab, setTab] = useState<TabKey>("tracked")
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [details, setDetails] = useState<CompetitorLike | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  const ownBrand = selectedProject?.brand_name ?? "Your brand"
  const trackedNames = useMemo(() => new Set(tracked.map((row) => row.name.toLowerCase())), [tracked])
  const ignoredNames = useMemo(() => new Set(ignored.map((row) => row.brand_name.toLowerCase())), [ignored])

  const reviewableDiscovered = discovered.filter((row) => {
    const name = row.brand_name.toLowerCase()
    return name !== ownBrand.toLowerCase() && !trackedNames.has(name) && !ignoredNames.has(name)
  })

  const searchNeedle = search.trim().toLowerCase()
  const rows = useMemo(() => {
    const source: CompetitorLike[] = tab === "tracked" ? tracked : tab === "discovered" ? reviewableDiscovered : ignored
    return source.filter((row) => {
      if (!searchNeedle) return true
      return brandName(row).toLowerCase().includes(searchNeedle)
    })
  }, [ignored, reviewableDiscovered, searchNeedle, tab, tracked])

  const mentionedThisPeriod = discovered.filter((row) => row.mention_count > 0).length
  // PAYG: no competitor limits — always allowed

  async function confirmPendingAction() {
    if (!confirmAction) return

    if (confirmAction.type !== "remove") {
      // no limit check in PAYG
    }

    try {
      if (confirmAction.type === "remove") {
        await removeCompetitor(confirmAction.row.id)
      } else if (confirmAction.type === "track") {
        await addCompetitor({
          name: confirmAction.row.brand_name,
          url: confirmAction.row.domain ? `https://${confirmAction.row.domain}` : undefined,
        })
        setTab("tracked")
      } else {
        await addCompetitor({ name: confirmAction.name, url: confirmAction.url })
        setTab("tracked")
      }
      setConfirmAction(null)
    } catch (error) {
      toast({
        title: "Could not update competitors",
        description: getApiErrorMessage(error, "Please try again in a moment."),
        type: "warning",
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-10">
      <section data-product-tour-id="competitors-shell" className="dashboard-card">
        <div className="dashboard-card-header h-[58px]">
          <div>
            <h1 className="dashboard-card-title">Competitors</h1>
            <p className="dashboard-card-subtitle mt-0.5">Manage brands tracked across AI answers for {ownBrand}</p>
          </div>
          {!isViewer && (
            <button
              onClick={() => setAddOpen(true)}
              className="h-8 rounded-lg bg-slate-950 px-3 text-[11.5px] font-semibold text-white shadow-[0_12px_24px_-18px_rgba(15,23,42,0.8)] hover:bg-slate-800"
            >
              + Add competitor
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 divide-x divide-slate-200/80 border-b border-slate-200/80 bg-white/70">
          <MetricChip label="Tracked" value={tracked.length} />
          <MetricChip label="Discovered" value={reviewableDiscovered.length} />
          <MetricChip label="Mentioned" value={mentionedThisPeriod} />
          <MetricChip label="Total" value={tracked.length} />
        </div>

        <div className="flex h-[52px] items-center justify-between border-b border-slate-200/80 px-4">
          <div className="inline-flex rounded-lg bg-zinc-100/80 p-1">
            <SegmentButton active={tab === "tracked"} onClick={() => setTab("tracked")}>Tracked <span className="ml-1 text-zinc-400">{tracked.length}</span></SegmentButton>
            <SegmentButton active={tab === "discovered"} onClick={() => setTab("discovered")}>Discovered <span className="ml-1 text-zinc-400">{reviewableDiscovered.length}</span></SegmentButton>
            <SegmentButton active={tab === "ignored"} onClick={() => setTab("ignored")}>Ignored <span className="ml-1 text-zinc-400">{ignored.length}</span></SegmentButton>
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"><SearchIcon /></span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search competitors"
              className="h-7 w-64 rounded-md border border-zinc-200 bg-white pl-8 pr-3 text-[12px] outline-none placeholder:text-zinc-400 focus:border-zinc-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="peec-table w-full min-w-[1060px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
                <th className="w-[30%] px-4 py-2.5">Brand</th>
                <th className="px-4 py-2.5"><span className="flex items-center justify-between">Visibility <SortIcon /></span></th>
                <th className="px-4 py-2.5">Sentiment</th>
                <th className="px-4 py-2.5">Position</th>
                <th className="px-4 py-2.5">Mentions</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="w-48 px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 7 }).map((_, index) => (
                <tr key={index} className="h-[56px]">
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3"><Sk cls="h-3 w-full" /></td>
                  ))}
                </tr>
              ))}

              {!isLoading && rows.map((row, index) => {
                const name = brandName(row)
                const rowConfidence = "brand_name" in row ? confidence(row) : null

                return (
                <tr key={name} className={`h-[48px] transition-colors hover:bg-blue-50/70 ${index % 2 === 0 ? "premium-row-even" : "premium-row-odd"}`}>
                    <td className="px-4 py-2.5">
                      <button onClick={() => setDetails(row)} className="flex min-w-0 items-center gap-2.5 text-left">
                        <Avatar name={name} url={brandUrl(row)} />
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-semibold text-zinc-900">{name}</p>
                          <p className="truncate text-[10.5px] font-medium text-zinc-400">{brandUrl(row)}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] font-bold tabular-nums text-zinc-900">{row.visibility.toFixed(0)}%</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold tabular-nums text-zinc-700">
                        <span className={`h-1.5 w-1.5 rounded-full ${sentimentColor(row.avg_sentiment)}`} />
                        {row.avg_sentiment !== null ? row.avg_sentiment.toFixed(0) : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] font-semibold tabular-nums text-zinc-600">{row.avg_position !== null ? `# ${row.avg_position.toFixed(1)}` : "-"}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <MentionDots count={row.mention_count ?? 0} />
                        <span className="text-[12px] font-semibold tabular-nums text-zinc-500">{row.mention_count ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {tab === "tracked" && <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600">Tracked</span>}
                      {tab === "discovered" && rowConfidence && <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${rowConfidence.cls}`}>{rowConfidence.label}</span>}
                      {tab === "ignored" && <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-500">Ignored</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setDetails(row)} className="h-6 rounded-md border border-zinc-200 bg-white px-2 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50">View</button>
                        {!isViewer && (
                          <>
                            {tab === "tracked" && "id" in row && (
                              <button onClick={() => setConfirmAction({ type: "remove", row })} className="h-6 rounded-md border border-zinc-200 bg-white px-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50">Remove</button>
                            )}
                            {tab === "discovered" && "brand_name" in row && (
                              <>
                                <button onClick={() => setConfirmAction({ type: "track", row })} className="h-6 rounded-md bg-zinc-900 px-2 text-[11px] font-semibold text-white hover:bg-zinc-800">Track</button>
                                <button onClick={() => ignoreCompetitor(row)} className="h-6 rounded-md border border-zinc-200 bg-white px-2 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-50">Ignore</button>
                              </>
                            )}
                            {tab === "ignored" && "brand_name" in row && (
                              <button onClick={() => restoreIgnored(row.brand_name)} className="h-6 rounded-md border border-zinc-200 bg-white px-2 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50">Restore</button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <p className="text-[14px] font-semibold text-zinc-800">
                      {tab === "tracked" ? "No tracked competitors yet" : tab === "discovered" ? "No discovered competitors to review" : "No ignored competitors"}
                    </p>
                    <p className="mt-1 text-[12.5px] font-medium text-zinc-400">
                      {tab === "tracked" ? "Add competitors to compare them in Overview and future analysis." : "When AI answers mention brands, they will appear here."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AddCompetitorDrawer
        open={addOpen}
        isSaving={isSaving}
        onClose={() => setAddOpen(false)}
        onSubmit={async (input) => {
          setAddOpen(false)
          setConfirmAction({ type: "add", ...input })
        }}
      />
      {details && <CompetitorDetailsDrawer row={details} ownBrand={ownBrand} onClose={() => setDetails(null)} />}
      <ConfirmDialog
        action={confirmAction}
        isSaving={isSaving}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => void confirmPendingAction()}
      />
    </div>
  )
}

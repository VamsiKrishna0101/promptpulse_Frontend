import { useEffect, useMemo, useState } from "react"
import {
  generateActionQueue,
  listActionQueue,
  updateActionQueueStatus,
  type ActionQueueItem,
  type ActionQueueStatus,
} from "@/lib/actionQueueApi"
import { useToast } from "@/components/ui/Toast"
import { useProjects } from "@/hooks/useProjects"
import { ActionQueueHeader } from "./ActionQueueHeader"
import { ActionQueueMetrics } from "./ActionQueueMetrics"
import { ActionQueueList } from "./ActionQueueList"
import { ActionQueueDetail } from "./ActionQueueDetail"
import { readableError } from "./utils"

/** View state: "list" shows the paginated queue, "detail" shows a single item. */
type View = { mode: "list" } | { mode: "detail"; item: ActionQueueItem }

export function ActionQueuePage({ onBack }: { onBack: () => void }) {
  const { selectedProject } = useProjects()
  const toast = useToast()

  const [items, setItems] = useState<ActionQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [view, setView] = useState<View>({ mode: "list" })

  // ----- Data loading -----

  async function loadItems() {
    if (!selectedProject?.id) return
    setIsLoading(true)
    try {
      const data = await listActionQueue(selectedProject.id)
      setItems(data)
    } catch (error) {
      toast.error("Could not load action queue", readableError(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadItems()
  }, [selectedProject?.id])

  // ----- Generate -----

  async function handleGenerate() {
    if (!selectedProject?.id) return
    setIsGenerating(true)
    try {
      const result = await generateActionQueue(selectedProject.id, 30)
      setItems(result.persisted_actions ?? [])
      toast.success("Action queue refreshed", "Fresh AI visibility tasks are ready for this project.")
    } catch (error) {
      toast.error("Could not refresh action queue", readableError(error))
    } finally {
      setIsGenerating(false)
    }
  }

  // ----- Status update -----

  async function handleStatus(itemId: string, status: ActionQueueStatus) {
    setUpdatingId(itemId)
    try {
      const updated = await updateActionQueueStatus(itemId, status)
      setItems((current) => current.map((i) => (i.id === itemId ? updated : i)))
      // Keep the detail view in sync if this item is open
      setView((v) => (v.mode === "detail" && v.item.id === itemId ? { mode: "detail", item: updated } : v))
      toast.success("Action updated")
    } catch (error) {
      toast.error("Could not update action", readableError(error))
    } finally {
      setUpdatingId(null)
    }
  }

  // ----- Counts for metric cards -----

  const counts = useMemo(
    () => ({
      open: items.filter((i) => i.status === "OPEN").length,
      inProgress: items.filter((i) => i.status === "IN_PROGRESS").length,
      done: items.filter((i) => i.status === "DONE").length,
      high: items.filter((i) => i.priority === "HIGH" && i.status !== "DONE" && i.status !== "DISMISSED").length,
    }),
    [items]
  )

  // ----- No project guard -----

  if (!selectedProject) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm font-semibold text-zinc-500 hover:text-zinc-900"
        >
          Back to AI Workspace
        </button>
        <h1 className="text-xl font-bold text-zinc-950">No project selected</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Create or select a project before generating an action queue.
        </p>
      </section>
    )
  }

  // ----- Render -----

  return (
    <div className="flex flex-col gap-5">
      <ActionQueueHeader
        brandName={selectedProject.brand_name}
        onBack={onBack}
        onRefresh={loadItems}
        onGenerate={handleGenerate}
        isRefreshing={isLoading}
        isGenerating={isGenerating}
      />

      <ActionQueueMetrics
        open={counts.open}
        inProgress={counts.inProgress}
        high={counts.high}
        done={counts.done}
      />

      {view.mode === "list" && (
        <ActionQueueList
          items={items}
          isLoading={isLoading}
          onSelectItem={(item) => setView({ mode: "detail", item })}
        />
      )}

      {view.mode === "detail" && (
        <ActionQueueDetail
          item={view.item}
          isUpdating={updatingId === view.item.id}
          onBack={() => setView({ mode: "list" })}
          onStatus={handleStatus}
        />
      )}
    </div>
  )
}

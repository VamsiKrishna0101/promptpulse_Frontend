import { cn } from "@/lib/utils"
import { createContext, useCallback, useContext, useState } from "react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toast: (opts: Omit<Toast, "id">) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

const typeConfig: Record<ToastType, { icon: React.ReactNode; iconWrap: string; title: string }> = {
  success: {
    title: "text-slate-950",
    iconWrap: "border-slate-900 bg-slate-900 text-white shadow-[0_8px_18px_-12px_rgba(15,23,42,0.9)]",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.7} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    title: "text-slate-950",
    iconWrap: "border-rose-200 bg-rose-50 text-rose-600",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.7} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  warning: {
    title: "text-slate-950",
    iconWrap: "border-amber-200 bg-amber-50 text-amber-600",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  info: {
    title: "text-slate-950",
    iconWrap: "border-blue-200 bg-blue-50 text-blue-600",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const config = typeConfig[toast.type]
  return (
    <div className="relative flex min-w-[320px] max-w-[430px] items-start gap-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3.5 shadow-[0_18px_55px_-30px_rgba(15,23,42,0.55),0_8px_18px_-14px_rgba(15,23,42,0.18)] ring-1 ring-white/70 backdrop-blur animate-in slide-in-from-bottom-3 fade-in-0 duration-200">
      <span className={cn("mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border", config.iconWrap)}>{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn("text-[14px] font-bold leading-tight tracking-[-0.01em]", config.title)}>{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-[12.5px] leading-snug text-slate-500">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
        aria-label="Dismiss notification"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const add = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { ...opts, id }])
    setTimeout(() => remove(id), opts.duration ?? 4000)
  }, [remove])

  const ctx: ToastContextType = {
    toast: add,
    success: (title, description) => add({ type: "success", title, description }),
    error: (title, description) => add({ type: "error", title, description }),
    warning: (title, description) => add({ type: "warning", title, description }),
    info: (title, description) => add({ type: "info", title, description }),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Portal */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2.5">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

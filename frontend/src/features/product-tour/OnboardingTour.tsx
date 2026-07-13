import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import type { ProductTourPlacement, ProductTourStep } from "./productTour.types"

type Rect = Pick<DOMRect, "top" | "left" | "width" | "height" | "right" | "bottom">
const TOUR_STEP_STORAGE_KEY = "geolens_product_tour_step"

function getTarget(step: ProductTourStep) {
  if (!step.targetId) return null
  return document.querySelector(`[data-product-tour-id="${step.targetId}"]`) as HTMLElement | null
}

function measure(step: ProductTourStep): Rect | null {
  const target = getTarget(step)
  if (!target) return null
  target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
  const rect = target.getBoundingClientRect()
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    right: rect.right,
    bottom: rect.bottom,
  }
}

function cardPosition(rect: Rect | null, placement: ProductTourPlacement = "center") {
  const cardWidth = Math.min(390, window.innerWidth - 32)
  const cardHeight = 350
  const gap = 18
  const safe = 18
  const vw = window.innerWidth
  const vh = window.innerHeight
  const maxTop = Math.max(safe, vh - cardHeight - safe)
  const clampTop = (top: number) => Math.max(safe, Math.min(maxTop, top))

  if (!rect || placement === "center") {
    return {
      left: Math.max(safe, (vw - cardWidth) / 2),
      top: clampTop(vh * 0.28),
      width: cardWidth,
      maxHeight: vh - safe * 2,
    }
  }

  const middleX = rect.left + rect.width / 2
  const middleY = rect.top + rect.height / 2

  if (placement === "right") {
    return {
      left: Math.min(vw - cardWidth - safe, rect.right + gap),
      top: clampTop(middleY - cardHeight / 2),
      width: cardWidth,
      maxHeight: vh - safe * 2,
    }
  }

  if (placement === "left") {
    return {
      left: Math.max(safe, rect.left - cardWidth - gap),
      top: clampTop(middleY - cardHeight / 2),
      width: cardWidth,
      maxHeight: vh - safe * 2,
    }
  }

  if (placement === "top") {
    return {
      left: Math.max(safe, Math.min(vw - cardWidth - safe, middleX - cardWidth / 2)),
      top: clampTop(rect.top - cardHeight - gap),
      width: cardWidth,
      maxHeight: vh - safe * 2,
    }
  }

  return {
    left: Math.max(safe, Math.min(vw - cardWidth - safe, middleX - cardWidth / 2)),
    top: clampTop(rect.bottom + gap),
    width: cardWidth,
    maxHeight: vh - safe * 2,
  }
}

function ArrowHint({ placement }: { placement?: ProductTourPlacement }) {
  if (!placement || placement === "center") return null

  const cls = {
    right: "left-[-7px] top-1/2 -translate-y-1/2 rotate-45",
    left: "right-[-7px] top-1/2 -translate-y-1/2 rotate-45",
    top: "bottom-[-7px] left-1/2 -translate-x-1/2 rotate-45",
    bottom: "top-[-7px] left-1/2 -translate-x-1/2 rotate-45",
  }[placement]

  return <span className={`absolute h-4 w-4 rounded-[3px] border border-zinc-200 bg-white ${cls}`} />
}

export function OnboardingTour({
  steps,
  onFinish,
  onSkip,
}: {
  steps: ProductTourStep[]
  onFinish: () => void
  onSkip: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [index, setIndexState] = useState(() => {
    const raw = sessionStorage.getItem(TOUR_STEP_STORAGE_KEY)
    const value = raw ? Number(raw) : 0
    return Number.isFinite(value) ? Math.max(0, Math.min(steps.length - 1, value)) : 0
  })
  const [rect, setRect] = useState<Rect | null>(null)
  const step = steps[index]
  const isLast = index === steps.length - 1

  function setIndex(next: number | ((value: number) => number)) {
    setIndexState((current) => {
      const value = typeof next === "function" ? next(current) : next
      const bounded = Math.max(0, Math.min(steps.length - 1, value))
      sessionStorage.setItem(TOUR_STEP_STORAGE_KEY, String(bounded))
      return bounded
    })
  }

  function finishTour() {
    sessionStorage.removeItem(TOUR_STEP_STORAGE_KEY)
    onFinish()
  }

  function skipTour() {
    sessionStorage.removeItem(TOUR_STEP_STORAGE_KEY)
    onSkip()
  }

  useEffect(() => {
    if (step.path && location.pathname !== step.path) {
      setRect(null)
      navigate(step.path)
      return
    }

    function update() {
      window.setTimeout(() => setRect(measure(step)), 80)
    }

    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [location.pathname, navigate, step])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") skipTour()
      if (event.key === "ArrowRight") {
        if (isLast) finishTour()
        else setIndex((value) => Math.min(steps.length - 1, value + 1))
      }
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1))
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isLast, steps.length])

  const position = useMemo(() => cardPosition(rect, step.placement), [rect, step])
  const progress = ((index + 1) / steps.length) * 100

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="absolute inset-0 bg-black/46 backdrop-blur-[1.5px]" />

      {rect && (
        <div
          className="absolute rounded-[24px] border border-white bg-white/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.38),0_24px_70px_-34px_rgba(0,0,0,0.9)] transition-all duration-200"
          style={{
            left: rect.left - 10,
            top: rect.top - 10,
            width: rect.width + 20,
            height: rect.height + 20,
          }}
        />
      )}

      <div
        className="pointer-events-auto absolute overflow-hidden rounded-[28px] border border-black/10 bg-white p-1 shadow-[0_28px_90px_-34px_rgba(0,0,0,0.75)] transition-all duration-200"
        style={position}
      >
        <ArrowHint placement={step.placement} />
        <div className="relative flex max-h-[calc(100vh-44px)] flex-col overflow-hidden rounded-[24px] border border-zinc-200 bg-[linear-gradient(145deg,#ffffff,#f6f6f7)] text-zinc-950">
          <div className="absolute inset-x-0 top-0 h-px bg-white" />
          <div className="relative flex min-h-0 flex-1 flex-col p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10.5px] font-black uppercase tracking-[0.18em] text-zinc-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                {step.eyebrow}
              </span>
              <button
                type="button"
                onClick={skipTour}
                className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Skip demo"
              >
                <X size={15} />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto pr-1">
              <h2 className="text-[24px] font-black leading-[1.05] tracking-[-0.045em] text-zinc-950">
                {step.title}
              </h2>
              <p className="mt-3 text-[14px] font-medium leading-6 text-zinc-600">
                {step.body}
              </p>
            </div>

            <div className="mt-5 h-1.5 flex-shrink-0 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-zinc-950 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-5 flex flex-shrink-0 items-center justify-between gap-3">
              <span className="text-[12px] font-bold text-zinc-400">
                {index + 1} of {steps.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={skipTour}
                  className="rounded-full px-3.5 py-2 text-[12px] font-bold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                >
                  Skip demo
                </button>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => setIndex((value) => Math.max(0, value - 1))}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-[12px] font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                  >
                    <ArrowLeft size={13} />
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isLast) finishTour()
                    else setIndex((value) => Math.min(steps.length - 1, value + 1))
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2 text-[12px] font-black text-white shadow-[0_14px_28px_-16px_rgba(0,0,0,0.75)] transition hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  {isLast ? "Finish" : "Next"}
                  {isLast ? <Check size={13} /> : <ArrowRight size={13} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

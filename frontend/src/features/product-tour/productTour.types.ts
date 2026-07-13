export type ProductTourPlacement = "top" | "right" | "bottom" | "left" | "center"

export type ProductTourStep = {
  id: string
  path?: string
  targetId?: string
  eyebrow: string
  title: string
  body: string
  placement?: ProductTourPlacement
}

export type ProductTourStatus = {
  completed: boolean
  completed_at: string | null
}

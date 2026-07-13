import type { ReactNode } from "react"
import { OnboardingTour } from "./OnboardingTour"
import { productTourSteps } from "./productTourSteps"
import { useProductTour } from "./useProductTour"

export function ProductTourProvider({ children }: { children: ReactNode }) {
  const { shouldShow, isLoading, finish, skip } = useProductTour()

  return (
    <>
      {children}
      {!isLoading && shouldShow && (
        <OnboardingTour steps={productTourSteps} onFinish={finish} onSkip={skip} />
      )}
    </>
  )
}


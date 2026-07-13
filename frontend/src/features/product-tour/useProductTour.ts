import { useCallback, useEffect, useState } from "react"
import { completeProductTour, getProductTourStatus, skipProductTour } from "./productTourApi"

export function useProductTour() {
  const [shouldShow, setShouldShow] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let alive = true

    getProductTourStatus()
      .then((status) => {
        if (!alive) return
        setShouldShow(!status.completed)
      })
      .catch(() => {
        if (!alive) return
        setShouldShow(false)
      })
      .finally(() => {
        if (alive) setIsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  const finish = useCallback(async () => {
    setShouldShow(false)
    try {
      await completeProductTour()
    } catch {
      setShouldShow(false)
    }
  }, [])

  const skip = useCallback(async () => {
    setShouldShow(false)
    try {
      await skipProductTour()
    } catch {
      setShouldShow(false)
    }
  }, [])

  return { shouldShow, isLoading, finish, skip }
}


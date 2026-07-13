import { api } from "@/lib/api"
import type { ProductTourStatus } from "./productTour.types"

export async function getProductTourStatus() {
  const response = await api.get<ProductTourStatus>("/product-tour/status")
  return response.data
}

export async function completeProductTour() {
  const response = await api.post<ProductTourStatus>("/product-tour/complete")
  return response.data
}

export async function skipProductTour() {
  const response = await api.post<ProductTourStatus>("/product-tour/skip")
  return response.data
}


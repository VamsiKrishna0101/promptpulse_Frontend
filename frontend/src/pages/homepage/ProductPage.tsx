import { Navigate, useParams } from "react-router-dom"
import { AnalyticsProductPage } from "@/pages/products/AnalyticsProductPage"
import { CompetitorsProductPage } from "@/pages/products/CompetitorsProductPage"
import { GeoArticlesProductPage } from "@/pages/products/GeoArticlesProductPage"
import { OpportunitiesProductPage } from "@/pages/products/OpportunitiesProductPage"
import { SaraProductPage } from "@/pages/products/SaraProductPage"
import { SourcesProductPage } from "@/pages/products/SourcesProductPage"

export function ProductPage() {
  const { product } = useParams()

  if (product === "analytics") return <AnalyticsProductPage />
  if (product === "competitors") return <CompetitorsProductPage />
  if (product === "sources") return <SourcesProductPage />
  if (product === "opportunities") return <OpportunitiesProductPage />
  if (product === "geo-articles") return <GeoArticlesProductPage />
  if (product === "sara" || product === "consultant") return <SaraProductPage />

  return <Navigate to="/" replace />
}

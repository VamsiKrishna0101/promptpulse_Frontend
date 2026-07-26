import { Bot, FileText, Globe2, MapPin, Search, ShieldCheck } from "lucide-react"

export type SeoSection = "summary" | "keyword-map" | "content-plan" | "local-seo" | "technical-health" | "crawled-pages"

export const SEO_SECTIONS: { id: SeoSection; label: string; description: string; icon: React.ReactNode }[] = [
  { id: "summary", label: "Executive Summary", description: "Scores, scan scope, and key counts", icon: <Bot size={14} /> },
  { id: "keyword-map", label: "Keyword Map", description: "Queries, AI rank, and page coverage", icon: <Search size={14} /> },
  { id: "content-plan", label: "Content Plan", description: "Pages to create or improve", icon: <FileText size={14} /> },
  { id: "local-seo", label: "Local SEO", description: "City, service, FAQ, and schema checklist", icon: <MapPin size={14} /> },
  { id: "technical-health", label: "Technical Health", description: "Crawl, title, H1, and meta fixes", icon: <ShieldCheck size={14} /> },
  { id: "crawled-pages", label: "Crawled Pages", description: "Every URL checked with status", icon: <Globe2 size={14} /> },
]

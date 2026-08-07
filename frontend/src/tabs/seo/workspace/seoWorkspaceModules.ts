import {
  Building2,
  FileText,
  Gauge,
  Link2,
  ScanSearch,
  Search,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

export type SeoWorkspaceModuleId =
  | "overview"
  | "domain-research"
  | "top-pages"
  | "organic-competitors"
  | "keyword-research"
  | "site-audit"
  | "on-page"
  | "content"
  | "backlinks"
  | "local"
  | "reports"

export type SeoWorkspaceModule = {
  id: SeoWorkspaceModuleId
  path: string
  title: string
  shortTitle: string
  description: string
  outcome: string
  icon: LucideIcon
  accent: string
  status: "FOUNDATION" | "CONNECT DATA" | "BUILD NEXT" | "PROVIDER NEEDED"
  capabilities: string[]
  dataSources: string[]
}

export const SEO_WORKSPACE_MODULES: SeoWorkspaceModule[] = [
  {
    id: "overview",
    path: "/seo",
    title: "SEO Overview",
    shortTitle: "Overview",
    description: "A client-ready summary of organic visibility, rankings, technical health, authority, and the next actions to take.",
    outcome: "Know what changed and where the team should work next.",
    icon: Gauge,
    accent: "bg-sky-50 text-sky-700",
    status: "FOUNDATION",
    capabilities: ["Organic performance summary", "Priority action queue", "Cross-module trends"],
    dataSources: ["Google Search Console", "Google Analytics 4", "PromptPulse modules"],
  },
  {
    id: "domain-research",
    path: "/seo/domain-research",
    title: "Domain Research",
    shortTitle: "Domain",
    description: "Reverse-engineer a domain’s organic traffic, ranking pages, keywords, and search competitors.",
    outcome: "Understand where a client or competitor wins organic demand.",
    icon: Building2,
    accent: "bg-violet-50 text-violet-700",
    status: "FOUNDATION",
    capabilities: ["Organic keyword footprint", "Top pages and traffic share", "Competitor and gap discovery"],
    dataSources: ["SERP database", "Google Search Console", "Website crawl"],
  },
  {
    id: "top-pages",
    path: "/seo/top-pages",
    title: "Top Pages",
    shortTitle: "Pages",
    description: "Inspect the landing pages contributing the most organic traffic, value, and ranking coverage.",
    outcome: "Find the pages to protect, improve, and replicate.",
    icon: FileText,
    accent: "bg-sky-50 text-sky-700",
    status: "FOUNDATION",
    capabilities: ["Organic landing pages", "Ranking coverage", "Page gains and declines"],
    dataSources: ["Saved domain snapshot", "SERP database"],
  },
  {
    id: "organic-competitors",
    path: "/seo/organic-competitors",
    title: "Organic Competitors",
    shortTitle: "Competitors",
    description: "Compare domains competing across the same keyword universe and identify search visibility gaps.",
    outcome: "Understand who owns the demand you are trying to win.",
    icon: UsersRound,
    accent: "bg-cyan-50 text-cyan-700",
    status: "FOUNDATION",
    capabilities: ["Shared keywords", "Competitive coverage", "Traffic gap discovery"],
    dataSources: ["Saved domain snapshot", "SERP database"],
  },
  {
    id: "keyword-research",
    path: "/seo/keyword-research",
    title: "Keyword Research",
    shortTitle: "Keywords",
    description: "Discover keyword demand, search intent, questions, difficulty, SERP composition, and related topic clusters.",
    outcome: "Choose the search topics worth investing in.",
    icon: Search,
    accent: "bg-cyan-50 text-cyan-700",
    status: "FOUNDATION",
    capabilities: ["Keyword ideas and intent", "Volume and difficulty", "Clusters and SERP analysis"],
    dataSources: ["Keyword intelligence dataset", "Country search databases"],
  },
  {
    id: "site-audit",
    path: "/seo/site-audit",
    title: "Site Audit",
    shortTitle: "Audit",
    description: "Crawl the website for indexability, performance, internal linking, metadata, schema, and content health issues.",
    outcome: "Find and prioritize technical problems blocking organic growth.",
    icon: ScanSearch,
    accent: "bg-rose-50 text-rose-700",
    status: "FOUNDATION",
    capabilities: ["Technical health score", "Issue and URL evidence", "Scheduled recrawls and change tracking"],
    dataSources: ["PromptPulse crawler", "Sitemaps and robots.txt", "Page HTML"],
  },
  {
    id: "backlinks",
    path: "/seo/backlinks",
    title: "Backlinks",
    shortTitle: "Backlinks",
    description: "Analyze referring domains, gained and lost links, authority, competitor gaps, and link-building prospects.",
    outcome: "Understand and improve the authority supporting organic rankings.",
    icon: Link2,
    accent: "bg-stone-100 text-stone-800",
    status: "FOUNDATION",
    capabilities: ["Backlink profile", "New and lost links", "Link gap and prospect discovery"],
    dataSources: ["Link intelligence index", "Website crawl"],
  },
]

export function seoModuleFromPath(pathname: string) {
  return [...SEO_WORKSPACE_MODULES]
    .sort((left, right) => right.path.length - left.path.length)
    .find(module =>
      pathname === module.path || pathname.startsWith(`${module.path}/`),
    ) ?? SEO_WORKSPACE_MODULES[0]
}

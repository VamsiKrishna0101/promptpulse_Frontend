import { CheckCircle2, Gauge, RefreshCw, SearchCheck, Sparkles, Zap } from "lucide-react"

function AuditOptionCard({
  title,
  eyebrow,
  description,
  cost,
  icon,
  bullets,
  tone,
  onRun,
  isRunning,
}: {
  title: string
  eyebrow: string
  description: string
  cost: string
  icon: React.ReactNode
  bullets: string[]
  tone: "blue" | "slate"
  onRun: () => void
  isRunning: boolean
}) {
  const isBlue = tone === "blue"
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
        isBlue
          ? "border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-[0_4px_20px_-6px_rgba(59,130,246,0.15)]"
          : "border-slate-100 bg-white shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]"
      }`}
    >
      {isBlue && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_60%)]" />
      )}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.13em] ${isBlue ? "text-blue-500" : "text-slate-400"}`}>
            {eyebrow}
          </p>
          <h3 className="mt-1.5 text-[17px] font-black tracking-[-0.03em] text-slate-900">{title}</h3>
          <p className="mt-1.5 text-[12.5px] font-medium leading-5 text-slate-500">{description}</p>
        </div>
        <span
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
            isBlue ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
          }`}
        >
          {icon}
        </span>
      </div>

      <div className="relative mt-4 grid gap-2">
        {bullets.map(bullet => (
          <div key={bullet} className="flex items-start gap-2 text-[12px] font-semibold leading-5 text-slate-600">
            <CheckCircle2 size={13} className={`mt-0.5 flex-shrink-0 ${isBlue ? "text-blue-500" : "text-emerald-500"}`} />
            {bullet}
          </div>
        ))}
      </div>

      <button
        onClick={onRun}
        disabled={isRunning}
        className={`relative mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-[12.5px] font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
          isBlue
            ? "bg-blue-600 text-white shadow-[0_4px_16px_-4px_rgba(59,130,246,0.5)] hover:bg-blue-700"
            : "bg-slate-900 text-white shadow-[0_4px_16px_-4px_rgba(15,23,42,0.4)] hover:bg-slate-800"
        }`}
      >
        {isRunning ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
        {isRunning ? "Running…" : cost}
      </button>
    </div>
  )
}

export function SeoEmptyState({
  costs,
  onRun,
  isRunning,
}: {
  costs: { quick_scan: number; full_audit_max: number }
  onRun: (mode: "quick" | "full") => void
  isRunning: boolean
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_16px_-4px_rgba(15,23,42,0.08)]">
      {/* Header zone */}
      <div className="relative px-6 py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_-20%,rgba(59,130,246,0.05),transparent)]" />
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10.5px] font-black uppercase tracking-[0.12em] text-blue-600">
              <SearchCheck size={11} /> Audit setup
            </span>
            <h2 className="mt-3 text-[22px] font-black tracking-[-0.04em] text-slate-900">
              Choose how deep you want to scan.
            </h2>
            <p className="mt-2 max-w-[640px] text-[13px] font-medium leading-6 text-slate-500">
              We start from your project website, check sitemap URLs and internal links, then map those pages against SEO and AI-search buyer queries.
            </p>
          </div>
          <div className="flex-shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-medium text-slate-600">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Credit policy</p>
            <p className="mt-1">Failed audits are refunded. Full audit charges only used crawl capacity.</p>
          </div>
        </div>
      </div>

      {/* Cards zone */}
      <div className="grid gap-4 border-t border-slate-50 bg-slate-50/40 p-5 xl:grid-cols-2">
        <AuditOptionCard
          eyebrow="Fast preview"
          title="Quick SEO Scan"
          description="Homepage-only scan for technical, local, schema, and AI readiness signals."
          cost={`Run quick scan · ${costs.quick_scan} credit`}
          icon={<Zap size={17} />}
          tone="blue"
          bullets={["1 page analyzed", "Good for first preview", "No prompt content-gap matching"]}
          onRun={() => onRun("quick")}
          isRunning={isRunning}
        />
        <AuditOptionCard
          eyebrow="Recommended"
          title="Full SEO Intelligence Audit"
          description="Crawl pages and connect SEO gaps to your high-value tracked prompts."
          cost={`Run full audit · ${costs.full_audit_max} credits`}
          icon={<Gauge size={17} />}
          tone="slate"
          bullets={["Up to 25 HTML pages", "Keyword/page coverage", "Prioritized content plan"]}
          onRun={() => onRun("full")}
          isRunning={isRunning}
        />
      </div>
    </div>
  )
}

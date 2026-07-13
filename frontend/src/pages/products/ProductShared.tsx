import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { NavHeader } from "@/components/navbar/navbar"
import { ArrowRight, ChevronDown, FileText, Globe2, HelpCircle, LayoutGrid, LogOut, MessageSquare, Settings, ShieldCheck, Sparkles, Trophy, User } from "lucide-react"

export type ProductAccent = "blue" | "green" | "orange" | "slate"

const navItems = [
  { label: "Overview", icon: LayoutGrid },
  { label: "Opportunities", icon: Sparkles },
  { label: "GEO Articles", icon: FileText },
  { label: "Prompts", icon: MessageSquare },
  { label: "Sources", icon: Globe2 },
  { label: "Competitors", icon: Trophy },
]

const settingsNavItems: Array<{ label: string; icon: typeof User; badge?: string }> = [
  { label: "Profile", icon: User },
  { label: "Subscription", icon: FileText },
  { label: "Settings", icon: Settings },
  { label: "Admin Panel", icon: ShieldCheck, badge: "Admin" },
]

const accentClasses: Record<ProductAccent, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  orange: "bg-orange-50 text-orange-700 border-orange-100",
  slate: "bg-zinc-100 text-zinc-700 border-zinc-200",
}

const accentBar: Record<ProductAccent, string> = {
  blue: "#2563EB",
  green: "#10B981",
  orange: "#F59E0B",
  slate: "#71717A",
}

export function ProductPageShell({
  eyebrow,
  title,
  description,
  active,
  children,
  metrics,
}: {
  eyebrow: string
  title: ReactNode
  description: string
  active: string
  children: ReactNode
  metrics: Array<{ label: string; value: string; note: string; accent?: ProductAccent }>
}) {
  return (
    <>
      <NavHeader />
      <main className="relative overflow-hidden bg-white">
        <GridBackdrop />
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-14">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11.5px] font-bold text-zinc-700 shadow-sm">
              <Sparkles size={12} className="text-blue-600" />
              {eyebrow}
            </span>
            <h1 className="mt-4 text-[30px] font-black leading-[1.15] tracking-[-0.025em] text-zinc-950 md:text-[40px]">
              {title}
            </h1>
            <p className="mt-3.5 max-w-xl text-[15px] font-medium leading-7 text-zinc-500">
              {description}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-5 text-[12.5px] font-black text-white shadow-[0_14px_28px_-18px_rgba(0,0,0,0.85)] transition hover:bg-zinc-800">
                Start free trial <ArrowRight size={14} />
              </Link>
              <Link to="/pricing" className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-[12.5px] font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50">
                View pricing
              </Link>
            </div>
          </div>

          {metrics.length > 0 && (
            <div className="mt-10 grid gap-3 md:grid-cols-4">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </div>
          )}

          <AppMockFrame active={active}>{children}</AppMockFrame>
        </section>
      </main>
    </>
  )
}

function GridBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(24,24,27,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.04) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        maskImage: "linear-gradient(to bottom, black, transparent 65%)",
        WebkitMaskImage: "linear-gradient(to bottom, black, transparent 65%)",
      }}
    />
  )
}

function MetricCard({ label, value, note, accent = "slate" }: { label: string; value: string; note: string; accent?: ProductAccent }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-[0_20px_60px_-52px_rgba(15,23,42,0.7)] backdrop-blur">
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: accentBar[accent] }} />
      <span className={`absolute right-3 top-4 rounded-full border px-2 py-0.5 text-[9.5px] font-bold ${accentClasses[accent]}`}>{label}</span>
      <p className="mt-6 text-[26px] font-black tracking-[-0.03em] tabular-nums text-zinc-950">{value}</p>
      <p className="mt-1 text-[11.5px] font-medium leading-5 text-zinc-500">{note}</p>
    </div>
  )
}

function AppMockFrame({ active, children }: { active: string; children: ReactNode }) {
  return (
    <div className="relative mt-10 rounded-[24px] border border-zinc-200 bg-white/95 p-2 shadow-[0_36px_110px_-76px_rgba(15,23,42,0.72)]">
      <div className="overflow-hidden rounded-[17px] border border-zinc-200 bg-white">
        <div className="flex min-h-[760px]">
          <aside className="hidden w-[216px] shrink-0 flex-col border-r border-[#22242B] bg-[#111217] p-3 text-white lg:flex">
            <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
              <BrandMark />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-black">Northstar</p>
                <p className="truncate text-[10.5px] text-zinc-500">United States</p>
              </div>
              <ChevronDown size={13} className="text-zinc-500" />
            </div>
            <div className="my-3 h-px bg-white/10" />
            <p className="px-2 text-[9.5px] font-black uppercase tracking-[0.16em] text-zinc-500">General</p>
            <nav className="mt-2 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const selected = item.label === active
                return (
                  <div key={item.label} className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-bold transition ${selected ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"}`}>
                    {selected ? <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-blue-500" /> : null}
                    <Icon size={14} />
                    {item.label}
                  </div>
                )
              })}
            </nav>

            <p className="mt-5 px-2 text-[9.5px] font-black uppercase tracking-[0.16em] text-zinc-500">Settings</p>
            <nav className="mt-2 space-y-0.5">
              {settingsNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-bold text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200">
                    <Icon size={14} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 text-[8.5px] font-black text-zinc-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )
              })}
            </nav>

            <div className="mt-auto space-y-0.5 border-t border-white/10 pt-3">
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-bold text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200">
                <HelpCircle size={14} />
                Help
              </div>
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-bold text-zinc-400 transition hover:bg-white/[0.04] hover:text-rose-300">
                <LogOut size={14} />
                Log out
              </div>
            </div>
          </aside>
          <section className="min-w-0 flex-1 bg-[#F8FAFC]">
            <div className="flex min-h-[52px] items-center gap-2 border-b border-zinc-200 bg-white px-5">
              <FilterPill dark>Northstar</FilterPill>
              <FilterPill>All time</FilterPill>
              <FilterPill>All Topics</FilterPill>
              <FilterPill>All Models</FilterPill>
            </div>
            <div className="p-5">{children}</div>
          </section>
        </div>
      </div>
    </div>
  )
}

function BrandMark() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white">
      <div className="flex h-5 items-end gap-[3px]">
        {[12, 16, 20].map((height) => (
          <span key={height} className="block w-[4px] -skew-y-[28deg] rounded-sm bg-black" style={{ height }} />
        ))}
      </div>
    </div>
  )
}

function FilterPill({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[11.5px] font-bold ${dark ? "border-black bg-black text-white" : "border-zinc-200 bg-white text-zinc-600"}`}>
      {children}
      {!dark ? <ChevronDown size={12} className="text-zinc-400" /> : null}
    </span>
  )
}

export function DashboardCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-zinc-200 bg-white shadow-[0_18px_60px_-50px_rgba(15,23,42,0.65)] ${className}`}>{children}</div>
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-4 border-b border-zinc-100 px-4">
      <div>
        <p className="text-[13px] font-black text-zinc-950">{title}</p>
        {subtitle ? <p className="mt-0.5 text-[11px] font-medium text-zinc-400">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function LineChart({ lines = 4 }: { lines?: number }) {
  const colors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"]
  const paths = [
    "M10 74 C150 68 260 58 380 66 C500 76 600 110 720 132",
    "M10 154 C140 124 260 106 380 98 C520 98 610 132 720 160",
    "M10 126 C130 122 260 88 380 96 C510 104 610 130 720 148",
    "M10 118 C130 134 240 154 380 164 C520 170 620 166 720 160",
    "M10 170 C130 156 260 150 380 136 C520 124 640 118 720 110",
  ]
  return (
    <svg viewBox="0 0 740 250" className="h-[250px] w-full">
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="10" x2="730" y1={40 + i * 42} y2={40 + i * 42} stroke="#EEF2F8" strokeDasharray="4 5" />)}
      {paths.slice(0, lines).map((path, i) => <path key={path} d={path} fill="none" stroke={colors[i]} strokeWidth={i === 0 ? 3.6 : 2.2} strokeLinecap="round" opacity={i === 0 ? 1 : 0.85} />)}
      <circle cx="720" cy="132" r="4.5" fill="#fff" stroke="#2563eb" strokeWidth="2.4" />
    </svg>
  )
}

export function Delta({ value }: { value: string }) {
  const down = value.startsWith("-")
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-black tabular-nums ${down ? "border-rose-200/70 bg-rose-50 text-rose-600" : "border-emerald-200/70 bg-emerald-50 text-emerald-700"}`}>
      <span className="text-[8.5px]">{down ? "▼" : "▲"}</span> {value.replace("-", "")}
    </span>
  )
}

export function Favicon({ domain }: { domain: string }) {
  return <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt="" className="h-5 w-5 rounded" />
}
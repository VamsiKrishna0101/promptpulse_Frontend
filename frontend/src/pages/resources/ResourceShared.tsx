import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { NavHeader } from "@/components/navbar/navbar"
import { Footer } from "@/components/footer/footer"
import { ArrowRight, Sparkles } from "lucide-react"

export function ResourceShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: ReactNode
  description: string
  children: ReactNode
}) {
  return (
    <>
      <NavHeader />
      <main className="relative overflow-hidden bg-white">
        <GridBackground />
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-16">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] font-bold text-zinc-800 shadow-sm">
              <Sparkles size={14} />
              {eyebrow}
            </span>
            <h1 className="mt-6 text-[44px] font-black leading-[1.02] tracking-[-0.06em] text-zinc-950 md:text-[72px]">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-[17px] font-medium leading-8 text-zinc-500">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 text-[13px] font-black text-white shadow-[0_18px_34px_-22px_rgba(0,0,0,0.8)] transition hover:bg-zinc-800">
                Start free trial <ArrowRight size={15} />
              </Link>
              <Link to="/pricing" className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-[13px] font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50">
                View pricing
              </Link>
            </div>
          </div>

          <div className="mt-14">{children}</div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export function ResourceCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[24px] border border-zinc-200 bg-white/90 shadow-[0_28px_80px_-62px_rgba(15,23,42,0.75)] backdrop-blur ${className}`}>
      {children}
    </div>
  )
}

export function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400">{eyebrow}</p>
      <h2 className="mt-2 text-[30px] font-black tracking-[-0.045em] text-zinc-950">{title}</h2>
      <p className="mt-2 max-w-2xl text-[14px] font-medium leading-6 text-zinc-500">{description}</p>
    </div>
  )
}

function GridBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(24,24,27,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.045) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
      }}
    >
      <div className="absolute left-1/2 top-20 h-[420px] w-[740px] -translate-x-1/2 rounded-full bg-blue-50/70 blur-3xl" />
    </div>
  )
}

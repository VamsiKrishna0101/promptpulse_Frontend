import { useState } from "react"
import { Sparkles, FileText, ArrowLeft, BarChart3, Bot, Target } from "lucide-react"
import { GenerateReportModal } from "./GenerateReportModal"
import { ReportGenerating } from "./ReportGenerating"
import { ReportsList } from "./ReportsList"
import { ReportViewer } from "./ReportViewer"
import { useReport } from "./hooks/useReport"

export function ReportsPage({ onBack }: { onBack: () => void }) {
  const [modalOpen, setModalOpen] = useState(false)
  const report = useReport()

  if (report.isGenerating) return <ReportGenerating brandName={report.brandName} />

  if (report.detail) {
    return <ReportViewer detail={report.detail} onBack={report.clearDetail} />
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <section className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white p-7 shadow-[0_18px_58px_-48px_rgba(15,23,42,0.65)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(24,24,27,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.045) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 70% 100% at 0% 0%, black 30%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 100% at 0% 0%, black 30%, transparent 85%)",
          }}
        >
          <div className="absolute -left-10 -top-16 h-56 w-56 rounded-full bg-zinc-200/50 blur-3xl" />
        </div>

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-700"
              >
                <ArrowLeft size={14} />
              </button>
              <FileText size={16} className="text-zinc-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                AI Workspace / Reports
              </span>
            </div>
            <h1 className="text-[30px] font-semibold tracking-[-0.06em] text-zinc-950">
              AI visibility reports
            </h1>
            <p className="mt-2 max-w-2xl text-[13.5px] font-medium leading-6 text-zinc-500">
              Turn raw prompt runs into an executive-ready readout: visibility movement,
              competitor pressure, source influence, and the next work to prioritize.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: BarChart3, label: "Score movement" },
                { icon: Bot, label: "Model intelligence" },
                { icon: Target, label: "Recommended actions" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold text-zinc-600"
                >
                  <Icon size={12} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
            <div className="mb-4 grid grid-cols-3 gap-2">
              {[
                { label: "Reports", value: report.reports.length },
                { label: "Report cost", value: "5" },
                { label: "Period", value: "7-30d" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-zinc-200 bg-white px-3 py-2.5">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[18px] font-semibold tracking-[-0.04em] text-zinc-950 tabular-nums">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-[13px] font-semibold text-white shadow-[0_16px_34px_-22px_rgba(0,0,0,0.65)] transition hover:-translate-y-0.5 hover:bg-zinc-800"
            >
              <Sparkles size={15} className="text-emerald-300" />
              Generate new report
            </button>
          </div>
        </div>
      </section>

      {report.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
          {report.error}
        </div>
      )}

      <ReportsList reports={report.reports} isLoading={report.isLoading} onOpen={report.openReport} />

      <GenerateReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGenerate={(period) => {
          setModalOpen(false)
          void report.generate(period)
        }}
      />
    </div>
  )
}

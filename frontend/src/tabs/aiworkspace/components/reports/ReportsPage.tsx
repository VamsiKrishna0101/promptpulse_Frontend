import { useState } from "react"
import { Sparkles, FileText, ArrowLeft } from "lucide-react"
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
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
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

        <div className="relative flex flex-wrap items-center justify-between gap-4">
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">AI Reports</h1>
            <p className="mt-1.5 text-[13px] text-zinc-500">
              Generate and analyze AI visibility reports for your brands.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] transition hover:bg-zinc-800"
          >
            <Sparkles size={15} className="text-amber-400" />
            Generate new report
          </button>
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
import { useState } from "react"
import { FileText, Presentation } from "lucide-react"
import type { ReportViewModel } from "../utils/reportMapper"
import { exportReportPdf } from "./pdf/exportPdf"
import { exportReportPptx } from "./pptx/exportPptx"

type ExportKind = "pptx" | "pdf"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function ReportExportButtons({ report }: { report: ReportViewModel }) {
  const [exporting, setExporting] = useState<ExportKind | null>(null)

  async function handleExport(kind: ExportKind) {
    if (exporting) return
    setExporting(kind)
    try {
      if (kind === "pptx") {
        await exportReportPptx(report)
      } else {
        exportReportPdf(report)
      }
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => void handleExport("pptx")}
        disabled={Boolean(exporting)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-[#d9e3df] bg-[#0b3340] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#174b5a]",
          exporting && "cursor-wait opacity-70",
        )}
      >
        <Presentation size={12} strokeWidth={2.2} />
        {exporting === "pptx" ? "Exporting..." : "PPTX"}
      </button>

      <button
        type="button"
        onClick={() => void handleExport("pdf")}
        disabled={Boolean(exporting)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-[#e4e4e7] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#334155] shadow-sm transition hover:border-[#d4d4d8] hover:text-[#18181b]",
          exporting && "cursor-wait opacity-70",
        )}
      >
        <FileText size={12} strokeWidth={2.2} />
        {exporting === "pdf" ? "Exporting..." : "PDF"}
      </button>
    </div>
  )
}

import { ChevronRight, FileText } from "lucide-react"
import type { SavedReportSummary } from "@/lib/aiReportsApi"
import { asRecord, dateLabel, metric, periodLabel, text } from "./utils/reportHelpers"

export function ReportsList({
  reports,
  isLoading,
  onOpen,
}: {
  reports: SavedReportSummary[]
  isLoading: boolean
  onOpen: (id: string) => void
}) {
  if (isLoading) {
    return <div style={{ borderRadius: 16, border: "1px solid #e2e8f0", background: "#ffffff", padding: 32, fontSize: 14, color: "#64748b", textAlign: "center" }}>Loading reports...</div>
  }

  if (!reports.length) {
    return <div style={{ borderRadius: 16, border: "1px dashed #cbd5e1", background: "#f8fafc", padding: 40, fontSize: 14, color: "#64748b", textAlign: "center" }}>No reports yet. Generate your first AI visibility report.</div>
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {reports.map((report) => {
        const summary = asRecord(report.summary)
        const brandName = report.brand_name || text(summary.brand_name, "Brand")
        const isDone = report.status?.toLowerCase() === "done"
        
        return (
          <button
            key={report.id}
            type="button"
            onClick={() => onOpen(report.id)}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) 120px 120px 40px",
              alignItems: "center",
              gap: 16,
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              padding: "20px 24px",
              textAlign: "left",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(15,23,42,0.02)",
              transition: "all 150ms ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#cbd5e1"
              e.currentTarget.style.transform = "translateY(-1px)"
              e.currentTarget.style.boxShadow = "0 4px 12px -4px rgba(15,23,42,0.08)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0"
              e.currentTarget.style.transform = "none"
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.02)"
            }}
          >
            <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileText size={20} color="#64748b" />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {brandName}
                </p>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#64748b", margin: 0 }}>
                  {periodLabel(report.period_type)} · Generated {dateLabel(report.created_at)}
                </p>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", margin: "0 0 6px" }}>Status</p>
              <div style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                padding: "4px 10px", 
                borderRadius: 20, 
                fontSize: 12, 
                fontWeight: 600, 
                background: isDone ? "#dcfce7" : "#f1f5f9", 
                color: isDone ? "#166534" : "#475569",
                textTransform: "capitalize"
              }}>
                {report.status}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", margin: "0 0 6px" }}>Score</p>
              <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: "#0f172a", margin: 0 }}>
                {metric(summary.visibility_score)}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "#f8fafc", color: "#64748b" }}>
                <ChevronRight size={16} />
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

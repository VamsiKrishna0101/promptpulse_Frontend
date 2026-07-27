import logoUrl from "../../../../../../assets/promptpulse-favicon.png"

export type ReportProfile = {
  companyName: string
  productName: string
  confidentialityLabel: string
  preparedForLabel: string
  logoUrl: string
  colors: {
    ink: string
    navy: string
    sky: string
    mint: string
    paper: string
  }
}

export const defaultReportProfile: ReportProfile = {
  companyName: "PromptPulse",
  productName: "AI Visibility Intelligence",
  confidentialityLabel: "Confidential",
  preparedForLabel: "Prepared for",
  logoUrl,
  colors: {
    ink: "0B1720",
    navy: "07152D",
    sky: "61C7F2",
    mint: "A7F3D0",
    paper: "F8FAFC",
  },
}

import React, { useState, useRef } from "react"
import {
    X,
    UploadCloud,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Trash2,
    UserCheck,
} from "lucide-react"

export interface ParsedPatientRow {
    patientName: string
    patientPhone: string
    doctorName?: string
    slotOrDate?: string
    notes?: string
}

interface PatientCsvUploadModalProps {
    isOpen: boolean
    mode: "OPD" | "DISCHARGE"
    onClose: () => void
    onUploadSuccess: (patients: ParsedPatientRow[]) => void
}

export const PatientCsvUploadModal: React.FC<PatientCsvUploadModalProps> = ({
    isOpen,
    mode,
    onClose,
    onUploadSuccess,
}) => {
    const [dragActive, setDragActive] = useState(false)
    const [, setRawText] = useState("")
    const [parsedRows, setParsedRows] = useState<ParsedPatientRow[]>([])
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!isOpen) return null

    const parseCsvContent = (content: string) => {
        setError(null)
        const lines = content.trim().split(/\r?\n/)
        if (lines.length < 2) {
            setError("CSV must contain a header row and at least 1 patient record.")
            return
        }

        const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""))
        const nameIdx = header.findIndex((h) => h.includes("name") || h.includes("patient"))
        const phoneIdx = header.findIndex((h) => h.includes("phone") || h.includes("mobile") || h.includes("contact"))
        const doctorIdx = header.findIndex((h) => h.includes("doctor") || h.includes("physician") || h.includes("dr"))
        const slotIdx = header.findIndex(
            (h) => h.includes("slot") || h.includes("time") || h.includes("date") || h.includes("discharge")
        )

        if (nameIdx === -1 || phoneIdx === -1) {
            setError("Could not find 'Name' and 'Phone' columns. Please check your headers.")
            return
        }

        const results: ParsedPatientRow[] = []
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue
            const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""))
            if (parts.length <= Math.max(nameIdx, phoneIdx)) continue

            const rawPhone = parts[phoneIdx]
            let sanitizedPhone = rawPhone.replace(/\D/g, "")
            if (sanitizedPhone.length === 10) sanitizedPhone = `+91${sanitizedPhone}`
            else if (sanitizedPhone.length === 12 && sanitizedPhone.startsWith("91")) sanitizedPhone = `+${sanitizedPhone}`
            else if (!sanitizedPhone.startsWith("+")) sanitizedPhone = `+${sanitizedPhone}`

            results.push({
                patientName: parts[nameIdx] || `Patient #${i}`,
                patientPhone: sanitizedPhone,
                doctorName: doctorIdx !== -1 ? parts[doctorIdx] : "Dr. Suresh Reddy, MD",
                slotOrDate: slotIdx !== -1 ? parts[slotIdx] : mode === "OPD" ? "Tomorrow 10:30 AM" : "Discharged Yesterday",
            })
        }

        if (results.length === 0) {
            setError("No valid patient rows found in CSV.")
            return
        }

        setParsedRows(results)
    }

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            readFile(file)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            readFile(e.target.files[0])
        }
    }

    const readFile = (file: File) => {
        const reader = new FileReader()
        reader.onload = (event) => {
            const content = event.target?.result as string
            setRawText(content)
            parseCsvContent(content)
        }
        reader.readAsText(file)
    }

    const loadSampleData = () => {
        let sample = ""
        if (mode === "OPD") {
            sample = `Patient Name,Phone,Doctor Name,Appointment Slot
Venkatesh Rao,+919848011221,Dr. Suresh Reddy (Cardiology),Tomorrow 10:00 AM
Lakshmi Devi,+919440122334,Dr. Suresh Reddy (Cardiology),Tomorrow 10:30 AM
Anil Kumar,+919989033445,Dr. Ananya Rao (Gynaecology),Tomorrow 11:15 AM
Sunitha Murthy,+919849144556,Dr. R. K. Varma (Orthopaedics),Tomorrow 11:45 AM
Nageswara Rao,+919701255667,Dr. K. Srinivas (General Medicine),Tomorrow 12:30 PM
Swapna Reddy,+919866366778,Dr. Suresh Reddy (Cardiology),Tomorrow 02:00 PM`
        } else {
            sample = `Patient Name,Phone,Treating Physician,Discharge Date
Ramesh Chandra,+919848099881,Dr. Suresh Reddy (Cardiology),2026-08-05
Prabhavathi,+919440188772,Dr. Ananya Rao (Gynaecology),2026-08-05
Mohan Krishna,+919989077663,Dr. R. K. Varma (Orthopaedics),2026-08-04
Padmavati Devi,+919849166554,Dr. K. Srinivas (General Medicine),2026-08-04`
        }

        setRawText(sample)
        parseCsvContent(sample)
    }

    const handleConfirm = () => {
        if (parsedRows.length > 0) {
            onUploadSuccess(parsedRows)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                            <FileSpreadsheet className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                {mode === "OPD" ? "Upload Tomorrow's OPD Appointments" : "Upload Discharged Patients List"}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {mode === "OPD"
                                    ? "Upload Excel/CSV with Patient Name, Phone, Doctor, and Appointment Time."
                                    : "Upload list for 24-48h Telugu post-discharge recovery follow-up."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-5">
                    {/* Quick Sample Button */}
                    <div className="flex items-center justify-between rounded-xl bg-blue-50/60 border border-blue-200/80 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-900">
                                Testing without a file? Load sample KIMS hospital patient records.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={loadSampleData}
                            className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors"
                        >
                            Load Sample Data
                        </button>
                    </div>

                    {/* Drag & Drop Area */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault()
                            setDragActive(true)
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                            dragActive
                                ? "border-blue-500 bg-blue-50/50"
                                : "border-slate-300 hover:border-slate-400 bg-slate-50/40"
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-800">
                            Click to browse or drag and drop your CSV file here
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Required columns: <span className="font-semibold text-slate-700">Patient Name, Phone</span> (Optional: Doctor, Slot/Date)
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Parsed Preview Table */}
                    {parsedRows.length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-emerald-600" />
                                    <span className="text-xs font-bold text-slate-800">
                                        Ready to Call ({parsedRows.length} Patients Validated)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setParsedRows([])
                                        setRawText("")
                                    }}
                                    className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1"
                                >
                                    <Trash2 className="h-3 w-3" /> Clear
                                </button>
                            </div>

                            <div className="max-h-48 overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="p-2.5">#</th>
                                            <th className="p-2.5">Patient Name</th>
                                            <th className="p-2.5">Phone (+91)</th>
                                            <th className="p-2.5">Doctor</th>
                                            <th className="p-2.5">{mode === "OPD" ? "Slot" : "Discharge Date"}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {parsedRows.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="p-2.5 text-slate-400 font-mono">{i + 1}</td>
                                                <td className="p-2.5 font-bold text-slate-900">{row.patientName}</td>
                                                <td className="p-2.5 font-mono text-slate-700">{row.patientPhone}</td>
                                                <td className="p-2.5 text-slate-600">{row.doctorName}</td>
                                                <td className="p-2.5 font-medium text-slate-700">{row.slotOrDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={parsedRows.length === 0}
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <CheckCircle2 className="h-4 w-4" /> Load {parsedRows.length} Patients to Desk
                    </button>
                </div>
            </div>
        </div>
    )
}

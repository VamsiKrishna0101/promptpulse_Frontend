import { useState, useEffect } from "react"
import { ArrowLeft, Save, Plus, FileCode2, Eye, LayoutTemplate } from "lucide-react"
import { listEmailTemplates, createEmailTemplate, type EmailTemplate } from "@/lib/emailApi"

interface Props {
    projectId: string
    onBack: () => void
}

export function EmailTemplatesStudio({ projectId, onBack }: Props) {
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<"list" | "create">("list")
    
    // Create state
    const [name, setName] = useState("")
    const [subject, setSubject] = useState("")
    const [htmlBody, setHtmlBody] = useState(`<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
  .header { background: #f97316; padding: 20px; text-align: center; color: white; }
  .content { padding: 30px; color: #3f3f46; line-height: 1.6; }
  .footer { background: #f4f4f5; padding: 20px; text-align: center; font-size: 12px; color: #71717a; }
  .btn { display: inline-block; padding: 12px 24px; background: #09090b; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Vikas Hospitals</h2>
    </div>
    <div class="content">
      <h3>Hello {{name}},</h3>
      <p>This is a sample rich HTML template.</p>
      <p>You can embed images using standard img tags:</p>
      <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80" alt="Hospital" style="width: 100%; border-radius: 6px; margin: 20px 0;" />
      <a href="#" class="btn">View Appointment</a>
    </div>
    <div class="footer">
      © 2026 Vikas Hospitals. All rights reserved.
    </div>
  </div>
</body>
</html>`)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadTemplates()
    }, [projectId])

    async function loadTemplates() {
        setLoading(true)
        try {
            const data = await listEmailTemplates(projectId)
            setTemplates(data)
        } catch (error) {
            console.error("Failed to load templates:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        if (!name || !subject || !htmlBody) return
        setSaving(true)
        try {
            await createEmailTemplate(projectId, { name, subject, htmlBody })
            setView("list")
            loadTemplates()
            setName("")
            setSubject("")
        } catch (error) {
            console.error("Save failed:", error)
        } finally {
            setSaving(false)
        }
    }

    if (view === "create") {
        return (
            <div className="flex flex-col gap-5 h-[80vh]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setView("list")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-600 transition"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back
                        </button>
                        <span className="text-lg font-bold text-zinc-900 ml-4">Create Template</span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving || !name || !subject}
                        className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-[12.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all hover:bg-zinc-800 disabled:opacity-40"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Template"}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">Template Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                            placeholder="e.g. OPD Welcome Email"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Subject Line</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                            placeholder="e.g. Welcome to Vikas Hospitals, {{name}}!"
                        />
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                    <div className="flex flex-col border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                        <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2">
                            <FileCode2 className="w-4 h-4 text-zinc-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">HTML Source</span>
                        </div>
                        <textarea
                            value={htmlBody}
                            onChange={e => setHtmlBody(e.target.value)}
                            className="flex-1 p-4 w-full resize-none outline-none font-mono text-[13px] bg-zinc-950 text-zinc-300"
                            spellCheck={false}
                        />
                    </div>

                    <div className="flex flex-col border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                        <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-zinc-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">Live Preview</span>
                        </div>
                        <div className="flex-1 bg-zinc-100 overflow-auto">
                            <iframe
                                srcDoc={htmlBody.replace(/\{\{\s*name\s*\}\}/g, "Vikas (Preview)")}
                                className="w-full h-full border-none bg-white"
                                title="preview"
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-600 transition shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Hub
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Template Studio</h2>
                    <p className="text-sm text-zinc-500 mt-1">Design and manage your rich HTML email templates.</p>
                </div>
                <button
                    onClick={() => setView("create")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-[12.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all hover:bg-zinc-800"
                >
                    <Plus className="w-4 h-4" />
                    Create Template
                </button>
            </div>

            {loading ? (
                <div className="text-sm text-zinc-500">Loading templates...</div>
            ) : templates.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-300 rounded-2xl bg-zinc-50">
                    <LayoutTemplate className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-zinc-900">No templates found</h3>
                    <p className="text-xs text-zinc-500 mt-1">Create your first HTML template to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {templates.map(t => (
                        <div key={t.id} className="border border-zinc-200 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition">
                            <h3 className="font-semibold text-zinc-900 truncate">{t.name}</h3>
                            <p className="text-xs text-zinc-500 mt-1 truncate">Subject: {t.subject}</p>
                            <div className="mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-400">
                                Updated {new Date(t.updated_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

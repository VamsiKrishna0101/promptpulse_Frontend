import React, { useState } from "react"
import { X, Link2, Copy, Check, Shield, ExternalLink, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import type { AgencyClient, ClientProject } from "./ClientPortfolioGrid"

type Props = {
    isOpen: boolean
    onClose: () => void
    client: AgencyClient | null
    selectedProject?: ClientProject | null
}

export const ShareablePortalLinkModal: React.FC<Props> = ({
    isOpen,
    onClose,
    client,
    selectedProject,
}) => {
    if (!isOpen || !client) return null

    const projects = client.projects
    const [projectId, setProjectId] = useState<string>(selectedProject?.id || projects[0]?.id || "")
    const [title, setTitle] = useState(`${selectedProject?.brand_name || "Client"} Live Intelligence Portal`)
    const [passcode, setPasscode] = useState("")
    const [expiresDays, setExpiresDays] = useState<number>(30)
    const [generating, setGenerating] = useState(false)
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    async function handleGenerate() {
        if (!projectId) {
            setErrorMessage("Please select a project")
            return
        }

        setGenerating(true)
        setErrorMessage("")
        try {
            const res = await api.post<{ success: boolean; share: { share_url: string; token: string } }>("/agency/portal-shares", {
                projectId,
                title,
                passcode: passcode.trim() || undefined,
                expiresDays,
                allowedTabs: ["OVERVIEW", "AI_VISIBILITY", "SEO_KEYWORDS", "DELIVERABLES"],
            })
            setGeneratedUrl(res.data.share.share_url)
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to create portal link")
        } finally {
            setGenerating(false)
        }
    }

    function handleCopy() {
        if (!generatedUrl) return
        void navigator.clipboard.writeText(generatedUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3.5 top-3.5 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                    <X size={16} />
                </button>

                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        <Link2 size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Share Live Client Portal</h2>
                        <p className="text-xs text-slate-500">
                            Create a secure, white-labeled live dashboard link for your client stakeholders.
                        </p>
                    </div>
                </div>

                {!generatedUrl ? (
                    <div className="mt-4 space-y-3">
                        {/* Project Selection */}
                        {projects.length > 1 && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Client Project</label>
                                <select
                                    value={projectId}
                                    onChange={(e) => {
                                        setProjectId(e.target.value)
                                        const p = projects.find((proj) => proj.id === e.target.value)
                                        if (p) setTitle(`${p.brand_name} Live Intelligence Portal`)
                                    }}
                                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                                >
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.brand_name} ({p.brand_url})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <Input
                            label="Portal Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Acme Corp Client Intelligence Hub"
                        />

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                                label="Optional Passcode PIN"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                placeholder="Leave empty for public link"
                                type="text"
                            />

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Link Expiration</label>
                                <select
                                    value={expiresDays}
                                    onChange={(e) => setExpiresDays(Number(e.target.value))}
                                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                                >
                                    <option value={7}>7 days</option>
                                    <option value={30}>30 days (Recommended)</option>
                                    <option value={90}>90 days</option>
                                    <option value={0}>Never expires</option>
                                </select>
                            </div>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500 border border-slate-100 flex items-start gap-2">
                            <Shield size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                            <span>
                                Clients can view interactive AI Visibility scores and download reports without needing to create an account.
                            </span>
                        </div>

                        {errorMessage && (
                            <p className="rounded-md bg-rose-50 p-2 text-xs font-medium text-rose-600 border border-rose-200">
                                {errorMessage}
                            </p>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={onClose} disabled={generating}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={() => void handleGenerate()} disabled={generating} className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5">
                                {generating ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" /> Creating Link…
                                    </>
                                ) : (
                                    "Generate Live Portal Link"
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 space-y-3">
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5 text-center">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-1.5">
                                <Check size={15} />
                            </span>
                            <h3 className="text-xs font-bold text-slate-900">Live Client Portal Ready!</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Share this link with your client to view live scores and download reports.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={generatedUrl}
                                className="h-9 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-mono text-slate-700 select-all"
                            />
                            <Button size="sm" onClick={handleCopy} className="flex-shrink-0 bg-slate-900 hover:bg-slate-800 text-white">
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <a
                                href={generatedUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
                            >
                                <ExternalLink size={12} />
                                Test live portal preview
                            </a>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                Done
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

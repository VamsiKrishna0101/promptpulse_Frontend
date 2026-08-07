import React, { useState } from "react"
import { Palette, Globe, Globe2, Check, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import type { ClientProject } from "./ClientPortfolioGrid"

export type AgencyBrandingData = {
    brand_name: string
    logo_url: string | null
    favicon_url: string | null
    primary_color: string
    accent_color: string
    portal_title: string
    support_email: string | null
    custom_cname: string | null
    footer_text: string | null
    enable_white_label: boolean
}

type Props = {
    initialBranding?: AgencyBrandingData
    previewProject?: ClientProject
    onSaved?: (updated: AgencyBrandingData) => void
}

const PRESET_COLORS = [
    { name: "Apex Slate", color: "#0f172a" },
    { name: "Classic Navy", color: "#1e3a8a" },
    { name: "Ocean Blue", color: "#2563eb" },
    { name: "Forest", color: "#065f46" },
    { name: "Charcoal", color: "#334155" },
]

function cleanDomain(input: string): string {
    return input
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .split("/")[0]
        .trim()
        .toLowerCase()
}

function getFaviconLogoUrl(domain: string): string {
    const clean = cleanDomain(domain)
    if (!clean) return ""
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(clean)}&sz=128`
}

function extractDomainFromLogoUrl(url?: string | null): string {
    if (!url) return ""
    const match = url.match(/[?&]domain(?:_url)?=([^&]+)/i)
    if (match && match[1]) {
        try {
            return cleanDomain(decodeURIComponent(match[1]))
        } catch {
            return cleanDomain(match[1])
        }
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
        try {
            return new URL(url).hostname.replace(/^www\./i, "")
        } catch {
            return ""
        }
    }
    return ""
}

export const WhiteLabelBrandingForm: React.FC<Props> = ({ initialBranding, previewProject, onSaved }) => {
    const [branding, setBranding] = useState<AgencyBrandingData>(
        initialBranding ?? {
            brand_name: "Agency Portfolio",
            logo_url: "",
            favicon_url: "",
            primary_color: "#0f172a",
            accent_color: "#1e293b",
            portal_title: "Client Intelligence Portal",
            support_email: "",
            custom_cname: "",
            footer_text: "Confidential Client Performance Report",
            enable_white_label: true,
        }
    )

    const initialDomain = extractDomainFromLogoUrl(initialBranding?.logo_url) || initialBranding?.custom_cname || ""
    const [agencyDomain, setAgencyDomain] = useState(initialDomain)
    const [useCustomUrl, setUseCustomUrl] = useState(
        Boolean(initialBranding?.logo_url && !initialBranding.logo_url.includes("google.com/s2/favicons"))
    )
    const [logoLoadFailed, setLogoLoadFailed] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savedNotice, setSavedNotice] = useState("")

    // Handle domain change and auto-populate logo using domain trick
    function handleDomainChange(newDomainRaw: string) {
        setAgencyDomain(newDomainRaw)
        setLogoLoadFailed(false)
        const domain = cleanDomain(newDomainRaw)
        if (!domain) {
            if (!useCustomUrl) {
                setBranding(prev => ({ ...prev, logo_url: "", favicon_url: "" }))
            }
            return
        }

        const logoUrl = getFaviconLogoUrl(domain)
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`

        setBranding(prev => {
            const updates: Partial<AgencyBrandingData> = {
                logo_url: useCustomUrl ? prev.logo_url : logoUrl,
                favicon_url: faviconUrl,
            }
            // If brand name is empty or default, suggest one from domain
            if (!prev.brand_name || prev.brand_name === "Agency Portfolio") {
                const namePart = domain.split(".")[0]
                if (namePart) {
                    updates.brand_name = namePart.charAt(0).toUpperCase() + namePart.slice(1)
                }
            }
            return { ...prev, ...updates }
        })
    }

    async function handleSave() {
        setSaving(true)
        setSavedNotice("")
        try {
            const domain = cleanDomain(agencyDomain)
            const payload: AgencyBrandingData = {
                ...branding,
                logo_url: useCustomUrl ? branding.logo_url : (domain ? getFaviconLogoUrl(domain) : branding.logo_url),
                favicon_url: domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64` : branding.favicon_url,
            }
            const res = await api.put<{ success: boolean; branding: AgencyBrandingData }>("/agency/branding", payload)
            setSavedNotice("White-label branding saved successfully.")
            if (onSaved && res.data.branding) onSaved(res.data.branding)
        } catch (error) {
            setSavedNotice(error instanceof Error ? error.message : "Failed to save branding")
        } finally {
            setSaving(false)
        }
    }

    const currentLogoSrc = useCustomUrl ? branding.logo_url : (agencyDomain ? getFaviconLogoUrl(agencyDomain) : branding.logo_url)
    const sampleBrandName = previewProject?.brand_name || "Client Brand Workspace"
    const sampleScore = previewProject?.ai_visibility_score !== undefined ? `${previewProject.ai_visibility_score}%` : "74%"

    return (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Form Settings */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        <Palette size={14} />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-slate-900">Custom Agency Branding</h2>
                        <p className="text-[11px] text-slate-400">Rebrand client portals with your agency identity</p>
                    </div>
                </div>

                <div className="mt-3.5 space-y-3">
                    {/* Toggle White Label */}
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                        <div>
                            <p className="text-xs font-bold text-slate-900">Enable White-Label Mode</p>
                            <p className="text-[10px] text-slate-500">Hide PromptPulse branding and present client portals using your agency's brand identity</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={branding.enable_white_label}
                            onChange={(e) => setBranding({ ...branding, enable_white_label: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                        />
                    </div>

                    {/* Agency Domain & Logo Resolution */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                                <Globe2 size={12} className="text-slate-500" />
                                Agency Website / Domain
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setUseCustomUrl(!useCustomUrl)
                                    if (useCustomUrl && agencyDomain) {
                                        setBranding(prev => ({ ...prev, logo_url: getFaviconLogoUrl(agencyDomain) }))
                                    }
                                }}
                                className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                            >
                                {useCustomUrl ? "Auto-fetch from domain" : "Use custom image URL"}
                            </button>
                        </div>

                        {!useCustomUrl ? (
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        label=""
                                        value={agencyDomain}
                                        onChange={(e) => handleDomainChange(e.target.value)}
                                        placeholder="e.g. youragency.com"
                                        className="h-8 text-xs font-mono pl-2.5"
                                    />
                                </div>
                                {/* Live Logo Badge from Domain */}
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
                                    {agencyDomain && currentLogoSrc && !logoLoadFailed ? (
                                        <img
                                            src={currentLogoSrc}
                                            alt="Logo"
                                            className="h-5 w-5 object-contain"
                                            onError={() => setLogoLoadFailed(true)}
                                        />
                                    ) : (
                                        <Globe size={13} className="text-slate-400" />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Input
                                    label=""
                                    value={branding.logo_url ?? ""}
                                    onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
                                    placeholder="https://youragency.com/logo.png"
                                    className="h-8 text-xs font-mono"
                                />
                            </div>
                        )}
                        <p className="text-[10px] text-slate-400">
                            Logo is auto-extracted from your domain and rendered across all client portals.
                        </p>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                        <Input
                            label="Agency Brand Name"
                            value={branding.brand_name}
                            onChange={(e) => setBranding({ ...branding, brand_name: e.target.value })}
                            placeholder="e.g. Refractone"
                            className="h-8 text-xs"
                        />
                        <Input
                            label="Client Portal Title"
                            value={branding.portal_title}
                            onChange={(e) => setBranding({ ...branding, portal_title: e.target.value })}
                            placeholder="e.g. Client Intelligence Hub"
                            className="h-8 text-xs"
                        />
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                        <Input
                            label="Client Support Email"
                            value={branding.support_email ?? ""}
                            onChange={(e) => setBranding({ ...branding, support_email: e.target.value })}
                            placeholder="support@youragency.com"
                            className="h-8 text-xs"
                        />
                        <Input
                            label="Custom Domain / CNAME (optional)"
                            value={branding.custom_cname ?? ""}
                            onChange={(e) => setBranding({ ...branding, custom_cname: e.target.value })}
                            placeholder="portal.youragency.com"
                            className="h-8 text-xs"
                        />
                    </div>

                    {/* Brand Colors - Muted & Clean */}
                    <div>
                        <label className="text-[11px] font-semibold text-slate-700">Brand Color Accent</label>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {PRESET_COLORS.map((preset) => (
                                <button
                                    key={preset.color}
                                    type="button"
                                    onClick={() => setBranding({ ...branding, primary_color: preset.color })}
                                    className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium transition-all ${
                                        branding.primary_color === preset.color
                                            ? "border-slate-900 bg-slate-100 text-slate-900 font-semibold"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                    }`}
                                >
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: preset.color }} />
                                    {preset.name}
                                </button>
                            ))}
                            <div className="flex items-center gap-1 ml-auto">
                                <span className="text-[10px] text-slate-400 font-mono">Hex:</span>
                                <input
                                    type="text"
                                    value={branding.primary_color}
                                    onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                                    className="h-6 w-18 rounded border border-slate-200 px-1.5 text-[11px] font-mono uppercase focus:border-slate-400 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <Input
                        label="Footer Notice / Copyright"
                        value={branding.footer_text ?? ""}
                        onChange={(e) => setBranding({ ...branding, footer_text: e.target.value })}
                        placeholder="© 2026 Agency Group. Confidential Client Report."
                        className="h-8 text-xs"
                    />

                    {savedNotice && (
                        <p className={`rounded-lg px-3 py-2 text-xs font-medium border ${
                            savedNotice.includes("successfully") ? "bg-slate-100 text-slate-800 border-slate-200" : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                            {savedNotice}
                        </p>
                    )}

                    <div className="pt-1">
                        <Button onClick={() => void handleSave()} disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 px-4 rounded-lg flex items-center gap-1.5">
                            {saving ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" /> Saving…
                                </>
                            ) : (
                                "Save White-Label Settings"
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Live Interactive Preview */}
            <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            Live Portal Header Preview
                        </div>
                        <span className="rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-600">
                            Client View
                        </span>
                    </div>

                    {/* Live Portal Header Preview */}
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5 bg-slate-50/70">
                            <div className="flex items-center gap-2">
                                {currentLogoSrc && !logoLoadFailed ? (
                                    <img src={currentLogoSrc} alt="Logo" className="h-5 w-5 object-contain rounded" onError={() => setLogoLoadFailed(true)} />
                                ) : (
                                    <div
                                        className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white shadow-2xs"
                                        style={{ backgroundColor: branding.primary_color }}
                                    >
                                        {(branding.brand_name || "A").charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs font-bold text-slate-900 leading-none">{branding.brand_name || "Your Agency"}</p>
                                    <p className="text-[9px] text-slate-400 mt-0.5">{branding.portal_title || "Client Intelligence Portal"}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-medium text-slate-500">{sampleBrandName}</span>
                        </div>

                        {/* Live Portal Content Preview */}
                        <div className="p-3.5 space-y-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-800">{sampleBrandName}</p>
                                    <p className="text-[10px] text-slate-400">AI Visibility & Search Performance</p>
                                </div>
                                <span
                                    className="rounded-md px-2 py-0.5 text-xs font-bold text-white shadow-2xs"
                                    style={{ backgroundColor: branding.primary_color }}
                                >
                                    {sampleScore}
                                </span>
                            </div>
                        </div>

                        {/* Live Footer Preview */}
                        <div className="border-t border-slate-100 bg-slate-50/70 px-3 py-1.5 text-center text-[9.5px] text-slate-400">
                            {branding.footer_text || "Powered by Agency Intelligence Suite"}
                        </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <Check size={12} className="text-slate-700 flex-shrink-0" />
                            <span>Client portal links automatically render your domain's logo.</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Check size={12} className="text-slate-700 flex-shrink-0" />
                            <span>PDF and presentation exports embed your agency watermark.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

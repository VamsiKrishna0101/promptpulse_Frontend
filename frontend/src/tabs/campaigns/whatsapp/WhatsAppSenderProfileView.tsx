import { useState, useRef } from "react"
import { ArrowLeft, Upload, Camera, ShieldCheck, RefreshCw, Trash2, Save, Globe, MapPin, Info } from "lucide-react"
import type { WhatsAppAccount } from "@/lib/whatsappApi"
import {
    updateWhatsAppAccountProfile,
    uploadWhatsAppProfilePic,
    syncWhatsAppAccount,
    disconnectWhatsAppAccount,
} from "@/lib/whatsappApi"
import { ConnectAccountBanner } from "./ConnectAccountBanner"

interface Props {
    account: WhatsAppAccount | null
    projectId: string
    onBack: () => void
    onAccountChanged: () => void
}

const BUSINESS_CATEGORIES = [
    "Retail", "Education", "Healthcare", "Finance & Banking", "Real Estate",
    "Restaurant & Food", "Travel & Tourism", "Professional Services", "Technology",
    "Manufacturing", "Agriculture", "Media & Entertainment", "Non-Profit", "Other",
]

function qualityColor(rating: string) {
    if (rating === "HIGH") return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "🟢 High" }
    if (rating === "MEDIUM") return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "🟡 Medium" }
    if (rating === "LOW") return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "🔴 Low" }
    return { bg: "bg-zinc-100", text: "text-zinc-500", border: "border-zinc-200", label: "⚪ Unknown" }
}

function tierLabel(limit: number) {
    if (limit >= 9999999) return "Unlimited"
    if (limit >= 100000) return "Tier 3 — 1,00,000/day"
    if (limit >= 10000) return "Tier 2 — 10,000/day"
    if (limit >= 1000) return "Tier 1 — 1,000/day"
    return "Unverified — 250/day"
}

export function WhatsAppSenderProfileView({ account, projectId, onBack, onAccountChanged }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [saving, setSaving] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [uploadingPic, setUploadingPic] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [disconnecting, setDisconnecting] = useState(false)
    const [localPicPreview, setLocalPicPreview] = useState<string | null>(null)

    const [form, setForm] = useState({
        about: account?.about ?? "",
        businessCategory: account?.business_category ?? "",
        businessDescription: account?.business_description ?? "",
        website: account?.website ?? "",
        address: account?.address ?? "",
    })

    function set(key: keyof typeof form, val: string) {
        setForm((f) => ({ ...f, [key]: val }))
    }

    async function handleSaveProfile() {
        if (!account) return
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            await updateWhatsAppAccountProfile(account.id, form)
            setSuccess("Profile updated successfully!")
            onAccountChanged()
        } catch (err: any) {
            setError(err?.response?.data?.error ?? "Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    async function handleSyncAccount() {
        if (!account) return
        setSyncing(true)
        setError(null)
        try {
            await syncWhatsAppAccount(account.id)
            setSuccess("Account synced with Meta!")
            onAccountChanged()
        } catch (err: any) {
            setError(err?.response?.data?.error ?? "Failed to sync")
        } finally {
            setSyncing(false)
        }
    }

    async function handleProfilePicUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !account) return

        // Show local preview immediately
        const url = URL.createObjectURL(file)
        setLocalPicPreview(url)

        setUploadingPic(true)
        setError(null)
        try {
            await uploadWhatsAppProfilePic(account.id, file)
            setSuccess("Profile photo uploaded to WhatsApp!")
            onAccountChanged()
        } catch (err: any) {
            setError(err?.response?.data?.error ?? "Failed to upload profile photo")
            setLocalPicPreview(null)
        } finally {
            setUploadingPic(false)
        }
    }

    async function handleDisconnect() {
        if (!account || !confirm("Disconnect this WhatsApp account? All campaigns will be preserved but you won't be able to send new ones.")) return
        setDisconnecting(true)
        try {
            await disconnectWhatsAppAccount(account.id)
            onAccountChanged()
            onBack()
        } catch (err: any) {
            setError(err?.response?.data?.error ?? "Failed to disconnect")
        } finally {
            setDisconnecting(false)
        }
    }

    if (!account) {
        return (
            <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2">
                    <button type="button" onClick={onBack} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition">
                        <ArrowLeft size={14} />
                    </button>
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">Campaigns / Sender Profile</span>
                </div>
                <ConnectAccountBanner projectId={projectId} onConnected={onAccountChanged} onOpenProfile={() => {}} />
            </div>
        )
    }

    const quality = qualityColor(account.quality_rating)
    const picSrc = localPicPreview ?? account.profile_pic_url ?? null
    const initials = account.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

    return (
        <div className="flex flex-col gap-5 pb-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
                <button type="button" onClick={onBack} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition">
                    <ArrowLeft size={14} />
                </button>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">Campaigns / WhatsApp Sender Profile</span>
            </div>

            <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                {/* ── Left: Profile Photo & Account Status ───────────────── */}
                <div className="flex flex-col gap-4">

                    {/* Profile Photo Card */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-[13px] font-semibold text-zinc-800">WhatsApp Profile Photo</h3>

                        {/* Preview */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-zinc-200 bg-zinc-100">
                                    {picSrc ? (
                                        <img src={picSrc} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[22px] font-bold text-zinc-400">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                {/* Simulated WhatsApp green ring */}
                                <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full flex items-center justify-center" style={{ background: "#25D366" }}>
                                    <Camera size={10} className="text-white" />
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-[13px] font-semibold text-zinc-900">{account.display_name}</p>
                                <p className="text-[11px] text-zinc-500">{account.display_phone}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPic}
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-[12.5px] font-medium text-zinc-700 hover:bg-zinc-50 transition disabled:opacity-50"
                            >
                                {uploadingPic ? (
                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
                                ) : (
                                    <Upload size={13} />
                                )}
                                {uploadingPic ? "Uploading…" : "Upload Photo"}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png"
                                className="hidden"
                                onChange={handleProfilePicUpload}
                            />
                        </div>

                        {/* Spec info */}
                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
                            <div className="flex items-start gap-2">
                                <Info size={12} className="mt-0.5 shrink-0 text-blue-500" />
                                <div className="text-[11px] text-blue-700">
                                    <p className="font-semibold mb-0.5">Image requirements</p>
                                    <p>Square (1:1), min 192×192px, recommended <strong>640×640px</strong>, JPEG or PNG</p>
                                    <p className="mt-1">This photo appears next to your business name in all recipient WhatsApp chats.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Status Card */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[13px] font-semibold text-zinc-800">Account Status</h3>
                            <button
                                type="button"
                                onClick={handleSyncAccount}
                                disabled={syncing}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-50 transition"
                            >
                                <RefreshCw size={11} className={syncing ? "animate-spin" : ""} />
                                Sync
                            </button>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <div>
                                <p className="text-[10.5px] font-medium text-zinc-400 mb-0.5">WABA ID</p>
                                <p className="text-[12px] font-mono text-zinc-700 break-all">{account.waba_id}</p>
                            </div>
                            <div>
                                <p className="text-[10.5px] font-medium text-zinc-400 mb-0.5">Phone Number ID</p>
                                <p className="text-[12px] font-mono text-zinc-700 break-all">{account.phone_number_id}</p>
                            </div>
                            <div>
                                <p className="text-[10.5px] font-medium text-zinc-400 mb-0.5">Quality Rating</p>
                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${quality.bg} ${quality.text} ${quality.border}`}>
                                    {quality.label}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10.5px] font-medium text-zinc-400 mb-0.5">Messaging Tier</p>
                                <p className="text-[12px] font-medium text-zinc-700">{tierLabel(account.messaging_limit)}</p>
                            </div>
                            <div>
                                <p className="text-[10.5px] font-medium text-zinc-400 mb-0.5">Official Business (Green Badge)</p>
                                {account.is_green_badge ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                        <ShieldCheck size={10} /> Verified
                                    </span>
                                ) : (
                                    <span className="text-[12px] text-zinc-400">Not yet verified</span>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 border-t border-zinc-100 pt-3">
                            <button
                                type="button"
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-500 hover:text-red-700 transition"
                            >
                                <Trash2 size={12} />
                                {disconnecting ? "Disconnecting…" : "Disconnect Account"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Right: Business Profile Form ─────────────────────────── */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-5 text-[15px] font-semibold text-zinc-900">Business Profile</h3>

                    {error && (
                        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[12.5px] text-red-600">{error}</div>
                    )}
                    {success && (
                        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-[12.5px] text-green-700">{success}</div>
                    )}

                    <div className="grid gap-4">
                        <div>
                            <label className="mb-1 block text-[11.5px] font-semibold text-zinc-600">About (WhatsApp bio, max 139 chars)</label>
                            <textarea
                                value={form.about}
                                onChange={(e) => set("about", e.target.value)}
                                maxLength={139}
                                rows={2}
                                placeholder="e.g. Your trusted partner for premium quality products"
                                className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] text-zinc-900 placeholder-zinc-400 focus:border-green-400 focus:outline-none transition"
                            />
                            <p className="mt-0.5 text-right text-[10px] text-zinc-400">{form.about.length}/139</p>
                        </div>

                        <div>
                            <label className="mb-1 block text-[11.5px] font-semibold text-zinc-600">Business Category</label>
                            <select
                                value={form.businessCategory}
                                onChange={(e) => set("businessCategory", e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] text-zinc-900 focus:border-green-400 focus:outline-none transition"
                            >
                                <option value="">Select a category…</option>
                                {BUSINESS_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-[11.5px] font-semibold text-zinc-600">Business Description</label>
                            <textarea
                                value={form.businessDescription}
                                onChange={(e) => set("businessDescription", e.target.value)}
                                rows={3}
                                placeholder="Describe your business, products, and services…"
                                className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] text-zinc-900 placeholder-zinc-400 focus:border-green-400 focus:outline-none transition"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 flex items-center gap-1 text-[11.5px] font-semibold text-zinc-600">
                                    <Globe size={11} /> Website
                                </label>
                                <input
                                    type="url"
                                    value={form.website}
                                    onChange={(e) => set("website", e.target.value)}
                                    placeholder="https://yoursite.com"
                                    className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] text-zinc-900 placeholder-zinc-400 focus:border-green-400 focus:outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="mb-1 flex items-center gap-1 text-[11.5px] font-semibold text-zinc-600">
                                    <MapPin size={11} /> Business Address
                                </label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) => set("address", e.target.value)}
                                    placeholder="e.g. MG Road, Bengaluru, KA 560001"
                                    className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] text-zinc-900 placeholder-zinc-400 focus:border-green-400 focus:outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5">
                        <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-[11.5px] text-zinc-500">
                            <span className="font-semibold">GST Note:</span> Meta charges 18% GST on WhatsApp API usage. If you have a{" "}
                            <span className="font-semibold text-zinc-700">GSTIN</span>, you can claim input tax credit on your GST returns.
                        </div>
                        <button
                            type="button"
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="ml-4 inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition disabled:opacity-50"
                            style={{ background: "#25D366" }}
                        >
                            <Save size={14} />
                            {saving ? "Saving…" : "Save Profile"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

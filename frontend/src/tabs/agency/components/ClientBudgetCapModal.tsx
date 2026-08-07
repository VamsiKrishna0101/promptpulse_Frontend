import React, { useState } from "react"
import { X, Coins, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import type { AgencyClient } from "./ClientPortfolioGrid"

type Props = {
    isOpen: boolean
    onClose: () => void
    client: AgencyClient | null
    onUpdated?: () => void
}

export const ClientBudgetCapModal: React.FC<Props> = ({
    isOpen,
    onClose,
    client,
    onUpdated,
}) => {
    if (!isOpen || !client) return null

    const [category, setCategory] = useState(client.category || "General")
    const [monthlyCap, setMonthlyCap] = useState<number>(client.monthly_credit_cap || 10000)
    const [role, setRole] = useState(client.role || "CLIENT_ADMIN")
    const [status, setStatus] = useState(client.status || "ACTIVE")
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")

    async function handleSave() {
        setSaving(true)
        setMessage("")
        try {
            // Update client link status if changed
            if (status !== client?.status) {
                await api.patch(`/agency/clients/${client?.client_user_id}`, { status })
            }

            // Update settings & monthly cap
            await api.patch(`/agency/clients/${client?.client_user_id}/settings`, {
                category,
                monthly_credit_cap: monthlyCap,
                role,
            })

            setMessage("Client settings updated successfully!")
            if (onUpdated) onUpdated()
            setTimeout(() => {
                onClose()
            }, 800)
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to update client")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3.5 top-3.5 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                    <X size={16} />
                </button>

                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        <Coins size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Client Settings & Credit Cap</h2>
                        <p className="text-xs text-slate-500 truncate max-w-[240px]">{client.client_email}</p>
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                        >
                            <option value="General">General Marketing</option>
                            <option value="E-Commerce">E-Commerce & Retail</option>
                            <option value="SaaS">SaaS & Software</option>
                            <option value="Healthcare">Healthcare & Biotech</option>
                            <option value="Finance">Financial Services</option>
                            <option value="Legal">Legal & Professional</option>
                            <option value="Hospitality">Travel & Hospitality</option>
                        </select>
                    </div>

                    <Input
                        label="Monthly Shared Credit Cap"
                        type="number"
                        value={monthlyCap}
                        onChange={(e) => setMonthlyCap(Number(e.target.value))}
                        placeholder="10000"
                    />
                    <p className="text-[10.5px] text-slate-400 -mt-1.5">
                        Allocates a monthly credit quota from your agency wallet for this client workspace.
                    </p>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Client Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                            >
                                <option value="CLIENT_ADMIN">Client Admin</option>
                                <option value="CLIENT_VIEWER">Client Viewer</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Link Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                        </div>
                    </div>

                    {message && (
                        <p className={`rounded-lg p-2 text-xs font-medium ${message.includes("successfully") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"}`}>
                            {message}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={() => void handleSave()} disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5">
                            {saving ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" /> Saving Changes…
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

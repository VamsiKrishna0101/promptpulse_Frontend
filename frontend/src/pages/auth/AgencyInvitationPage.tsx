import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export function AgencyInvitationPage() {
    const { token = "" } = useParams<{ token: string }>()
    const navigate = useNavigate()
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    async function accept() {
        setLoading(true)
        setError("")
        try {
            const res = await api.post<{
                success: boolean
                invitation: {
                    user_id: string
                    email: string
                    access_token?: string
                    refresh_token?: string
                    user?: any
                }
            }>("/agency/invitations/accept", { token, password: password || undefined })

            if (res.data.invitation?.access_token) {
                localStorage.setItem("promptpulse_access_token", res.data.invitation.access_token)
                if (res.data.invitation.refresh_token) {
                    localStorage.setItem("promptpulse_refresh_token", res.data.invitation.refresh_token)
                }
                if (res.data.invitation.user) {
                    localStorage.setItem("promptpulse_user", JSON.stringify(res.data.invitation.user))
                }
                // Redirect straight to the main workspace
                window.location.href = "/"
                return
            }
            setDone(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "This invitation could not be accepted")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 py-12">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_20px_60px_-34px_rgba(15,23,42,.3)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">PromptPulse invitation</p>
                <h1 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-zinc-950">Join the workspace</h1>
                {done ? (
                    <>
                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                            Your invitation is accepted. Sign in with your email to continue.
                        </p>
                        <Button className="mt-6 w-full" onClick={() => navigate("/login")}>
                            Go to login
                        </Button>
                    </>
                ) : (
                    <>
                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                            If you already have a PromptPulse account, accept this invitation and use your existing password. New users can set a password below.
                        </p>
                        <div className="mt-6">
                            <Input
                                label="New password (new users only)"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 8 characters"
                            />
                        </div>
                        {error && (
                            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                                {error}
                            </p>
                        )}
                        <Button className="mt-6 w-full" isLoading={loading} onClick={() => void accept()}>
                            Accept & Enter Workspace
                        </Button>
                        <p className="mt-5 text-center text-xs text-zinc-500">
                            <Link to="/login" className="font-semibold text-sky-700">
                                Already have an account?
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </main>
    )
}

export default AgencyInvitationPage

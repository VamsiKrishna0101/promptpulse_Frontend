import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from "lucide-react"
import { AuthShell } from "@/components/auth/AuthShell"
import { AuthTestimonialPanel } from "@/components/auth/AuthTestimonialPanel"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useToast } from "@/components/ui/Toast"
import { api } from "@/lib/api"

type Step = "email" | "reset"

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [step, setStep] = useState<Step>("email")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const navigate = useNavigate()

    const passwordIsValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)

    async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const normalizedEmail = email.trim().toLowerCase()
        if (!normalizedEmail) {
            toast({ title: "Email required", description: "Enter the email linked to your PromptPulse account.", type: "warning" })
            return
        }

        setIsSubmitting(true)
        try {
            await api.post("/auth/forgot-password/send-otp", { email: normalizedEmail })
            setEmail(normalizedEmail)
            setStep("reset")
            toast({ title: "OTP sent", description: "If that account exists, a reset code has been sent.", type: "success" })
        } catch (error: any) {
            toast({ title: "Could not send OTP", description: getAuthErrorMessage(error, "Please try again in a moment."), type: "error" })
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (otp.trim().length !== 6) {
            toast({ title: "Enter the OTP", description: "Use the 6-digit reset code from your email.", type: "warning" })
            return
        }
        if (!passwordIsValid) {
            toast({ title: "Stronger password needed", description: "Use at least 8 characters, one uppercase letter, and one number.", type: "warning" })
            return
        }

        setIsSubmitting(true)
        try {
            await api.post("/auth/forgot-password/reset", {
                email: email.trim().toLowerCase(),
                otp: otp.trim(),
                password,
            })
            toast({ title: "Password updated", description: "You can now login with your new password.", type: "success" })
            navigate("/login", { replace: true })
        } catch (error: any) {
            toast({ title: "Reset failed", description: getAuthErrorMessage(error, "Check the latest OTP and try again."), type: "error" })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthShell
            title="Reset password"
            subtitle={step === "email" ? "We will send a reset code to your verified email." : "Enter the OTP and choose a new password."}
            footer={
                <p className="text-sm text-ink-500">
                    Remembered it?{" "}
                    <Link to="/login" className="font-semibold text-ink-900 underline underline-offset-2 hover:text-black">
                        Login
                    </Link>
                </p>
            }
            proof={
                <AuthTestimonialPanel
                    eyebrow="Account security"
                    headline="Recover access safely"
                    description="Password reset uses your verified email and a short-lived OTP before any credential change is allowed."
                    trackedEngines={[
                        { name: "Email OTP", slug: "gmail" },
                        { name: "Verified user", slug: "chatgpt" },
                        { name: "Secure reset", slug: "copilot" },
                    ]}
                    features={[
                        { title: "Verified email only", description: "Reset codes are only sent for verified PromptPulse accounts.", icon: Mail },
                        { title: "Short-lived OTP", description: "Codes expire quickly and are cleared after reset.", icon: ShieldCheck },
                        { title: "Fresh password hash", description: "Your new password is stored securely after reset.", icon: KeyRound },
                    ]}
                    footNote="Use the latest OTP if you request multiple reset codes."
                />
            }
        >
            {step === "email" ? (
                <form className="flex flex-col gap-4" onSubmit={handleSendOtp}>
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@company.com"
                        autoComplete="email"
                        required
                    />
                    <Button type="submit" fullWidth isLoading={isSubmitting}>
                        Send reset OTP
                    </Button>
                </form>
            ) : (
                <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
                    <Input
                        label="Reset code"
                        type="text"
                        value={otp}
                        onChange={(event) => setOtp(event.target.value)}
                        placeholder="Enter OTP"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        hint={`Sent to ${email}.`}
                        required
                    />
                    <div className="relative">
                        <Input
                            label="New password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Create new password"
                            autoComplete="new-password"
                            hint="At least 8 characters, one uppercase letter, and one number."
                            className="pr-11"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(value => !value)}
                            className="absolute bottom-[30px] right-3 flex h-6 w-6 items-center justify-center rounded-md text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                    </div>
                    <Button type="submit" fullWidth isLoading={isSubmitting}>
                        Update password
                    </Button>
                    <Button type="button" variant="ghost" fullWidth onClick={() => setStep("email")} disabled={isSubmitting}>
                        Use another email
                    </Button>
                </form>
            )}
        </AuthShell>
    )
}

function getAuthErrorMessage(error: any, fallback: string) {
    const raw = error?.response?.data?.message ?? error?.response?.data?.error ?? error?.message
    if (!raw) return fallback
    const message = String(raw)

    if (message.includes("Brevo") || message.includes("401") || message.includes("unauthorized") || message.includes("unrecognised IP")) {
        return "We could not send the reset code yet. While testing locally, use the dev OTP shown in the backend terminal."
    }
    if (message.includes("Invalid or expired OTP")) {
        return "That code is invalid or expired. Request a fresh OTP and try again."
    }
    if (message.includes("Password must")) {
        return "Use at least 8 characters, one uppercase letter, and one number."
    }

    return message
}

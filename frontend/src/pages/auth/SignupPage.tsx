import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/Toast"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AuthShell } from "@/components/auth/AuthShell"
import { AuthTestimonialPanel } from "@/components/auth/AuthTestimonialPanel"
import { Search, Activity, Target } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function SignupPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [otp, setOtp] = useState("")
    const [step, setStep] = useState<"email" | "otp">("email")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const { register, verifyEmailOtp } = useAuth()
    const navigate = useNavigate()

    const isWorkEmail = useMemo(() => {
        const normalized = email.trim().toLowerCase()
        return normalized.includes("@") && !/(gmail|yahoo|outlook|hotmail|icloud)\./.test(normalized)
    }, [email])

    const passwordIsValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)

    async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!isWorkEmail) {
            toast({
                title: "Use your work email",
                description: "We will send the OTP to your company inbox.",
                type: "warning",
            })
            return
        }

        if (!passwordIsValid) {
            toast({
                title: "Stronger password needed",
                description: "Use at least 8 characters, one uppercase letter, and one number.",
                type: "warning",
            })
            return
        }

        setIsSubmitting(true)
        try {
            await register({
                email: email.trim().toLowerCase(),
                password,
                account_type: "SINGLE",
            })
            setStep("otp")
            toast({
                title: "OTP sent",
                description: `Check ${email.trim()} for your verification code.`,
                type: "success",
            })
        } catch (error: any) {
            toast({
                title: "Could not send OTP",
                description: getSignupErrorMessage(error, "Please try again in a moment."),
                type: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (otp.trim().length !== 6) {
            toast({
                title: "Enter the OTP",
                description: "Use the 6-digit code we sent to your work email.",
                type: "warning",
            })
            return
        }

        setIsSubmitting(true)
        try {
            await verifyEmailOtp(email.trim().toLowerCase(), otp.trim())
            toast({
                title: "Email verified",
                description: "Let's create your first brand workspace.",
                type: "success",
            })
            navigate("/onboarding", { replace: true })
        } catch (error: any) {
            toast({
                title: "Verification failed",
                description: getSignupErrorMessage(error, "Check the code and try again."),
                type: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthShell
            title="Sign up"
            subtitle={step === "email" ? "Create your workspace with a work email." : "Verify your email to continue."}
            footer={
                <p className="text-sm text-ink-500">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-ink-900 underline underline-offset-2 hover:text-black">
                        Login
                    </Link>
                </p>
            }
            proof={
                <AuthTestimonialPanel
                    eyebrow="Platform Features"
                    headline="Master your AI visibility"
                    description="Monitor, analyze, and optimize your brand's presence across the leading AI search engines and language models."
                    trackedEngines={[
                        { name: "ChatGPT", slug: "chatgpt" },
                        { name: "Perplexity", slug: "perplexity" },
                        { name: "Gemini", slug: "gemini" },
                        { name: "Google AI Mode", slug: "google_ai_mode" },
                        { name: "Copilot", slug: "copilot" },
                    ]}
                    features={[
                        {
                            title: "Track AI search visibility",
                            description: "Monitor your brand's presence across major AI search engines in real-time.",
                            icon: Search
                        },
                        {
                            title: "Analyze brand sentiment",
                            description: "Understand how AI models perceive and talk about your products.",
                            icon: Activity
                        },
                        {
                            title: "Identify opportunities",
                            description: "Find gaps in AI knowledge to optimize your content strategy effectively.",
                            icon: Target
                        }
                    ]}
                    footNote="Source-backed visibility tracking across the AI engines buyers use."
                />
            }
        >
            {step === "email" ? (
                <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@company.com"
                        autoComplete="email"
                        hint="Please use your work email address."
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Create password"
                        autoComplete="new-password"
                        hint="At least 8 characters, one uppercase letter, and one number."
                        required
                    />

                    <Button type="submit" fullWidth isLoading={isSubmitting}>
                        Send OTP
                    </Button>
                </form>
            ) : (
                <form className="flex flex-col gap-4" onSubmit={handleOtpSubmit}>
                    <Input
                        label="Verification code"
                        type="text"
                        value={otp}
                        onChange={(event) => setOtp(event.target.value)}
                        placeholder="Enter OTP"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        hint={`Sent to ${email.trim()}.`}
                        required
                    />

                    <Button type="submit" fullWidth isLoading={isSubmitting}>
                        Verify email
                    </Button>
                    <Button type="button" variant="ghost" fullWidth onClick={() => setStep("email")} disabled={isSubmitting}>
                        Change email
                    </Button>
                </form>
            )}
        </AuthShell>
    )
}

function getSignupErrorMessage(error: any, fallback: string) {
    const raw = error?.response?.data?.message ?? error?.response?.data?.error ?? error?.message
    if (!raw) return fallback

    const message = String(raw)
    if (message.includes("Brevo") || message.includes("401") || message.includes("unauthorized") || message.includes("unrecognised IP")) {
        return "We could not send your verification code yet. Please try again, or use the dev OTP shown in the backend terminal while testing locally."
    }
    if (message.includes("already exists")) {
        return "An account already exists for this email. Log in, or use another work email."
    }
    if (message.includes("work/business")) {
        return "Please use your company email address to create a workspace."
    }
    if (message.includes("Invalid OTP")) {
        return "That code does not match. Check the latest OTP and try again."
    }
    if (message.includes("expired")) {
        return "That code expired. Go back and request a fresh OTP."
    }

    return message
}

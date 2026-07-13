import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import { useToast } from "@/components/ui/Toast"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AuthShell } from "@/components/auth/AuthShell"
import { AuthTestimonialPanel } from "@/components/auth/AuthTestimonialPanel"
import { Search, Activity, Target } from "lucide-react"

export function SignupPage() {
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [step, setStep] = useState<"email" | "otp">("email")
    const { toast } = useToast()

    const isWorkEmail = useMemo(() => {
        const normalized = email.trim().toLowerCase()
        return normalized.includes("@") && !/(gmail|yahoo|outlook|hotmail|icloud)\./.test(normalized)
    }, [email])

    function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!isWorkEmail) {
            toast({
                title: "Use your work email",
                description: "We will send the OTP to your company inbox.",
                type: "warning",
            })
            return
        }

        setStep("otp")
        toast({
            title: "OTP sent",
            description: `Check ${email.trim()} for your verification code.`,
            type: "success",
        })
    }

    function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (otp.trim().length < 4) {
            toast({
                title: "Enter the OTP",
                description: "Use the code we sent to your work email.",
                type: "warning",
            })
            return
        }

        toast({
            title: "Email verified",
            description: "Onboarding comes next.",
            type: "success",
        })
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
                    footNote="Trusted by leading marketing teams for accurate AI visibility tracking."
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

                    <Button type="submit" fullWidth>
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

                    <Button type="submit" fullWidth>
                        Verify email
                    </Button>
                    <Button type="button" variant="ghost" fullWidth onClick={() => setStep("email")}>
                        Change email
                    </Button>
                </form>
            )}
        </AuthShell>
    )
}

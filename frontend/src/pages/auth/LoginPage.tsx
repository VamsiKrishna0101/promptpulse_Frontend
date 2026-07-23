import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useToast } from "@/components/ui/Toast"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AuthShell } from "@/components/auth/AuthShell"
import { AuthTestimonialPanel } from "@/components/auth/AuthTestimonialPanel"
import { Search, Activity, Target, Eye, EyeOff } from "lucide-react"

export function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const { login } = useAuth()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    useEffect(() => {
        if (searchParams.get("session") !== "expired") return
        toast({
            title: "Session expired",
            description: "Please login again to continue.",
            type: "warning",
        })
        setSearchParams({}, { replace: true })
    }, [searchParams, setSearchParams, toast])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!email.trim() || !password.trim()) {
            toast({
                title: "Missing details",
                description: "Enter your email and password to login.",
                type: "warning",
            })
            return
        }

        setIsSubmitting(true)
        try {
            await login(email.trim(), password)
            toast({
                title: "Logged in",
                description: "Opening your AI visibility dashboard.",
                type: "success",
            })
            navigate("/dashboard")
        } catch (error) {
            toast({
                title: "Login failed",
                description: error instanceof Error ? error.message : "Check your email and password.",
                type: "warning",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthShell
            title="Login"
            subtitle="Use your email and password to access PromptPulse."
            footer={
                <p className="text-sm text-ink-500">
                    New to PromptPulse?{" "}
                    <Link to="/signup" className="font-semibold text-ink-900 underline underline-offset-2 hover:text-black">
                        Sign up
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
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                />

                <div className="flex flex-col gap-2">
                    <div className="relative">
                        <Input
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter password"
                            autoComplete="current-password"
                            className="pr-11"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(value => !value)}
                            className="absolute bottom-[10px] right-3 flex h-6 w-6 items-center justify-center rounded-md text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                    </div>
                    <Link to="/forgot-password" className="self-end text-[12.5px] font-semibold text-ink-700 underline underline-offset-2 hover:text-black">
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" fullWidth isLoading={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                </Button>
            </form>
        </AuthShell>
    )
}

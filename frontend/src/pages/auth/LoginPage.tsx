import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/Toast"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AuthShell } from "@/components/auth/AuthShell"
import { AuthTestimonialPanel } from "@/components/auth/AuthTestimonialPanel"
import { Search, Activity, Target } from "lucide-react"

export function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const { login } = useAuth()
    const navigate = useNavigate()

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
            subtitle="Use your email and password to access RefractOne."
            footer={
                <p className="text-sm text-ink-500">
                    New to RefractOne?{" "}
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

                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                />

                <Button type="submit" fullWidth isLoading={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                </Button>
            </form>
        </AuthShell>
    )
}

import { Link } from "react-router-dom"
import { HelpCircle, LifeBuoy, MessageSquare, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { ResourceCard, ResourceShell, SectionTitle } from "./ResourceShared"

const faqs = [
  ["What does PromptPulse track?", "Brand mentions, visibility, answer position, sentiment, competitors, cited sources, and improvement opportunities across AI engines."],
  ["Which models are included?", "All 5 AI surfaces are included for every account — ChatGPT, Gemini, Perplexity, Google AI Mode, and Copilot. There are no per-plan model restrictions."],
  ["When does Sara work?", "Sara is most useful after the project has enough evidence, usually at least seven days of prompt and answer data."],
  ["Do I need technical setup?", "No heavy setup is needed for visibility tracking. Add your brand, competitors, prompts, and sources, then start collecting evidence."],
]


export function PublicHelpPage() {
  const { isAuthenticated } = useAuth()

  return (
    <ResourceShell
      eyebrow="Help Center"
      title={<>Get unstuck fast, before or after signup.</>}
      description="Find quick answers about AI visibility, setup, billing, Sara, exports, and the PromptPulse workflow."
    >
      <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <ResourceCard className="p-6">
          <SectionTitle eyebrow="Support" title="Choose the right support path" description="Visitors get public guidance. Logged-in users can open the in-app help center and submit tickets." />
          <div className="space-y-3">
            <Link to={isAuthenticated ? "/help" : "/login"} className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white hover:shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white"><LifeBuoy size={18} /></div>
              <div>
                <p className="text-[15px] font-black text-zinc-950">Open in-app Help Center</p>
                <p className="mt-1 text-[12px] font-medium text-zinc-500">{isAuthenticated ? "View tickets and write to support." : "Login first to access tickets."}</p>
              </div>
            </Link>
            <Link to="/product/sara" className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:bg-zinc-50">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white"><MessageSquare size={18} /></div>
              <div>
                <p className="text-[15px] font-black text-zinc-950">Learn about Sara</p>
                <p className="mt-1 text-[12px] font-medium text-zinc-500">See how the assistant answers from your project evidence.</p>
              </div>
            </Link>
            <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white"><ShieldCheck size={18} /></div>
              <div>
                <p className="text-[15px] font-black text-zinc-950">Trial and billing</p>
                <p className="mt-1 text-[12px] font-medium text-zinc-600">Start with a 7-day trial and upgrade when the data is useful.</p>
              </div>
            </div>
          </div>
        </ResourceCard>

        <ResourceCard className="p-6">
          <SectionTitle eyebrow="FAQs" title="Common questions" description="Short answers for users evaluating the product." />
          <div className="space-y-3">
            {faqs.map(([question, answer]) => (
              <div key={question} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle size={17} className="mt-0.5 shrink-0 text-zinc-400" />
                  <div>
                    <p className="text-[14px] font-black text-zinc-950">{question}</p>
                    <p className="mt-2 text-[13px] font-medium leading-6 text-zinc-500">{answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ResourceCard>
      </div>
    </ResourceShell>
  )
}

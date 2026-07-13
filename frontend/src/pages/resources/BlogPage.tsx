import { Link } from "react-router-dom"
import { ArrowRight, BookOpen, Search, Sparkles } from "lucide-react"
import { ResourceCard, ResourceShell, SectionTitle } from "./ResourceShared"

const posts = [
  {
    title: "What AI visibility means for B2B SaaS teams",
    tag: "Foundations",
    read: "7 min",
    summary: "How ChatGPT, Gemini, and Perplexity recommendations are changing category discovery.",
  },
  {
    title: "Why competitors appear in AI answers before your brand",
    tag: "Competitors",
    read: "6 min",
    summary: "The common source, sentiment, and positioning gaps behind competitor recommendations.",
  },
  {
    title: "How to build citation-ready pages for AI search",
    tag: "GEO",
    read: "9 min",
    summary: "A practical structure for content that answers prompts directly and earns references.",
  },
  {
    title: "Which sources shape AI answers in your market?",
    tag: "Sources",
    read: "5 min",
    summary: "How review sites, communities, competitor pages, and editorial content influence model responses.",
  },
]

export function BlogPage() {
  return (
    <ResourceShell
      eyebrow="RefractOne Blog"
      title={<>Practical playbooks for winning in AI search.</>}
      description="Short, useful guides for founders and marketers tracking how AI engines describe their brand, competitors, sources, and category."
    >
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <ResourceCard className="overflow-hidden">
          <div className="border-b border-zinc-100 p-6">
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">Featured</span>
            <h2 className="mt-4 max-w-2xl text-[36px] font-black leading-[1.03] tracking-[-0.055em] text-zinc-950">
              How to know if ChatGPT recommends your competitors before you.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] font-medium leading-7 text-zinc-500">
              A founder-friendly breakdown of visibility, position, sentiment, source evidence, and the fixes that actually move AI-answer share.
            </p>
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-3">
            {["Visibility", "Sources", "Opportunities"].map((item) => (
              <div key={item} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <Sparkles size={16} className="text-blue-600" />
                <p className="mt-3 text-[14px] font-black text-zinc-950">{item}</p>
                <p className="mt-1 text-[12px] font-medium text-zinc-500">What to monitor and why it matters.</p>
              </div>
            ))}
          </div>
        </ResourceCard>

        <ResourceCard className="p-6">
          <SectionTitle eyebrow="Latest" title="Articles worth shipping first" description="These can become your initial content engine and help explain the category." />
          <div className="space-y-3">
            {posts.map((post) => (
              <Link key={post.title} to="/blog" className="group block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">{post.tag}</span>
                  <span className="text-[12px] font-bold text-zinc-400">{post.read}</span>
                </div>
                <h3 className="mt-3 text-[15px] font-black leading-snug text-zinc-950">{post.title}</h3>
                <p className="mt-2 text-[13px] font-medium leading-6 text-zinc-500">{post.summary}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-black text-zinc-950">Read guide <ArrowRight size={13} className="transition group-hover:translate-x-0.5" /></span>
              </Link>
            ))}
          </div>
        </ResourceCard>
      </div>

      <ResourceCard className="mt-5 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white"><BookOpen size={18} /></div>
            <h2 className="mt-4 text-[28px] font-black tracking-[-0.04em] text-zinc-950">Use the blog as your category education engine.</h2>
            <p className="mt-2 max-w-2xl text-[14px] font-medium leading-6 text-zinc-500">Publish around buyer prompts, competitor comparisons, source intelligence, and GEO workflows.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <Search size={17} className="text-zinc-500" />
            <p className="mt-2 text-[13px] font-black text-zinc-950">Recommended topics</p>
            <p className="mt-1 text-[12px] font-medium text-zinc-500">AI visibility, ChatGPT rankings, sources, GEO articles</p>
          </div>
        </div>
      </ResourceCard>
    </ResourceShell>
  )
}

import { ArrowRight, Bot, FileText, Globe2, LineChart, Search, Trophy } from "lucide-react"

const workflow = [
    {
        title: "Track AI answers",
        desc: "Run your commercial prompts across ChatGPT, Gemini, and Perplexity.",
        Icon: Search,
    },
    {
        title: "Compare competitors",
        desc: "See who gets recommended, who outranks you, and where visibility moved.",
        Icon: Trophy,
    },
    {
        title: "Find source gaps",
        desc: "Identify the Reddit, G2, LinkedIn, blog, and category pages shaping AI answers.",
        Icon: Globe2,
    },
    {
        title: "Prioritize fixes",
        desc: "Turn ranking, sentiment, and citation gaps into a focused opportunity list.",
        Icon: LineChart,
    },
    {
        title: "Ask Sara",
        desc: "Get analyst-style answers on what changed, why it changed, and what to do next.",
        Icon: Bot,
    },
    {
        title: "Export reports",
        desc: "Share clean PDF and CSV reports with founders, marketers, clients, or investors.",
        Icon: FileText,
    },
]

const proof = [
    { label: "Visibility", value: "60%", note: "brand share across AI answers" },
    { label: "Position", value: "#4.3", note: "average rank when mentioned" },
    { label: "Sentiment", value: "69", note: "weighted response sentiment" },
]

export function ProductStory() {
    return (
        <section className="relative overflow-hidden border-y border-zinc-200 bg-[#fafafa] px-6 py-24">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(24,24,27,0.035) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(24,24,27,0.035) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                }}
            />

            <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] font-semibold text-zinc-500 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                        Product workflow
                    </div>
                    <h2 className="mt-5 max-w-xl text-[34px] font-black leading-[1.08] tracking-[-0.055em] text-zinc-950 md:text-[48px]">
                        From AI answer chaos to a clear growth plan.
                    </h2>
                    <p className="mt-5 max-w-lg text-[15px] leading-7 text-zinc-600">
                        PromptPulse is not only a chart dashboard. It shows what models say, why competitors are winning, which sources influence answers, and what action Sara recommends next.
                    </p>

                    <div className="mt-7 grid max-w-lg grid-cols-3 gap-3">
                        {proof.map((item) => (
                            <div key={item.label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)]">
                                <p className="text-[10.5px] font-black uppercase tracking-[0.14em] text-zinc-400">{item.label}</p>
                                <p className="mt-2 text-[25px] font-black tracking-[-0.04em] text-zinc-950">{item.value}</p>
                                <p className="mt-1 text-[11px] leading-4 text-zinc-500">{item.note}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {workflow.map(({ title, desc, Icon }, index) => (
                        <div
                            key={title}
                            className="group rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.55)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_22px_55px_-34px_rgba(15,23,42,0.65)]"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                                    <Icon size={17} />
                                </div>
                                <span className="text-[11px] font-black text-zinc-300">0{index + 1}</span>
                            </div>
                            <h3 className="mt-4 text-[15px] font-black tracking-[-0.02em] text-zinc-950">{title}</h3>
                            <p className="mt-2 text-[13px] leading-6 text-zinc-500">{desc}</p>
                            <div className="mt-4 flex items-center gap-1 text-[12px] font-bold text-zinc-400 opacity-0 transition group-hover:opacity-100">
                                Part of the workflow
                                <ArrowRight size={12} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

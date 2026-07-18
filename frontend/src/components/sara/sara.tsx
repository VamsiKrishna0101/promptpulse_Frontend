import { useEffect, useMemo, useRef, useState } from "react"
import { Search, TrendingDown, Globe, MessageSquare, ListChecks, History } from "lucide-react"
import saraAvatar from "@/assets/sara-avatar.png"

const suggestedPrompts = [
    "Why did our visibility drop this week?",
    "Which competitor is gaining on us?",
    "What sources should we target next?",
    "What should we fix first?",
]

const conversation = [
    {
        user: "Why did our visibility drop this week?",
        answer:
            "Visibility fell 12% after ChatGPT and Perplexity stopped citing two sources that used to mention Northstar — G2 and a Reddit comparison thread. Refresh those pages, strengthen the comparison section, and get one third-party benchmark published this month.",
        tag: "Root cause found",
        confidence: "High confidence · 41 prompt runs, 3 models",
    },
    {
        user: "Which competitor is gaining on us?",
        answer:
            "Peec AI picked up 6 of the 9 prompts you lost this week, mostly on pricing and integration questions. It's cited more often on G2 and two dev-community threads you don't currently have a presence on.",
        tag: "Competitor gap",
        confidence: "High confidence · 18 shared prompts",
    },
    {
        user: "Do we have enough sentiment data for the India segment?",
        answer:
            "You have enough data for an initial read, but only 3 days of India-tagged runs. I can explain the current signal now and will become more confident as ChatGPT, Gemini, and other engines add more daily runs.",
        tag: "Data gap flagged",
        confidence: "Medium confidence - 3 days tracked",
    },
]

const capabilities = [
    { title: "Visibility diagnosis", desc: "Explains why a score moved, citing the exact prompts and sources behind it.", Icon: Search },
    { title: "Competitor gaps", desc: "Shows which brands are winning specific prompts, and why they're winning them.", Icon: TrendingDown },
    { title: "Source strategy", desc: "Ranks which domains AI models trust, so you know where to earn a citation.", Icon: Globe },
    { title: "Sentiment & framing", desc: "Reads how models describe you, and what's missing from the framing.", Icon: MessageSquare },
    { title: "Fix priorities", desc: "Turns findings into a ranked list of next actions, not a wall of stats.", Icon: ListChecks },
    { title: "Saved threads", desc: "Every analysis is saved, so you can reopen a thread instead of re-asking.", Icon: History },
]

const savedThreads = [
    { title: "Why Perplexity dropped us", meta: "2 days ago" },
    { title: "Peec AI competitor gap", meta: "5 days ago" },
    { title: "India segment: data gaps", meta: "6 days ago" },
]



function CheckIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}

function ArrowIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </svg>
    )
}

function HistoryIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
            <path d="M12 7v5l3 3" />
        </svg>
    )
}

function ExpandIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
        </svg>
    )
}

function ChatPanel() {
    const [step, setStep] = useState("prompts") // prompts -> answering -> done -> (next round)
    const [turn, setTurn] = useState(0)
    const [chars, setChars] = useState(0)
    const [showHistory, setShowHistory] = useState(false)
    const active = conversation[turn]
    const timers = useRef<number[]>([])

    const clearTimers = () => {
        timers.current.forEach((t) => window.clearTimeout(t))
        timers.current = []
    }

    useEffect(() => {
        clearTimers()
        if (step === "prompts") {
            timers.current.push(window.setTimeout(() => setStep("answering"), 2200))
        }
        return clearTimers
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, turn])

    useEffect(() => {
        if (step !== "answering") return
        setChars(0)
        return clearTimers
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, turn])

    useEffect(() => {
        if (step !== "answering") return
        if (chars < active.answer.length) {
            const t = window.setTimeout(() => setChars((c) => Math.min(c + 3, active.answer.length)), 14)
            timers.current.push(t)
        } else {
            const t = window.setTimeout(() => {
                setTurn((c) => (c + 1) % conversation.length)
                setStep("prompts")
            }, 4200)
            timers.current.push(t)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chars, step])

    const visibleAnswer = useMemo(() => active.answer.slice(0, chars), [active.answer, chars])
    const isTyping = step === "answering" && chars < active.answer.length
    const hasAsked = step !== "prompts"

    return (
        <div className="sara-chat">
            <div className="sara-chat-top">
                <div className="sara-chat-title">
                    <span className="sara-avatar">
                        <img src={saraAvatar} alt="Sara" className="h-full w-full object-cover" />
                    </span>
                    <div>
                        Sara
                        <em>AI strategy assistant</em>
                    </div>
                </div>
                <div className="sara-chat-actions">
                    <button
                        type="button"
                        className={`sara-icon-btn ${showHistory ? "is-active" : ""}`}
                        onClick={() => setShowHistory((v) => !v)}
                        aria-label="Saved conversations"
                    >
                        <HistoryIcon />
                    </button>
                    <button type="button" className="sara-icon-btn" aria-label="Expand">
                        <ExpandIcon />
                    </button>
                </div>
            </div>

            {showHistory ? (
                <div className="sara-history">
                    <span className="sara-history-label">Saved conversations</span>
                    {savedThreads.map((t) => (
                        <button type="button" key={t.title} className="sara-history-row">
                            <span>{t.title}</span>
                            <em>{t.meta}</em>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="sara-chat-body">
                    <div className={`sara-prompts ${hasAsked ? "is-hidden" : ""}`}>
                        <span className="sara-prompts-label">Ask about this project</span>
                        {suggestedPrompts.map((p, i) => (
                            <button type="button" className={`sara-prompt-chip ${i === turn ? "is-picked" : ""}`} key={p}>
                                {p}
                            </button>
                        ))}
                    </div>

                    <div className={`sara-thread ${hasAsked ? "is-visible" : ""}`}>
                        <div className="sara-user-bubble">{active.user}</div>

                        <div className="sara-answer-row">
                            <span className="sara-answer-avatar">
                                <img src={saraAvatar} alt="Sara" className="h-full w-full object-cover" />
                            </span>
                            <div className="sara-answer">
                                <p>
                                    {visibleAnswer}
                                    {isTyping && <span className="sara-cursor" />}
                                </p>
                                {!isTyping && (
                                    <div className="sara-meta-row">
                                        <span className="sara-tag">{active.tag}</span>
                                        <span className="sara-confidence">{active.confidence}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="sara-input">
                        Ask Sara about this project
                        <span>Enter</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export function SaraSection() {
    return (
        <section className="sara-section">
            <div className="sara-shell">
                <div className="sara-heading">
                    <div className="sara-pill">
                        <span />
                        Meet Sara
                    </div>
                    <h2>
                        Your AI brand strategist, reading data <em>only you</em> have.
                    </h2>
                    <p>
                        Sara is a RAG assistant built on your project's own prompts, AI answers, sources, competitors,
                        and sentiment — not a generic chatbot bolted onto a dashboard. Ask it what moved, why, and what
                        to do next.
                    </p>
                </div>

                <div className="sara-layout">
                    <div className="sara-left">
                        <div className="sara-proof">
                            {[
                                "Scoped to your project's data only",
                                "Waits for 7+ days before it calls a trend",
                                "Says what's missing instead of guessing",
                            ].map((item) => (
                                <span key={item}>
                                    <i><CheckIcon /></i>
                                    {item}
                                </span>
                            ))}
                        </div>

                        <div className="sara-card-grid">
                            {capabilities.map(({ title, desc, Icon }) => (
                                <div className="sara-card" key={title}>
                                    <div className="sara-card-icon">
                                        <Icon size={16} strokeWidth={2.25} />
                                    </div>
                                    <h3>{title}</h3>
                                    <p>{desc}</p>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="sara-cta">
                            Ask Sara about your brand
                            <ArrowIcon />
                        </button>
                    </div>

                    <div className="sara-right">
                        <ChatPanel />
                        <div className="sara-launcher" aria-hidden="true">
                            <img src={saraAvatar} alt="Sara" className="h-full w-full object-cover rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .sara-section {
                    position: relative;
                    padding: 88px 24px 104px;
                }
                .sara-shell {
                    position: relative;
                    max-width: 1120px;
                    margin: 0 auto;
                }
                .sara-heading {
                    max-width: 680px;
                    margin-bottom: 44px;
                }
                .sara-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    height: 28px;
                    padding: 0 12px;
                    border: 1px solid #e4e4e7;
                    border-radius: 999px;
                    background: #fff;
                    color: #52525b;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 20px;
                }
                .sara-pill span {
                    width: 6px;
                    height: 6px;
                    border-radius: 999px;
                    background: #18181b;
                    animation: saraPulse 2.2s ease-in-out infinite;
                }
                .sara-heading h2 {
                    margin: 0;
                    max-width: 640px;
                    color: #09090b;
                    font-size: 42px;
                    line-height: 1.1;
                    letter-spacing: -0.04em;
                    font-weight: 800;
                }
                .sara-heading h2 em {
                    font-style: normal;
                    text-decoration: underline;
                    text-decoration-color: #d4d4d8;
                    text-decoration-thickness: 3px;
                    text-underline-offset: 6px;
                }
                .sara-heading p {
                    margin: 18px 0 0;
                    max-width: 580px;
                    color: #71717a;
                    font-size: 15.5px;
                    line-height: 1.72;
                }
                .sara-layout {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 420px;
                    gap: 28px;
                    align-items: start;
                }
                .sara-proof {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px 18px;
                    margin-bottom: 20px;
                }
                .sara-proof span {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #52525b;
                    font-size: 12.5px;
                    font-weight: 600;
                }
                .sara-proof i {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #f4f4f5;
                    color: #18181b;
                    flex-shrink: 0;
                }
                .sara-card-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                    margin-bottom: 22px;
                }
                .sara-card {
                    background: #fafafa;
                    border: 1px solid #e4e4e7;
                    border-radius: 16px;
                    padding: 18px;
                    box-shadow: none;
                    transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
                }
                .sara-card:hover {
                    transform: translateY(-3px);
                    border-color: #d4d4d8;
                    background: #fff;
                    box-shadow: 0 16px 32px -20px rgba(15,23,42,0.25);
                }
                .sara-card-icon {
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 9px;
                    background: #18181b;
                    color: #fff;
                    margin-bottom: 13px;
                }
                .sara-card h3 {
                    margin: 0 0 6px;
                    color: #18181b;
                    font-size: 13.5px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                }
                .sara-card p {
                    margin: 0;
                    color: #71717a;
                    font-size: 12.5px;
                    line-height: 1.6;
                }
                .sara-cta {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    border: 1px solid rgba(15, 23, 42, 0.9);
                    border-radius: 10px;
                    background: linear-gradient(180deg, #18181b, #09090b);
                    color: #fff;
                    padding: 12px 18px;
                    font-size: 13.5px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 8px 20px -8px rgba(15, 23, 42, 0.6), inset 0 1px 1px rgba(255,255,255,0.15);
                    transition: transform 0.18s ease, box-shadow 0.18s ease;
                }
                .sara-cta:hover {
                    box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.7), inset 0 1px 1px rgba(255,255,255,0.2);
                    transform: translateY(-1px);
                }
                .sara-right {
                    position: sticky;
                    top: 92px;
                }
                .sara-chat {
                    position: relative;
                    overflow: hidden;
                    border-radius: 24px;
                    color-scheme: light;
                    background:
                        linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.94)),
                        radial-gradient(circle at 16% 0%, rgba(37, 99, 235, 0.14), transparent 18rem),
                        radial-gradient(circle at 88% 10%, rgba(16, 185, 129, 0.10), transparent 18rem);
                    border: 1px solid rgba(203, 213, 225, 0.9);
                    box-shadow: 0 34px 90px -32px rgba(15, 23, 42, 0.62), inset 0 1px 0 rgba(255,255,255,0.8);
                }
                .sara-chat-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 58px;
                    padding: 0 16px;
                    background:
                        linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.96)),
                        radial-gradient(circle at 18% 0%, rgba(96, 165, 250, 0.38), transparent 13rem);
                    color: #f8fafc;
                    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
                }
                .sara-chat-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #F8FAFC;
                    font-size: 13.5px;
                    font-weight: 700;
                }
                .sara-chat-title em {
                    display: block;
                    color: #94A3B8;
                    font-style: normal;
                    font-size: 11px;
                    font-weight: 500;
                }
                .sara-avatar {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: #fff;
                    box-shadow: 0 2px 6px -2px rgba(15,23,42,0.3);
                    flex-shrink: 0;
                    overflow: hidden;
                }
                .sara-chat-actions {
                    display: flex;
                    gap: 6px;
                }
                .sara-icon-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.03);
                    color: #94A3B8;
                    cursor: pointer;
                    transition: all 0.16s ease;
                }
                .sara-icon-btn:hover,
                .sara-icon-btn.is-active {
                    background: rgba(255, 255, 255, 0.1);
                    color: #F8FAFC;
                    border-color: rgba(255, 255, 255, 0.15);
                }
                .sara-history {
                    padding: 16px;
                    min-height: 300px;
                }
                .sara-history-label {
                    display: block;
                    margin-bottom: 10px;
                    color: #a1a1aa;
                    font-size: 10.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .sara-history-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    border: 1px solid #e4e4e7;
                    border-radius: 12px;
                    background: #fafafa;
                    padding: 12px 13px;
                    margin-bottom: 8px;
                    color: #18181b;
                    font-size: 12.5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: border-color 0.16s ease, background 0.16s ease;
                }
                .sara-history-row:hover {
                    border-color: #d4d4d8;
                    background: #fff;
                }
                .sara-history-row em {
                    color: #a1a1aa;
                    font-style: normal;
                    font-size: 11px;
                    font-weight: 600;
                }
                .sara-chat-body {
                    padding: 20px 16px;
                    min-height: 300px;
                    background:
                        radial-gradient(circle at 12% 0%, rgba(37, 99, 235, 0.08), transparent 20rem),
                        linear-gradient(180deg, #f8fafc, #f3f6fb);
                }
                .sara-prompts {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    max-height: 400px;
                    opacity: 1;
                    overflow: hidden;
                    transition: max-height 0.45s ease, opacity 0.35s ease, margin 0.45s ease;
                    margin-bottom: 16px;
                }
                .sara-prompts.is-hidden {
                    max-height: 0;
                    opacity: 0;
                    margin-bottom: 0;
                }
                .sara-prompts-label {
                    display: block;
                    margin-bottom: 2px;
                    color: #a1a1aa;
                    font-size: 10.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .sara-prompt-chip {
                    text-align: left;
                    border: 1px solid rgba(226, 232, 240, 0.98);
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.86);
                    box-shadow: 0 1px 1px rgba(15, 23, 42, 0.03);
                    color: #475569;
                    padding: 10px 12px;
                    font-size: 12px;
                    font-weight: 650;
                    cursor: pointer;
                    transition: all 140ms ease;
                }
                .sara-prompt-chip.is-picked,
                .sara-prompt-chip:hover {
                    border-color: #cbd5e1;
                    background: #fff;
                    color: #0f172a;
                    box-shadow: 0 8px 22px -16px rgba(15, 23, 42, 0.45);
                }
                .sara-thread {
                    display: grid;
                    grid-template-rows: 0fr;
                    opacity: 0;
                    transition: grid-template-rows 0.45s ease, opacity 0.4s ease;
                }
                .sara-thread.is-visible {
                    grid-template-rows: 1fr;
                    opacity: 1;
                }
                .sara-thread > * {
                    overflow: hidden;
                }
                .sara-user-bubble {
                    width: fit-content;
                    max-width: 76%;
                    margin-left: auto;
                    margin-bottom: 16px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 18px;
                    background: #fff;
                    color: #0f172a;
                    padding: 12px 16px;
                    font-size: 13px;
                    font-weight: 500;
                    line-height: 1.6;
                    box-shadow: 0 2px 4px -2px rgba(15, 23, 42, 0.03);
                }
                .sara-answer-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                .sara-answer-avatar {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #fff;
                    box-shadow: 0 14px 30px -18px rgba(37,99,235,0.95), 0 0 0 1px rgba(255,255,255,0.55);
                    flex-shrink: 0;
                    overflow: hidden;
                }
                .sara-answer {
                    min-width: 0;
                    flex: 1;
                    padding-top: 4px;
                }
                .sara-answer p {
                    margin: 0;
                    color: #27272a;
                    font-size: 13px;
                    line-height: 1.75;
                }
                .sara-cursor {
                    display: inline-block;
                    width: 2px;
                    height: 13px;
                    margin-left: 2px;
                    vertical-align: middle;
                    background: #18181b;
                    animation: saraBlink 0.8s step-end infinite;
                }
                .sara-meta-row {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 12px;
                }
                .sara-tag {
                    border: 1px solid #e4e4e7;
                    border-radius: 999px;
                    background: #fafafa;
                    color: #18181b;
                    padding: 4px 10px;
                    font-size: 11px;
                    font-weight: 700;
                }
                .sara-confidence {
                    color: #94a3b8;
                    font-size: 11px;
                    font-weight: 500;
                }
                .sara-input {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border: 1px solid rgba(226, 232, 240, 0.9);
                    border-radius: 16px;
                    background: #fff;
                    color: #94a3b8;
                    padding: 14px 16px;
                    font-size: 13px;
                    font-weight: 500;
                    margin-top: 18px;
                    box-shadow: 0 2px 4px -2px rgba(15, 23, 42, 0.03);
                }
                .sara-input span {
                    border-radius: 7px;
                    background: #09090b;
                    color: #fff;
                    padding: 4px 7px;
                    font-size: 10.5px;
                    font-weight: 700;
                }
                .sara-launcher {
                    position: absolute;
                    right: 18px;
                    bottom: -18px;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: #fff;
                    box-shadow: 0 14px 30px -10px rgba(15,23,42,0.4);
                    overflow: hidden;
                    border: 2px solid #fff;
                }
                @keyframes saraBlink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes saraPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.35; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .sara-pill span, .sara-cursor {
                        animation: none !important;
                    }
                }
                @media (max-width: 920px) {
                    .sara-section { padding: 72px 18px; }
                    .sara-heading h2 { font-size: 32px; }
                    .sara-layout { grid-template-columns: 1fr; }
                    .sara-right { position: relative; top: auto; }
                    .sara-launcher { display: none; }
                }
                @media (max-width: 620px) {
                    .sara-card-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </section>
    )
}

export default SaraSection

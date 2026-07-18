import { useEffect, useRef, useState, useCallback } from "react"

// ── brand config ──────────────────────────────────────────────────────────────
const BRANDS: Record<string, {
    sentiment: "positive" | "negative" | "neutral"
    visibility: string
    sentimentScore: number
    position: string
}> = {
    "PromptPulse": { sentiment: "positive", visibility: "64%", sentimentScore: 86, position: "2.4" },
    "Peec AI": { sentiment: "positive", visibility: "58%", sentimentScore: 78, position: "2.7" },
    "PromptWatch": { sentiment: "positive", visibility: "51%", sentimentScore: 74, position: "3.1" },
    "Profound": { sentiment: "neutral", visibility: "46%", sentimentScore: 68, position: "3.4" },
    "AthenaHQ": { sentiment: "neutral", visibility: "38%", sentimentScore: 62, position: "3.9" },
    "missing citations": { sentiment: "negative", visibility: "-", sentimentScore: 24, position: "-" },
}

const SENT_COLOR = {
    positive: { bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.28)", text: "#15803d", dot: "#22c55e" },
    negative: { bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.28)", text: "#dc2626", dot: "#ef4444" },
    neutral: { bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.28)", text: "#a16207", dot: "#eab308" },
}

// card → which brand tooltip to show on right panel
const CARD_BRAND: Record<string, string> = {
    visibility: "PromptPulse",
    position: "PromptWatch",
    sentiment: "Peec AI",
}

const AI_RESPONSE = `For B2B SaaS teams trying to improve visibility inside AI answer engines, the strongest tools usually split across monitoring, source intelligence, and content recommendations:

PromptPulse is useful when teams want one workflow for AI visibility, competitor benchmarking, source tracking, opportunity discovery, and Sara-powered recommendations.

Peec AI is often mentioned for broad AI search analytics and marketing-team reporting.

PromptWatch is commonly referenced for prompt tracking and category visibility monitoring.

Profound and AthenaHQ also appear in comparison-style answers, especially when buyers ask for enterprise AI visibility platforms.

If a brand has missing citations across trusted third-party sources like Reddit, G2, LinkedIn, and category blogs, AI models may recommend competitors more often.`

const FEATURES = [
    {
        id: "visibility",
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
        ),
        title: "Visibility",
        desc: "See the share of chats where your brand is mentioned and understand how often you show up in AI conversations.",
    },
    {
        id: "position",
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
        ),
        title: "Position",
        desc: "Understand your brand's rank within AI search results and uncover opportunities to improve your position.",
    },
    {
        id: "sentiment",
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
        ),
        title: "Sentiment",
        desc: "Find out how AI perceives your brand — what's going well and what needs improvement in the narrative.",
    },
]

// ── tokeniser ─────────────────────────────────────────────────────────────────
function tokenise(text: string) {
    type Token = { type: "text" | "brand"; value: string; brand?: string }
    const tokens: Token[] = []
    let remaining = text
    while (remaining.length > 0) {
        let earliest = -1; let matchedBrand = ""
        for (const brand of Object.keys(BRANDS)) {
            const idx = remaining.indexOf(brand)
            if (idx !== -1 && (earliest === -1 || idx < earliest)) { earliest = idx; matchedBrand = brand }
        }
        if (earliest === -1) { tokens.push({ type: "text", value: remaining }); break }
        if (earliest > 0) tokens.push({ type: "text", value: remaining.slice(0, earliest) })
        tokens.push({ type: "brand", value: matchedBrand, brand: matchedBrand })
        remaining = remaining.slice(earliest + matchedBrand.length)
    }
    return tokens
}

const TOKENS = tokenise(AI_RESPONSE)
const FULL_LEN = AI_RESPONSE.length

// ── right-panel brand info box (shown when card clicked) ──────────────────────
function BrandInfoBox({ brand }: { brand: string }) {
    const cfg = BRANDS[brand]
    if (!cfg) return null
    const col = SENT_COLOR[cfg.sentiment]
    const label = cfg.sentiment === "positive" ? "Positive Sentiment" : cfg.sentiment === "negative" ? "Negative Sentiment" : "Neutral Sentiment"

    return (
        <div className="pp-feature-showcase-brand-box" style={{
            position: "absolute", top: 20, right: 20, zIndex: 20,
            background: "#101012",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "14px 16px",
            width: 240,
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            animation: "fadeUp 0.25s ease",
        }}>
            {/* header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{
                    width: 24, height: 24, borderRadius: 7,
                    background: col.dot,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{brand[0]}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{brand}</span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: "#52525b" }}>↗</span>
            </div>

            {/* label */}
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.09em", color: "#52525b", marginBottom: 8 }}>
                {label}
            </div>

            {/* score pill */}
            <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${col.border}`,
                borderRadius: 8, padding: "5px 12px", marginBottom: 10,
            }}>
                <span style={{ width: 3, height: 16, borderRadius: 2, background: col.dot }} />
                <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{cfg.sentimentScore}</span>
            </div>

            {/* 3 metrics row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                {[
                    { label: "Visibility", value: cfg.visibility },
                    { label: "Sentiment", value: `${cfg.sentimentScore}` },
                    { label: "Position", value: `#${cfg.position}` },
                ].map((m) => (
                    <div key={m.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "7px 8px" }}>
                        <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#52525b", marginBottom: 3 }}>{m.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{m.value}</div>
                    </div>
                ))}
            </div>

            <p style={{ fontSize: 11.5, color: "#71717a", margin: 0, lineHeight: 1.5 }}>
                {cfg.sentiment === "positive"
                    ? `Positive endorsement of ${brand} as a reliable choice.`
                    : cfg.sentiment === "negative"
                        ? `Negative signal — cost or limitation concerns flagged.`
                        : `Mixed mentions — neutral framing in AI responses.`}
            </p>
        </div>
    )
}

// ── streaming text renderer ───────────────────────────────────────────────────
function StreamingText({ charsVisible }: { charsVisible: number }) {
    let used = 0
    const parts: React.ReactNode[] = []
    for (let i = 0; i < TOKENS.length; i++) {
        const tok = TOKENS[i]
        const rem = charsVisible - used
        if (rem <= 0) break
        if (tok.type === "text") {
            const slice = tok.value.slice(0, rem)
            slice.split("\n").forEach((line, li, arr) => {
                parts.push(<span key={`t${i}-${li}`}>{line}</span>)
                if (li < arr.length - 1) parts.push(<br key={`br${i}-${li}`} />)
            })
            used += slice.length
        } else if (tok.brand) {
            const brand = tok.brand
            const slice = brand.slice(0, rem)
            const col = SENT_COLOR[BRANDS[brand].sentiment]
            parts.push(
                <span key={`b${i}`} style={{
                    background: col.bg, color: col.text,
                    borderBottom: `1.5px solid ${col.border}`,
                    borderRadius: 3, padding: "0 2px",
                    fontWeight: 600,
                }}>{slice}</span>
            )
            used += slice.length
        }
    }
    return <>{parts}</>
}

// ── main ─────────────────────────────────────────────────────────────────────
export function FeatureShowcase() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const [animated, setAnimated] = useState(false)
    const [showUser, setShowUser] = useState(false)
    const [showAI, setShowAI] = useState(false)
    const [charsVisible, setCharsVisible] = useState(0)
    const [activeCard, setActiveCard] = useState<string>("visibility")
    const [userClicked, setUserClicked] = useState(false)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

    const runOnce = useCallback(() => {
        const t1 = setTimeout(() => setShowUser(true), 300)
        const t2 = setTimeout(() => { setShowAI(true) }, 1100)
        const t3 = setTimeout(() => {
            let count = 0
            intervalRef.current = setInterval(() => {
                count += 24
                setCharsVisible(count)
                const pct = count / FULL_LEN
                if (pct > 0.33 && pct <= 0.66) setActiveCard("position")
                if (pct > 0.66) setActiveCard("sentiment")
                if (count >= FULL_LEN) {
                    if (intervalRef.current) clearInterval(intervalRef.current)
                    setCharsVisible(FULL_LEN)
                }
            }, 26)
        }, 1700)
        timeoutsRef.current = [t1, t2, t3]
    }, [])

    useEffect(() => {
        const el = sectionRef.current
        if (!el) return
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !animated) { setAnimated(true); runOnce() }
        }, { threshold: 0.2 })
        obs.observe(el)
        return () => obs.disconnect()
    }, [animated, runOnce])

    useEffect(() => () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        timeoutsRef.current.forEach(clearTimeout)
    }, [])

    const activeBrandForPanel = CARD_BRAND[activeCard] ?? "PromptPulse"

    return (
        <section
            className="pp-feature-showcase"
            ref={sectionRef}
            style={{ padding: "88px 24px" }} // no bg — uses parent page bg
        >
            {/* header */}
            <div className="pp-feature-showcase-header" style={{ textAlign: "center", marginBottom: 60 }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,0.7)", border: "1px solid #e4e4e7",
                    borderRadius: 999, padding: "5px 14px", marginBottom: 22,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth={1.8}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#71717a" }}>AI Search Metrics</span>
                </div>
                <h2 className="pp-feature-showcase-title" style={{ fontSize: 36, fontWeight: 700, color: "#0f0f10", letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 14px" }}>
                    Understand how AI sees your brand
                </h2>
                <p style={{ fontSize: 15.5, color: "#71717a", margin: 0 }}>
                    We track the most important metrics within AI search — so you always know where you stand.
                </p>
            </div>

            {/* two-col layout */}
            <div className="pp-feature-showcase-layout" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, maxWidth: 1040, margin: "0 auto" }}>

                {/* ── left: clickable feature cards ── */}
                <div className="pp-feature-showcase-cards" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {FEATURES.map((f) => {
                        const isActive = activeCard === f.id
                        return (
                            <button
                                key={f.id}
                                onClick={() => { setActiveCard(f.id); setUserClicked(true) }}
                                className="pp-feature-showcase-card"
                                style={{
                                    all: "unset",
                                    flex: 1,
                                    display: "block",
                                    cursor: "pointer",
                                    background: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                                    border: "1px solid #e4e4e7",
                                    borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent",
                                    borderRadius: 14,
                                    padding: "22px 20px 22px 18px",
                                    textAlign: "left",
                                    transition: "all 0.25s ease",
                                    opacity: isActive ? 1 : 0.55,
                                    boxShadow: isActive ? "0 2px 14px rgba(37,99,235,0.08)" : "none",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: isActive ? "#2563eb" : "#a1a1aa" }}>
                                    {f.icon}
                                    <span style={{ fontSize: 13.5, fontWeight: 600, color: isActive ? "#18181b" : "#71717a" }}>{f.title}</span>
                                </div>
                                <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                            </button>
                        )
                    })}
                </div>

                {/* ── right: chat window ── */}
                <div className="pp-feature-showcase-chat" style={{
                    background: "#fff",
                    border: "1px solid #e4e4e7",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 4px 28px rgba(15,23,42,0.07)",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    minHeight: 520,
                }}>
                    {/* chrome bar */}
                    <div style={{ background: "#fafafa", borderBottom: "1px solid #e4e4e7", padding: "9px 14px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fca5a5" }} />
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fde68a" }} />
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#a7f3d0" }} />
                        <span style={{ marginLeft: 8, fontSize: 12, color: "#a1a1aa", fontWeight: 500 }}>ChatGPT</span>
                    </div>

                    {/* messages */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 18 }}>

                        {/* user bubble */}
                        {showUser && (
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <div className="pp-feature-showcase-user-bubble" style={{
                                    background: "#f4f4f5", borderRadius: "18px 18px 4px 18px",
                                    padding: "10px 14px", maxWidth: "72%",
                                    fontSize: 13.5, color: "#18181b", lineHeight: 1.5, fontWeight: 500,
                                    animation: "fadeUp 0.3s ease",
                                }}>
                                    Best AI visibility tools for B2B SaaS teams?
                                </div>
                            </div>
                        )}

                        {/* AI response */}
                        {showAI && (
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", animation: "fadeUp 0.3s ease" }}>
                                {/* ChatGPT icon */}
                                <div style={{
                                    width: 30, height: 30, borderRadius: "50%",
                                    background: "#10a37f", flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    marginTop: 2, boxShadow: "0 2px 6px rgba(16,163,127,0.3)",
                                }}>
                                    <svg width="15" height="15" viewBox="0 0 41 41" fill="white">
                                        <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-7.505-3.35 10.079 10.079 0 0 0-9.612 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 7.504 3.35 10.078 10.078 0 0 0 9.617-6.981 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.243-11.814zM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496zM6.392 31.006a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744zM4.297 13.62A7.469 7.469 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L7.044 23.86a7.504 7.504 0 0 1-2.747-10.24zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 0 1 .114-.012l8.048 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.498v4.997l-4.331 2.5-4.331-2.5V18z" />
                                    </svg>
                                </div>

                                {/* text */}
                                <div style={{ flex: 1, fontSize: 13.5, color: "#18181b", lineHeight: 1.75 }}>
                                    <StreamingText charsVisible={charsVisible} />
                                    {charsVisible > 0 && charsVisible < FULL_LEN && (
                                        <span style={{
                                            display: "inline-block", width: 2, height: 14,
                                            background: "#18181b", marginLeft: 2, verticalAlign: "middle",
                                            animation: "blink 0.75s step-end infinite",
                                        }} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* brand info box — appears top-right of chat panel when card clicked */}
                    {showAI && userClicked && <BrandInfoBox brand={activeBrandForPanel} />}

                    {/* bottom hint */}
                    <div style={{
                        borderTop: "1px solid #f0f0f1", padding: "9px 18px",
                        fontSize: 11.5, color: "#a1a1aa", fontWeight: 500,
                        flexShrink: 0, background: "#fafafa",
                    }}>
                        Click a metric card on the left to see brand insights
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @media (max-width: 820px) {
                    .pp-feature-showcase {
                        padding: 64px 16px !important;
                    }
                    .pp-feature-showcase-header {
                        margin-bottom: 32px !important;
                    }
                    .pp-feature-showcase-title {
                        font-size: 30px !important;
                        line-height: 1.08 !important;
                    }
                    .pp-feature-showcase-layout {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                    .pp-feature-showcase-cards {
                        display: grid !important;
                        grid-template-columns: 1fr !important;
                    }
                    .pp-feature-showcase-card {
                        padding: 16px !important;
                    }
                    .pp-feature-showcase-chat {
                        min-height: 460px !important;
                    }
                    .pp-feature-showcase-user-bubble {
                        max-width: 90% !important;
                    }
                    .pp-feature-showcase-brand-box {
                        position: static !important;
                        width: auto !important;
                        margin: 0 16px 16px !important;
                    }
                }
                @media (max-width: 560px) {
                    .pp-feature-showcase p {
                        font-size: 14px !important;
                    }
                }
            `}</style>
        </section>
    )
}

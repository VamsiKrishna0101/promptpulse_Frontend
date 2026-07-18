// ── FeaturesGrid.tsx ─────────────────────────────────────────────────────────
// 7-card feature grid — inline styles only, glassmorphism cards

// ── Mini mockups ─────────────────────────────────────────────────────────────

function PromptMockup() {
    return (
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "12px 12px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#10a37f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 41 41" fill="white"><path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-7.505-3.35 10.079 10.079 0 0 0-9.612 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 7.504 3.35 10.078 10.078 0 0 0 9.617-6.981 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.243-11.814z" /></svg>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "#71717a" }}>ChatGPT</span>
            </div>
            <div style={{ alignSelf: "flex-end", background: "#f4f4f5", borderRadius: "10px 10px 2px 10px", padding: "5px 9px", fontSize: 10.5, color: "#18181b" }}>
                Best AI visibility tools for B2B SaaS?
            </div>
            <div style={{ fontSize: 10.5, color: "#52525b", lineHeight: 1.6 }}>
                For B2B SaaS teams,{" "}
                <span style={{ background: "rgba(34,197,94,0.12)", color: "#15803d", borderBottom: "1.5px solid rgba(34,197,94,0.28)", borderRadius: 3, padding: "0 2px", fontWeight: 600 }}>PromptPulse</span>
                {" "}should appear alongside category leaders like{" "}
                <span style={{ background: "rgba(234,179,8,0.12)", color: "#a16207", borderBottom: "1.5px solid rgba(234,179,8,0.28)", borderRadius: 3, padding: "0 2px", fontWeight: 600 }}>QueryPilot</span>
                {" "}when source evidence is strong.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f9f9f9", border: "1px solid #e4e4e7", borderRadius: 7, padding: "4px 8px" }}>
                <span style={{ flex: 1, fontSize: 9.5, color: "#a1a1aa" }}>Ask AI Assistant</span>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#18181b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
                </div>
            </div>
        </div>
    )
}

function CompetitorMockup() {
    const rows = [
        { name: "PromptPulse", vis: 65, color: "#2563eb", you: true },
        { name: "SignalNest", vis: 46, color: "#22c55e", you: false },
        { name: "QueryPilot", vis: 38, color: "#f59e0b", you: false },
        { name: "NorthstarIQ", vis: 29, color: "#a855f7", you: false },
    ]
    return (
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 72px", gap: 4 }}>
                {["Brand", "Vis.", ""].map((h) => <span key={h} style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a1a1aa" }}>{h}</span>)}
            </div>
            {rows.map((row) => (
                <div key={row.name} style={{ display: "grid", gridTemplateColumns: "1fr 32px 72px", alignItems: "center", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: row.you ? 700 : 500, color: row.you ? "#18181b" : "#52525b" }}>{row.name}</span>
                        {row.you && <span style={{ fontSize: 8.5, fontWeight: 700, background: "#eff6ff", color: "#2563eb", borderRadius: 4, padding: "1px 4px" }}>You</span>}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#18181b" }}>{row.vis}%</span>
                    <div style={{ height: 4, borderRadius: 99, background: "#f4f4f5", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${row.vis}%`, borderRadius: 99, background: row.color }} />
                    </div>
                </div>
            ))}
        </div>
    )
}

function SourcesMockup() {
    const rows = [
        { domain: "g2.com", cited: true },
        { domain: "reddit.com", cited: true },
        { domain: "yoursite.com", cited: false },
        { domain: "marketloop.example", cited: false },
        { domain: "techcrunch.com", cited: true },
    ]
    return (
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, overflow: "hidden" }}>
            {rows.map((row, i) => (
                <div key={row.domain} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "6px 11px",
                    borderBottom: i < rows.length - 1 ? "1px solid #f4f4f5" : "none",
                    background: i % 2 === 0 ? "#fff" : "#fafafa",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <img src={`https://www.google.com/s2/favicons?domain=${row.domain}&sz=32`} width={12} height={12} style={{ borderRadius: 2 }} alt="" />
                        <span style={{ fontSize: 11, color: "#52525b", fontWeight: 500 }}>{row.domain}</span>
                    </div>
                    <span style={{
                        fontSize: 9.5, fontWeight: 600, borderRadius: 4, padding: "2px 6px",
                        background: row.cited ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                        color: row.cited ? "#15803d" : "#dc2626",
                        border: `1px solid ${row.cited ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
                    }}>{row.cited ? "Cited" : "Missing"}</span>
                </div>
            ))}
        </div>
    )
}

function VisibilityMockup() {
    return (
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "14px 14px 10px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: "#18181b", lineHeight: 1 }}>68%</span>
                <div style={{ paddingBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#22c55e" }}>↑ 5%</span>
                    <p style={{ fontSize: 9.5, color: "#a1a1aa", margin: 0 }}>Visibility Score</p>
                </div>
            </div>
            <svg viewBox="0 0 160 52" style={{ width: "100%", height: 52 }}>
                <defs>
                    <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polyline points="0,46 28,40 56,34 84,26 112,18 140,10 160,6 160,52 0,52" fill="url(#vg)" />
                <polyline points="0,46 28,40 56,34 84,26 112,18 140,10 160,6" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    )
}

function SentimentMockup() {
    const bars = [
        { label: "Positive", pct: 62, color: "#22c55e" },
        { label: "Neutral", pct: 24, color: "#f59e0b" },
        { label: "Negative", pct: 14, color: "#ef4444" },
    ]
    return (
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "12px 13px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <svg width="48" height="48" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="20" fill="none" stroke="#f4f4f5" strokeWidth="7" />
                    <circle cx="26" cy="26" r="20" fill="none" stroke="#22c55e" strokeWidth="7"
                        strokeDasharray={`${0.62 * 125.6} ${125.6}`} strokeDashoffset="31.4" strokeLinecap="butt" />
                    <text x="26" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill="#18181b">62%</text>
                </svg>
                <div>
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: "#18181b", margin: "0 0 2px" }}>Mostly Positive</p>
                    <p style={{ fontSize: 10, color: "#a1a1aa", margin: 0 }}>AI sentiment score</p>
                </div>
            </div>
            {bars.map((b) => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: "#71717a", width: 48, flexShrink: 0 }}>{b.label}</span>
                    <div style={{ flex: 1, height: 4, borderRadius: 99, background: "#f4f4f5", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${b.pct}%`, background: b.color, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#52525b", width: 26, textAlign: "right" }}>{b.pct}%</span>
                </div>
            ))}
        </div>
    )
}

function WebAnalyticsMockup() {
    const metrics = [
        { label: "Page Visits", value: "24.8K", change: "+18%", up: true },
        { label: "Bounce Rate", value: "38%", change: "-6%", up: true },
        { label: "Avg. Session", value: "2m 14s", change: "+22%", up: true },
    ]
    return (
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "12px 13px", display: "flex", flexDirection: "column", gap: 8 }}>
            {metrics.map((m) => (
                <div key={m.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f4f4f5" }}>
                    <span style={{ fontSize: 11, color: "#71717a" }}>{m.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}>{m.value}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: m.up ? "#22c55e" : "#ef4444" }}>{m.change}</span>
                    </div>
                </div>
            ))}
            <div style={{ marginTop: 4 }}>
                <p style={{ fontSize: 10, color: "#a1a1aa", margin: "0 0 6px" }}>AI Visibility vs Site Traffic</p>
                <svg viewBox="0 0 200 40" style={{ width: "100%", height: 40 }}>
                    <polyline points="0,36 33,30 66,22 100,16 133,10 166,6 200,3" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="0,38 33,34 66,30 100,24 133,18 166,12 200,8" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />
                </svg>
                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 9.5, color: "#71717a", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 12, height: 2, background: "#2563eb", display: "inline-block", borderRadius: 2 }} /> AI Visibility
                    </span>
                    <span style={{ fontSize: 9.5, color: "#71717a", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 12, height: 2, background: "#22c55e", display: "inline-block", borderRadius: 2 }} /> Traffic
                    </span>
                </div>
            </div>
        </div>
    )
}

function ModelsMockup() {
    const models = [
        { name: "ChatGPT", domain: "chatgpt.com", vis: "68%", active: true },
        { name: "Perplexity", domain: "perplexity.ai", vis: "54%", active: true },
        { name: "Gemini", domain: "gemini.google.com", vis: "41%", active: true },
        { name: "Claude", domain: "claude.ai", vis: "—", active: false },
        { name: "Grok", domain: "x.ai", vis: "—", active: false },
    ]
    return (
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, overflow: "hidden" }}>
            {models.map((m, i) => (
                <div key={m.name} style={{
                    display: "flex", alignItems: "center", gap: 9, padding: "7px 11px",
                    borderBottom: i < models.length - 1 ? "1px solid #f4f4f5" : "none",
                    background: i % 2 === 0 ? "#fff" : "#fafafa",
                    opacity: m.active ? 1 : 0.4,
                }}>
                    <img src={`https://www.google.com/s2/favicons?domain=${m.domain}&sz=32`} width={14} height={14} style={{ borderRadius: 3, flexShrink: 0 }} alt="" />
                    <span style={{ flex: 1, fontSize: 11.5, fontWeight: 500, color: "#18181b" }}>{m.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.active ? "#18181b" : "#a1a1aa" }}>{m.vis}</span>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.active ? "#22c55e" : "#d4d4d8", flexShrink: 0 }} />
                </div>
            ))}
        </div>
    )
}

// ── Card ─────────────────────────────────────────────────────────────────────
function FeatureCard({ title, desc, children, wide }: { title: string; desc: string; children: React.ReactNode; wide?: boolean }) {
    return (
        <div
            className={wide ? "pp-feature-card pp-feature-card-wide" : "pp-feature-card"}
            style={{
                background: "#fafafa",
                border: "1px solid #e4e4e7",
                borderRadius: 16,
                padding: "22px 20px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                gridColumn: wide ? "span 3" : undefined,
                transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                cursor: "default",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)"
                e.currentTarget.style.background = "#fff"
                e.currentTarget.style.borderColor = "#d4d4d8"
                e.currentTarget.style.boxShadow = "0 16px 32px -20px rgba(15,23,42,0.25)"
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.background = "#fafafa"
                e.currentTarget.style.borderColor = "#e4e4e7"
                e.currentTarget.style.boxShadow = "none"
            }}
        >
            <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#0f0f10", margin: "0 0 5px", letterSpacing: "-0.02em" }}>{title}</h3>
                <p style={{ fontSize: 12.5, color: "#71717a", margin: 0, lineHeight: 1.55 }}>{desc}</p>
            </div>
            {children}
        </div>
    )
}

// ── main export ───────────────────────────────────────────────────────────────
export function FeaturesGrid() {
    return (
        <section className="pp-features-grid-section" style={{ padding: "80px 24px", position: "relative", overflow: "hidden", background: "#fff" }}>
            <style>{`
                @media (max-width: 760px) {
                    .pp-features-grid-section {
                        padding: 64px 16px !important;
                    }
                    .pp-features-grid-header {
                        margin-bottom: 28px !important;
                    }
                    .pp-features-grid-title {
                        font-size: 28px !important;
                        line-height: 1.08 !important;
                    }
                    .pp-features-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .pp-feature-card,
                    .pp-feature-card-wide {
                        grid-column: auto !important;
                    }
                }
            `}</style>
            <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 10 }}>

                {/* header */}
                <div className="pp-features-grid-header" style={{ marginBottom: 44 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>
                        Everything you need
                    </p>
                    <h2 className="pp-features-grid-title" style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 10px", maxWidth: 520 }}>
                        Win in AI search with the right data
                    </h2>
                    <p style={{ fontSize: 14.5, color: "#64748b", margin: 0, maxWidth: 480 }}>
                        Track, analyze, and improve your brand's presence across ChatGPT, Gemini, Perplexity, and more.
                    </p>
                </div>

                {/* grid — 3 cols, rows auto */}
                <div className="pp-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>

                    <FeatureCard title="Prompt Tracking" desc="Track real user prompts and see when AI mentions your brand in its responses.">
                        <PromptMockup />
                    </FeatureCard>

                    <FeatureCard title="Competitor Intelligence" desc="See how you rank against competitors that matter in your market.">
                        <CompetitorMockup />
                    </FeatureCard>

                    <FeatureCard title="Source Analysis" desc="Discover which domains AI cites and identify gaps in your content coverage.">
                        <SourcesMockup />
                    </FeatureCard>

                    <FeatureCard title="AI Visibility Score" desc="Monitor your overall share of AI answers across all platforms in one number.">
                        <VisibilityMockup />
                    </FeatureCard>

                    <FeatureCard title="Sentiment Tracking" desc="Find out how AI perceives your brand — what's positive, neutral, or needs work.">
                        <SentimentMockup />
                    </FeatureCard>

                    <FeatureCard title="Multi-model Coverage" desc="Track your brand across ChatGPT, Perplexity, Gemini, Claude, and Grok simultaneously.">
                        <ModelsMockup />
                    </FeatureCard>

                    <FeatureCard wide title="Web & AI Correlation" desc="See how your AI visibility directly correlates with real website traffic and conversions.">
                        <WebAnalyticsMockup />
                    </FeatureCard>

                </div>
            </div>
        </section>
    )
}

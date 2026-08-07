import { useMemo } from "react"
import type { OrganicKeywordsPayload } from "../api/domainResearchTypes"

function fmt(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
    return n.toLocaleString()
}

// Basic stop words to ignore when clustering
const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", 
    "by", "about", "like", "through", "over", "before", "between", "after", 
    "since", "without", "under", "within", "along", "following", "across", 
    "behind", "beyond", "plus", "except", "but", "up", "out", "around", "down", 
    "off", "above", "near", "is", "are", "was", "were", "be", "been", "being", 
    "have", "has", "had", "do", "does", "did", "what", "which", "who", "whom", 
    "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", 
    "been", "being", "have", "has", "had", "do", "does", "did", "how", "why", 
    "when", "where", "it", "its", "they", "them", "their", "he", "him", "his", 
    "she", "her", "we", "us", "our", "you", "your", "i", "me", "my", "of"
])

export function KeyTopicsWidget({ data }: { data: OrganicKeywordsPayload }) {
    // Client-side clustering algorithm to group keywords into "Key Topics"
    const topTopics = useMemo(() => {
        if (!data || !data.keywords) return []

        const wordCounts = new Map<string, { count: number; traffic: number }>()

        // 1. Extract words (1-2 gram approximation)
        data.keywords.forEach(kw => {
            if (!kw.keyword) return
            const words = kw.keyword.toLowerCase().split(/\s+/)
            
            // Generate unigrams and bigrams
            const grams: string[] = []
            
            // Unigrams (excluding stop words and very short words)
            words.forEach(w => {
                const clean = w.replace(/[^a-z0-9]/g, "")
                if (clean.length > 2 && !STOP_WORDS.has(clean)) {
                    grams.push(clean)
                }
            })
            
            // Bigrams (only if neither is a stop word)
            for (let i = 0; i < words.length - 1; i++) {
                const w1 = words[i].replace(/[^a-z0-9]/g, "")
                const w2 = words[i+1].replace(/[^a-z0-9]/g, "")
                if (w1.length > 2 && w2.length > 2 && !STOP_WORDS.has(w1) && !STOP_WORDS.has(w2)) {
                    grams.push(`${w1} ${w2}`)
                }
            }

            // Deduplicate grams per keyword so a keyword doesn't double-count its own traffic
            const uniqueGrams = new Set(grams)

            uniqueGrams.forEach(gram => {
                const existing = wordCounts.get(gram) || { count: 0, traffic: 0 }
                wordCounts.set(gram, {
                    count: existing.count + 1,
                    traffic: existing.traffic + kw.traffic
                })
            })
        })

        // 2. Sort by traffic, then frequency
        return Array.from(wordCounts.entries())
            .filter(([_, stats]) => stats.count > 1) // Must appear in more than 1 keyword to be a "topic"
            .sort((a, b) => b[1].traffic - a[1].traffic || b[1].count - a[1].count)
            .slice(0, 3) // Semrush usually highlights top 3
    }, [data.keywords])

    return (
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-full relative overflow-hidden">
            {/* Background blur effect similar to Semrush's "Pro feature" blur if we wanted to fake it, but let's actually show the real data cleanly */}
            <div className="flex items-center gap-2 mb-6">
                <span className="text-blue-600">✨</span>
                <h3 className="text-[16px] font-bold text-slate-900">Key Topics</h3>
            </div>

            {topTopics.length > 0 ? (
                <div className="flex flex-col gap-4 relative z-10">
                    {topTopics.map(([topic, stats], index) => (
                        <div key={index} className="flex flex-col border-b border-slate-100 pb-3 last:border-0">
                            <span className="text-[14px] font-semibold text-slate-800 capitalize mb-1">
                                {topic}
                            </span>
                            <div className="flex items-center text-[13px] text-slate-500">
                                Traffic: <span className="font-semibold text-slate-900 ml-1">{fmt(stats.traffic)}</span>
                            </div>
                        </div>
                    ))}
                    
                    <div className="mt-4 text-center">
                        <button className="rounded-full bg-slate-950 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-800">
                            View {data.target.domain} key topics
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-[13px] text-slate-400 text-center">
                    Not enough keyword overlap<br/>to cluster topics automatically.
                </div>
            )}
            
            {/* Subtle radial gradient background to mimic Semrush's premium card feel */}
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-100 opacity-50 blur-3xl" />
        </div>
    )
}

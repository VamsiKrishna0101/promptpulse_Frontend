import { useState } from "react"
import { Search } from "lucide-react"

export function DomainSearchHeader({
    onSearch,
    isLoading
}: {
    onSearch: (domain: string) => void
    isLoading: boolean
}) {
    const [domain, setDomain] = useState("")

    return (
        <div className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-slate-400 focus-within:shadow-md transition-all">
            <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain (e.g., refractone.com)"
                className="w-full border-none bg-transparent text-[13.5px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && domain.trim() && !isLoading) {
                        onSearch(domain.trim())
                    }
                }}
            />
            <button
                onClick={() => {
                    if (domain.trim() && !isLoading) {
                        onSearch(domain.trim())
                    }
                }}
                disabled={isLoading || !domain.trim()}
                className="flex-shrink-0 rounded-md px-4 py-1.5 text-[13px] font-semibold text-white transition-all disabled:opacity-40"
                style={{ background: "#1a1a1a" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#333")}
                onMouseLeave={e => (e.currentTarget.style.background = "#1a1a1a")}
            >
                {isLoading ? "Analyzing…" : "Analyze"}
            </button>
        </div>
    )
}


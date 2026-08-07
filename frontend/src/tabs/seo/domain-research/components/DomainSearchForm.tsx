import { useEffect, useRef, useState } from "react"
import { ArrowRight, Check, ChevronDown, Search } from "lucide-react"
import { countryFlagUrl } from "@/lib/countries"

export type SearchFormValues = {
    domain: string
    country: string
    language_code: string
    keywordLimit: 100 | 250 | 500 | 1000
    historyMonths: number
}

type SearchLimit = SearchFormValues["keywordLimit"]

const MARKETS = [
    { countryIsoCode: "US", locationName: "United States", languages: [{ code: "en", name: "English" }] },
    { countryIsoCode: "GB", locationName: "United Kingdom", languages: [{ code: "en", name: "English" }] },
    { countryIsoCode: "IN", locationName: "India", languages: [{ code: "en", name: "English" }, { code: "hi", name: "Hindi" }] },
    { countryIsoCode: "AU", locationName: "Australia", languages: [{ code: "en", name: "English" }] },
    { countryIsoCode: "CA", locationName: "Canada", languages: [{ code: "en", name: "English" }, { code: "fr", name: "French" }] },
    { countryIsoCode: "DE", locationName: "Germany", languages: [{ code: "de", name: "German" }] },
    { countryIsoCode: "AE", locationName: "United Arab Emirates", languages: [{ code: "en", name: "English" }, { code: "ar", name: "Arabic" }] },
    { countryIsoCode: "SG", locationName: "Singapore", languages: [{ code: "en", name: "English" }] },
]

const KEYWORD_LIMITS: Array<{ value: SearchLimit; label: string }> = [
    { value: 100, label: "Top 100" },
    { value: 250, label: "Top 250" },
    { value: 500, label: "Top 500" },
    { value: 1000, label: "Top 1,000" },
]

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="domain-field-label">{children}</label>
}

function Select({ value, onChange, children, ariaLabel }: {
    value: string
    onChange: (value: string) => void
    children: React.ReactNode
    ariaLabel: string
}) {
    return (
        <div className="domain-select-wrap">
            <select value={value} aria-label={ariaLabel} onChange={event => onChange(event.target.value)} className="domain-select">
                {children}
            </select>
            <ChevronDown className="domain-select-chevron" />
        </div>
    )
}

function MarketSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const [open, setOpen] = useState(false)
    const rootRef = useRef<HTMLDivElement>(null)
    const selected = MARKETS.find(market => market.countryIsoCode === value) ?? MARKETS[0]

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", close)
        return () => document.removeEventListener("mousedown", close)
    }, [])

    return (
        <div ref={rootRef} className="domain-market-select">
            <button type="button" className="domain-market-trigger" onClick={() => setOpen(current => !current)} aria-haspopup="listbox" aria-expanded={open}>
                <img src={countryFlagUrl(selected.countryIsoCode)} alt="" />
                <span>{selected.locationName}</span>
                <ChevronDown className={`h-4 w-4 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="domain-market-menu" role="listbox" aria-label="Country">
                    {MARKETS.map(market => (
                        <button
                            type="button"
                            role="option"
                            aria-selected={market.countryIsoCode === value}
                            key={market.countryIsoCode}
                            className="domain-market-option"
                            onClick={() => { onChange(market.countryIsoCode); setOpen(false) }}
                        >
                            <img src={countryFlagUrl(market.countryIsoCode)} alt="" />
                            <span>{market.locationName}</span>
                            <small>{market.countryIsoCode}</small>
                            {market.countryIsoCode === value && <Check className="h-3.5 w-3.5 text-amber-700" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export function DomainSearchForm({
    onSearch,
    isLoading,
    defaultDomain = "",
    title = "Domain overview",
    description = "Open a saved SEO snapshot, then explore rankings, pages, keywords, and competitors.",
    submitLabel = "Open report",
    eyebrow = "SEO intelligence",
    footerTitle = "Search or open a saved report",
    footerDescription = "Saved reports open instantly. A new domain search creates a fresh analysis.",
    depthLabel = "Keyword depth",
    limitOptions = KEYWORD_LIMITS,
    showHistory = true,
}: {
    onSearch: (values: SearchFormValues) => void
    isLoading: boolean
    defaultDomain?: string
    title?: string
    description?: string
    submitLabel?: string
    eyebrow?: string
    footerTitle?: string
    footerDescription?: string
    depthLabel?: string
    limitOptions?: Array<{ value: SearchLimit; label: string }>
    showHistory?: boolean
}) {
    const [domain, setDomain] = useState(defaultDomain)
    const [country, setCountry] = useState("US")
    const [languageCode, setLanguageCode] = useState("en")
    const [keywordLimit, setKeywordLimit] = useState<100 | 250 | 500 | 1000>(100)
    const [historyMonths, setHistoryMonths] = useState(6)
    const [validationError, setValidationError] = useState("")
    const selectedMarket = MARKETS.find(market => market.countryIsoCode === country) ?? MARKETS[0]

    function handleCountryChange(value: string) {
        setCountry(value)
        const market = MARKETS.find(item => item.countryIsoCode === value)
        if (market && !market.languages.some(language => language.code === languageCode)) setLanguageCode(market.languages[0].code)
    }

    function handleSubmit() {
        const normalized = domain.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0]
        if (!normalized || isLoading) return
        if (!/^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(normalized)) {
            setValidationError("Enter a valid domain, for example example.com")
            return
        }
        setValidationError("")
        onSearch({ domain: normalized, country, language_code: languageCode, keywordLimit, historyMonths })
    }

    return (
        <section className="dashboard-card domain-search-card">
            <div className="domain-search-card-header">
                <div className="min-w-0">
                    <span className="domain-search-eyebrow">{eyebrow}</span>
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
            </div>

            <div className="domain-search-card-body">
                <FieldLabel>Enter a domain</FieldLabel>
                <div className="domain-search-input-row">
                    <div className={`domain-search-input-wrap ${validationError ? "has-error" : ""}`}>
                        <Search className="h-4 w-4" />
                        <input
                            type="text"
                            value={domain}
                            onChange={event => setDomain(event.target.value)}
                            onKeyDown={event => event.key === "Enter" && handleSubmit()}
                            placeholder="example.com"
                            aria-label="Domain"
                            autoFocus
                        />
                    </div>
                    <button type="button" onClick={handleSubmit} disabled={!domain.trim() || isLoading} className="domain-search-submit">
                        {isLoading ? <><span className="domain-search-spinner" />Opening…</> : <>{submitLabel} <ArrowRight className="h-4 w-4" /></>}
                    </button>
                </div>
                {validationError && <p className="domain-search-validation">{validationError}</p>}

                <div className={`domain-search-filter-panel ${showHistory ? "has-history" : "is-compact"}`}>
                    <div>
                        <FieldLabel>Country</FieldLabel>
                        <MarketSelect value={country} onChange={handleCountryChange} />
                    </div>
                    <div>
                        <FieldLabel>Language</FieldLabel>
                        <Select value={languageCode} onChange={setLanguageCode} ariaLabel="Language">
                            {selectedMarket.languages.map(language => <option key={language.code} value={language.code}>{language.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <FieldLabel>{depthLabel}</FieldLabel>
                        <Select value={String(keywordLimit)} onChange={value => setKeywordLimit(Number(value) as 100 | 250 | 500 | 1000)} ariaLabel="Keyword depth">
                            {limitOptions.map(limit => <option key={limit.value} value={String(limit.value)}>{limit.label}</option>)}
                        </Select>
                    </div>
                    {showHistory && (
                        <div>
                            <FieldLabel>History range</FieldLabel>
                            <Select value={String(historyMonths)} onChange={value => setHistoryMonths(Number(value))} ariaLabel="History range">
                                {Array.from({ length: 12 }, (_, index) => index + 1).map(months => <option key={months} value={String(months)}>{months} {months === 1 ? "Month" : "Months"}</option>)}
                            </Select>
                        </div>
                    )}
                </div>

                <div className="domain-search-footer">
                    <span className="domain-search-ready"><span className="domain-status-dot" />{footerTitle}</span>
                    <span>{footerDescription}</span>
                </div>
            </div>
        </section>
    )
}

import { NavHeader } from "@/components/navbar/navbar"
import { PricingSection } from "@/components/pricing/pricing"

export function PricingPage() {
    return (
        <>
            <NavHeader />
            <main className="relative isolate overflow-hidden bg-white">
                <PricingSection />
            </main>
        </>
    )
}

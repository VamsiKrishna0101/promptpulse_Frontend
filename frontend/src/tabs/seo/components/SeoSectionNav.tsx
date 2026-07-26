import { SEO_SECTIONS, type SeoSection } from "../lib/seoSections"

export function SeoSectionNav({ active, onChange }: { active: SeoSection; onChange: (section: SeoSection) => void }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_1px_8px_-2px_rgba(15,23,42,0.06)]">
      <div className="grid gap-1 md:grid-cols-3 xl:grid-cols-6">
        {SEO_SECTIONS.map(section => {
          const selected = active === section.id
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={
                selected
                  ? "rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-left shadow-[0_1px_6px_-2px_rgba(59,130,246,0.12)] transition"
                  : "rounded-xl border border-transparent px-3 py-2.5 text-left transition hover:bg-slate-50"
              }
            >
              <div className="flex items-center gap-2">
                <span className={selected ? "text-blue-400" : "text-slate-400"}>{section.icon}</span>
                <span className={`text-[11.5px] font-black ${selected ? "text-blue-700" : "text-slate-700"}`}>
                  {section.label}
                </span>
              </div>
              <p className={`mt-0.5 text-[10px] font-semibold leading-4 ${selected ? "text-blue-400/90" : "text-slate-400"}`}>
                {section.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

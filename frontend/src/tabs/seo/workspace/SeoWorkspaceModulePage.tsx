import type { SeoWorkspaceModule } from "./seoWorkspaceModules"

export function SeoWorkspaceModulePage({ module }: { module: SeoWorkspaceModule }) {
    const Icon = module.icon

    return (
        <div className="flex h-full flex-col p-6">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{module.title}</h1>
                    <p className="mt-1 text-[13px] text-slate-500">{module.description}</p>
                </div>
            </header>
            
            <div className="flex h-full flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${module.accent}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Module Under Construction</h2>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                    The {module.title} module is currently being built. Check back soon for updates!
                </p>
            </div>
        </div>
    )
}

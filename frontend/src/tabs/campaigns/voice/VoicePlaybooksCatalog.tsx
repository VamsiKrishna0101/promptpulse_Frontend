import React from "react"
import { Play, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Activity, FileText, HeartPulse } from "lucide-react"
import type { VoicePlaybookDefinition, VoicePlaybookType } from "@/lib/voiceApi"

interface Props {
    playbooks: VoicePlaybookDefinition[]
    selectedPlaybook: VoicePlaybookType
    onSelect: (playbook: VoicePlaybookDefinition) => void
    onPreviewAudio?: (text: string) => void
}

export function VoicePlaybooksCatalog({ playbooks, selectedPlaybook, onSelect, onPreviewAudio }: Props) {
    const getIcon = (type: VoicePlaybookType) => {
        switch (type) {
            case "OPD_APPOINTMENT_CONFIRMATION":
                return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            case "POST_DISCHARGE_CARE":
                return <HeartPulse className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            case "LAB_REPORT_ALERT":
                return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            case "PREVENTIVE_HEALTH_CAMP":
                return <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            default:
                return <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-zinc-800 dark:text-zinc-200" />
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Purpose-Built Healthcare & Business Playbooks
                    </h2>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Pre-tuned with conversational Telugu prompts, clinical triage safety, and emergency keyword detectors.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {playbooks.map((pb) => {
                    const isSelected = selectedPlaybook === pb.id
                    return (
                        <div
                            key={pb.id}
                            className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 ${
                                isSelected
                                    ? "border-zinc-900 bg-zinc-50 shadow-sm dark:border-zinc-100 dark:bg-zinc-900/60 ring-1 ring-zinc-900 dark:ring-zinc-100"
                                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                            }`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                                            {getIcon(pb.id)}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                                {pb.name}
                                            </h3>
                                            <span className="inline-block mt-0.5 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                                {pb.badge}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="rounded-md border border-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                                        Telugu (te-IN)
                                    </span>
                                </div>

                                <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                                    {pb.description}
                                </p>

                                {/* Telugu Sample Dialogue Snippet */}
                                <div className="mt-3.5 rounded-lg border border-zinc-200/80 bg-zinc-100/60 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/60">
                                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                                        <span>Telugu Voice Prompt Preview:</span>
                                        {onPreviewAudio && (
                                            <button
                                                type="button"
                                                onClick={() => onPreviewAudio(pb.sampleDialogueTelugu)}
                                                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-900 hover:underline dark:text-zinc-200"
                                            >
                                                <Play className="h-3 w-3 fill-current" /> Listen Voice
                                            </button>
                                        )}
                                    </div>
                                    <p className="font-serif text-xs text-zinc-800 dark:text-zinc-200 line-clamp-2">
                                        "{pb.sampleDialogueTelugu}"
                                    </p>
                                </div>

                                {/* Emergency Keywords Pill */}
                                {pb.emergencyTriggers.length > 0 && (
                                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                                        <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                        <span>Safety Guards: {pb.emergencyTriggers.slice(0, 3).join(", ")}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                    Voice: <strong className="text-zinc-800 dark:text-zinc-200">Shruti (Neural)</strong>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onSelect(pb)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                        isSelected
                                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                            : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                                    }`}
                                >
                                    {isSelected ? "Selected" : "Select Playbook"}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

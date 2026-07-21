import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  Check,
  Cpu,
  KeyRound,
  Lock,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserCog,
} from "lucide-react"
import { useSettings } from "@/hooks/useSettings"
import { useProjects } from "@/hooks/useProjects"
import { getProjectEngines, updateProjectEngines } from "@/lib/projectEnginesApi"
import type { ProjectEngine, ProjectEnginesResponse } from "@/lib/projectEnginesApi"
import { faviconUrl } from "@/lib/aiModels"

type PreferenceKey = "weekly_email_reports" | "sara_recommendations" | "export_notifications"

const ENGINE_META: Record<string, { name: string; domain: string; label: string }> = {
  CHATGPT:       { name: "ChatGPT",        domain: "chatgpt.com",             label: "Best for commercial buyer questions" },
  GEMINI:        { name: "Gemini",          domain: "gemini.google.com",       label: "Google ecosystem & research answers" },
  PERPLEXITY:    { name: "Perplexity",      domain: "perplexity.ai",           label: "Source-heavy answers with citations" },
  GOOGLE_AI_MODE:{ name: "Google AI Mode", domain: "google.com",              label: "Premium Google AI search surface" },
  COPILOT:       { name: "Copilot",         domain: "copilot.microsoft.com",   label: "Microsoft / Bing discovery behavior" },
}


const SETTINGS_PREFERENCES_KEY = "promptpulse_settings_preferences"

const preferenceCopy: Record<PreferenceKey, { title: string; description: string; icon: ReactNode }> = {
  weekly_email_reports: {
    title: "Weekly email reports",
    description: "Receive a weekly visibility digest with wins, drops, and source movement.",
    icon: <Mail size={15} />,
  },
  sara_recommendations: {
    title: "Sara recommendations",
    description: "Allow Sara to surface proactive strategy recommendations inside the app.",
    icon: <Sparkles size={15} />,
  },
  export_notifications: {
    title: "Export notifications",
    description: "Get notified when larger reports or exports are ready to download.",
    icon: <Bell size={15} />,
  },
}

function formatDate(value?: string | null) {
  if (!value) return "Not available"
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  autoComplete: string
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold text-[#344054]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-1.5 h-10 w-full rounded-md border border-[#D0D5DD] bg-white px-3 text-[13px] font-medium text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
      />
    </label>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#EEF0F3] py-3 last:border-b-0">
      <div className="flex items-center gap-2.5 text-[13px] font-medium text-[#667085]">
        <span className="text-[#98A2B3]">{icon}</span>
        {label}
      </div>
      <p className="max-w-[55%] truncate text-right text-[13px] font-semibold text-[#101828]">{value}</p>
    </div>
  )
}

function ToggleRow({
  enabled,
  onToggle,
  item,
}: {
  enabled: boolean
  onToggle: () => void
  item: { title: string; description: string; icon: React.ReactNode }
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="settings-toggle-row flex w-full items-center justify-between gap-4 rounded-md border border-[#E2E5EA] bg-white px-4 py-3.5 text-left"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#F9FAFB] text-[#667085]">
          {item.icon}
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-[#101828]">{item.title}</span>
          <span className="mt-1 block text-[12px] leading-5 text-[#667085]">{item.description}</span>
        </span>
      </div>
      <span
        className={[
          "relative h-5 w-9 flex-shrink-0 rounded-full transition-colors",
          enabled ? "bg-[#2563EB]" : "bg-[#D0D5DD]",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all",
            enabled ? "left-[18px]" : "left-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  )
}

export function SettingsTab() {
  const { data, isLoading, error, isUpdatingPassword, refresh, updatePassword } = useSettings()
  const { selectedProject } = useProjects()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [preferences, setPreferences] = useState<Record<PreferenceKey, boolean>>(() => {
    const fallback = {
      weekly_email_reports: true,
      sara_recommendations: true,
      export_notifications: true,
    }
    const stored = localStorage.getItem(SETTINGS_PREFERENCES_KEY)
    try {
      return stored ? { ...fallback, ...JSON.parse(stored) } : fallback
    } catch {
      return fallback
    }
  })

  // ── Engine preferences state ──
  const [enginesData, setEnginesData] = useState<ProjectEnginesResponse | null>(null)
  const [enginesLoading, setEnginesLoading] = useState(false)
  const [enginesSaving, setEnginesSaving] = useState(false)
  const [enginesError, setEnginesError] = useState<string | null>(null)
  const [engineSuccess, setEngineSuccess] = useState<string | null>(null)
  const [localEngines, setLocalEngines] = useState<ProjectEngine[]>([])

  useEffect(() => {
    localStorage.setItem(SETTINGS_PREFERENCES_KEY, JSON.stringify(preferences))
  }, [preferences])

  // ── Load engines when project changes ──
  useEffect(() => {
    if (!selectedProject?.id) return
    let cancelled = false
    setEnginesLoading(true)
    setEnginesError(null)
    setEngineSuccess(null)
    getProjectEngines(selectedProject.id)
      .then((res) => {
        if (cancelled) return
        setEnginesData(res)
        setLocalEngines(res.engines)
      })
      .catch(() => {
        if (!cancelled) setEnginesError("Could not load engine preferences.")
      })
      .finally(() => {
        if (!cancelled) setEnginesLoading(false)
      })
    return () => { cancelled = true }
  }, [selectedProject?.id])

  function toggleLocalEngine(engine: ProjectEngine) {
    if (!enginesData) return
    const numericLimit = enginesData.limit === "all" ? enginesData.selectable.length : enginesData.limit
    setLocalEngines((current) => {
      if (current.includes(engine)) {
        if (current.length <= 1) return current // keep at least 1
        return current.filter((e) => e !== engine)
      }
      if (current.length >= numericLimit) return current
      return [...current, engine]
    })
    setEngineSuccess(null)
    setEnginesError(null)
  }

  async function handleSaveEngines() {
    if (!selectedProject?.id || !enginesData) return
    setEnginesSaving(true)
    setEnginesError(null)
    setEngineSuccess(null)
    try {
      const result = await updateProjectEngines(selectedProject.id, localEngines)
      setLocalEngines(result.engines)
      setEnginesData((prev) => prev ? { ...prev, engines: result.engines } : prev)
      setEngineSuccess("Engine preferences saved.")
    } catch (err: any) {
      setEnginesError(err?.response?.data?.error ?? "Failed to save engine preferences.")
    } finally {
      setEnginesSaving(false)
    }
  }
  async function handleRefresh() {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setFormError("New password and confirmation do not match.")
      return
    }

    try {
      await updatePassword(currentPassword, newPassword)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSuccess("Password updated successfully.")
    } catch (err: any) {
      setFormError(err?.response?.data?.error ?? "Failed to update password.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 rounded-lg border border-[#E2E5EA] bg-white px-4 py-3 text-[12.5px] font-medium text-[#667085]">
          <Loader2 size={16} className="animate-spin" />
          Loading settings...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-[#FDA29B] bg-[#FEF3F2] p-5 text-[13px] font-semibold text-[#B42318]">
        {error ?? "Settings are unavailable."}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <style>{`
        .settings-toggle-row {
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .settings-toggle-row:hover {
          border-color: #C9CEDA;
          background: #FAFBFC;
        }
        .settings-save-btn {
          transition: background 0.12s ease;
        }
        .settings-refresh-btn {
          transition: background 0.12s ease, border-color 0.12s ease;
        }
      `}</style>

      {/* ── Header ── */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#E2E5EA] bg-white px-6 py-5">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9FAFB] text-[#344054]">
            <UserCog size={19} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[20px] font-semibold tracking-[-0.01em] text-[#101828]">Settings</h1>
            <p className="mt-0.5 max-w-xl text-[13px] font-medium text-[#667085]">
              Manage account security, product preferences, and workspace defaults.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="settings-refresh-btn flex h-9 items-center gap-2 rounded-md border border-[#D0D5DD] bg-white px-3.5 text-[12.5px] font-semibold text-[#344054] hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          <RefreshCcw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-[#E2E5EA] bg-white p-5">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold tracking-[-0.005em] text-[#101828]">Account</p>
              <p className="mt-0.5 text-[12px] font-medium text-[#98A2B3]">Workspace identity and plan context</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F9FAFB] text-[#667085]">
              <BadgeCheck size={16} />
            </span>
          </div>

          <InfoRow icon={<Mail size={14} />} label="Email" value={data.account.email} />
          <InfoRow icon={<ShieldCheck size={14} />} label="Verification" value={data.account.is_verified ? "Verified" : "Not verified"} />
          <InfoRow icon={<KeyRound size={14} />} label="Plan" value={data.account.plan} />
          <InfoRow icon={<CalendarDays size={14} />} label="Created" value={formatDate(data.account.created_at)} />
        </div>

        <form onSubmit={handlePasswordSubmit} className="rounded-lg border border-[#E2E5EA] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold tracking-[-0.005em] text-[#101828]">Update password</p>
              <p className="mt-0.5 text-[12px] font-medium text-[#98A2B3]">Use at least 8 characters, one uppercase letter, and one number.</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F9FAFB] text-[#667085]">
              <LockKeyhole size={16} />
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Current password"
              autoComplete="current-password"
            />
            <Field
              label="New password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="New password"
              autoComplete="new-password"
            />
            <Field
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm password"
              autoComplete="new-password"
            />
          </div>

          {(formError || success) && (
            <div
              className={[
                "mt-4 rounded-md px-4 py-2.5 text-[12.5px] font-semibold",
                formError ? "border border-[#FDA29B] bg-[#FEF3F2] text-[#B42318]" : "border border-[#B7EFCF] bg-[#ECFDF3] text-[#067647]",
              ].join(" ")}
            >
              {formError ?? success}
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="settings-save-btn mt-5 flex h-9 items-center justify-center gap-2 rounded-md bg-[#101828] px-4 text-[12.5px] font-semibold text-white hover:bg-[#1D2939] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdatingPassword ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            Save password
          </button>
        </form>
      </section>

      {/* ── AI Engine Preferences ── */}
      {selectedProject && (
        <section className="rounded-lg border border-[#E2E5EA] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold tracking-[-0.005em] text-[#101828]">AI Engines</p>
              <p className="mt-0.5 text-[12px] font-medium text-[#98A2B3]">
                Choose which AI engines PromptPulse tracks for <span className="font-semibold text-[#344054]">{selectedProject.brand_name}</span>.
                {enginesData && (
                  <span className="ml-1">
                    Your plan allows{" "}
                    <span className="font-semibold text-[#344054]">
                      {enginesData.limit === "all" ? "all 5" : `up to ${enginesData.limit}`}
                    </span>{" "}
                    engines.
                  </span>
                )}
              </p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F9FAFB] text-[#667085]">
              <Cpu size={16} />
            </span>
          </div>

          {enginesLoading ? (
            <div className="flex items-center gap-2 py-4 text-[12.5px] font-medium text-[#667085]">
              <Loader2 size={15} className="animate-spin" />
              Loading engine preferences…
            </div>
          ) : enginesData ? (
            <>
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {enginesData.selectable.map((engine) => {
                  const meta = ENGINE_META[engine]
                  const checked = localEngines.includes(engine)
                  const numericLimit = enginesData.limit === "all" ? enginesData.selectable.length : enginesData.limit
                  const locked = !checked && localEngines.length >= numericLimit

                  return (
                    <button
                      key={engine}
                      type="button"
                      onClick={() => toggleLocalEngine(engine)}
                      disabled={locked}
                      className={[
                        "flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition",
                        checked
                          ? "border-[#101828] bg-white shadow-sm"
                          : "border-[#E2E5EA] bg-[#FAFAFA] hover:border-[#C9CEDA]",
                        locked ? "cursor-not-allowed opacity-40" : "",
                      ].join(" ")}
                    >
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-[#E2E5EA] bg-white">
                        <img src={faviconUrl(meta.domain, 64) ?? ""} alt="" className="h-4 w-4 rounded-[3px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-[#101828]">{meta.name}</span>
                        <span className="block text-[11px] font-medium text-[#98A2B3]">{meta.label}</span>
                      </span>
                      <span className={[
                        "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border",
                        checked ? "border-[#101828] bg-[#101828] text-white" : "border-[#D0D5DD] bg-white text-[#98A2B3]",
                      ].join(" ")}>
                        {locked ? <Lock size={10} /> : checked ? <Check size={11} /> : null}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-[12px] font-medium text-[#98A2B3]">
                  {localEngines.length} / {enginesData.limit === "all" ? enginesData.selectable.length : enginesData.limit} selected
                </p>
                <div className="flex items-center gap-3">
                  {(enginesError || engineSuccess) && (
                    <span className={[
                      "text-[12px] font-semibold",
                      enginesError ? "text-[#B42318]" : "text-[#067647]",
                    ].join(" ")}>
                      {enginesError ?? engineSuccess}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleSaveEngines()}
                    disabled={enginesSaving || localEngines.length === 0}
                    className="settings-save-btn flex h-9 items-center gap-2 rounded-md bg-[#101828] px-4 text-[12.5px] font-semibold text-white hover:bg-[#1D2939] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {enginesSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Save engines
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </section>
      )}

      <section className="rounded-lg border border-[#E2E5EA] bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold tracking-[-0.005em] text-[#101828]">Product preferences</p>
            <p className="mt-0.5 text-[12px] font-medium text-[#98A2B3]">Interface preferences are saved locally for now.</p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F9FAFB] text-[#667085]">
            <Bell size={16} />
          </span>
        </div>

        <div className="grid gap-3 xl:grid-cols-3">
          {(Object.keys(preferenceCopy) as PreferenceKey[]).map((key) => (
            <ToggleRow
              key={key}
              item={preferenceCopy[key]}
              enabled={preferences[key]}
              onToggle={() => setPreferences((current) => ({ ...current, [key]: !current[key] }))}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  Check,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserCog,
} from "lucide-react"
import { useSettings } from "@/hooks/useSettings"

type PreferenceKey = "weekly_email_reports" | "sara_recommendations" | "export_notifications"

const SETTINGS_PREFERENCES_KEY = "refractone_settings_preferences"

const preferenceCopy: Record<PreferenceKey, { title: string; description: string; icon: ReactNode }> = {
  weekly_email_reports: {
    title: "Weekly email reports",
    description: "Receive a weekly visibility digest with wins, drops, and source movement.",
    icon: <Mail size={16} />,
  },
  sara_recommendations: {
    title: "Sara recommendations",
    description: "Allow Sara to surface proactive strategy recommendations inside the app.",
    icon: <Sparkles size={16} />,
  },
  export_notifications: {
    title: "Export notifications",
    description: "Get notified when larger reports or exports are ready to download.",
    icon: <Bell size={16} />,
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
      <span className="text-[12px] font-bold text-[#344054]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 h-11 w-full rounded-xl border border-[#E2E5EA] bg-white px-3 text-[13px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#98A2B3] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
      />
    </label>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#EEF0F3] py-3 last:border-b-0">
      <div className="flex items-center gap-2.5 text-[13px] font-semibold text-[#667085]">
        <span className="text-[#98A2B3]">{icon}</span>
        {label}
      </div>
      <p className="max-w-[55%] truncate text-right text-[13px] font-semibold text-[#0F172A]">{value}</p>
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
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#E2E5EA] bg-white px-4 py-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:bg-[#FBFCFF]"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
          {item.icon}
        </span>
        <span className="min-w-0">
          <span className="block text-[13.5px] font-semibold text-[#0F172A]">{item.title}</span>
          <span className="mt-1 block text-[12px] leading-5 text-[#667085]">{item.description}</span>
        </span>
      </div>
      <span
        className={[
          "relative h-6 w-11 flex-shrink-0 rounded-full transition",
          enabled ? "bg-[#2563EB]" : "bg-[#E2E5EA]",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
            enabled ? "left-6" : "left-1",
          ].join(" ")}
        />
      </span>
    </button>
  )
}

export function SettingsTab() {
  const { data, isLoading, error, isUpdatingPassword, refresh, updatePassword } = useSettings()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
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

  useEffect(() => {
    localStorage.setItem(SETTINGS_PREFERENCES_KEY, JSON.stringify(preferences))
  }, [preferences])

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
        <div className="flex items-center gap-2 rounded-xl border border-[#E2E5EA] bg-white px-4 py-3 text-[12.5px] font-medium text-[#667085] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <Loader2 size={16} className="animate-spin" />
          Loading settings...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-[#FDA29B] bg-[#FEF3F2] p-5 text-[13px] font-semibold text-[#B42318]">
        {error ?? "Settings are unavailable."}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-[#E2E5EA] bg-white p-6 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.42)]">
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_18%_0%,rgba(37,99,235,0.10),transparent_22rem),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0))]" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0D0F14] text-white shadow-[0_18px_38px_-24px_rgba(15,23,42,0.8)]">
              <UserCog size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[26px] font-semibold tracking-[-0.03em] text-[#0F172A]">Settings</h1>
              <p className="mt-1 max-w-xl text-[13px] font-medium text-[#667085]">
                Manage account security, product preferences, and workspace defaults.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void refresh()}
            className="flex h-9 items-center gap-2 rounded-xl border border-[#E2E5EA] bg-white px-3 text-[12px] font-bold text-[#475467] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:bg-[#F8FAFC]"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">Account</p>
              <p className="mt-1 text-[12px] font-medium text-[#98A2B3]">Workspace identity and plan context</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECFDF3] text-[#047857]">
              <BadgeCheck size={17} />
            </span>
          </div>

          <InfoRow icon={<Mail size={14} />} label="Email" value={data.account.email} />
          <InfoRow icon={<ShieldCheck size={14} />} label="Verification" value={data.account.is_verified ? "Verified" : "Not verified"} />
          <InfoRow icon={<KeyRound size={14} />} label="Plan" value={data.account.plan} />
          <InfoRow icon={<CalendarDays size={14} />} label="Created" value={formatDate(data.account.created_at)} />
        </div>

        <form onSubmit={handlePasswordSubmit} className="rounded-[24px] border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">Update password</p>
              <p className="mt-1 text-[12px] font-medium text-[#98A2B3]">Use at least 8 characters, one uppercase letter, and one number.</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <LockKeyhole size={17} />
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
                "mt-4 rounded-xl px-4 py-3 text-[12.5px] font-semibold",
                formError ? "border border-[#FDA29B] bg-[#FEF3F2] text-[#B42318]" : "border border-[#B7EFCF] bg-[#ECFDF3] text-[#047857]",
              ].join(" ")}
            >
              {formError ?? success}
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="mt-5 flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0D0F14] px-4 text-[12.5px] font-bold text-white shadow-[0_12px_26px_-18px_rgba(15,23,42,0.9)] transition hover:bg-[#171922] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdatingPassword ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            Save password
          </button>
        </form>
      </section>

      <section className="rounded-[24px] border border-[#E2E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">Product preferences</p>
            <p className="mt-1 text-[12px] font-medium text-[#98A2B3]">Interface preferences are saved locally for now.</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFFAEB] text-[#B54708]">
            <Bell size={17} />
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

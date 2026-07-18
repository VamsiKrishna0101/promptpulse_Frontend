export function RedditStatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400">{label}</p>
      <p className="mt-2 text-[24px] font-bold leading-none tracking-tight text-zinc-950">{value}</p>
      <p className="mt-3 min-h-[36px] text-[12px] leading-5 text-zinc-500">{detail}</p>
    </div>
  )
}
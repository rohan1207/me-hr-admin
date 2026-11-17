export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[var(--mehr-line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--mehr-muted)]">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--mehr-ink)] sm:text-3xl">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-[var(--mehr-mist)]">{hint}</p>
          )}
        </div>
        {Icon && (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mehr-teal-soft)] text-[var(--mehr-deep)]">
            <Icon size={18} />
          </span>
        )}
      </div>
    </div>
  );
}

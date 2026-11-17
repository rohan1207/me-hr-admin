"use client";

/**
 * Blocks the admin UI on phone-sized viewports.
 * Tablets/desktops (md+) continue as normal.
 */
export default function DesktopOnlyGate({ children }) {
  return (
    <>
      <div className="phone-block fixed inset-0 z-[100] flex items-center justify-center bg-[var(--mehr-panel)] px-6 md:hidden">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--mehr-line)] bg-white p-7 text-center shadow-[var(--shadow-soft)]">
          <img
            src="/logo1.png"
            alt="me-HR"
            width={160}
            height={48}
            className="mx-auto h-10 w-auto object-contain"
          />
          <h1 className="mt-5 text-lg font-semibold tracking-tight text-[var(--mehr-ink)]">
            Admin is desktop-only
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--mehr-mist)]">
            The me-HR admin panel is built for larger screens. Please open it on a
            tablet or computer — phone access is blocked.
          </p>
        </div>
      </div>
      <div className="hidden min-h-screen md:block">{children}</div>
    </>
  );
}

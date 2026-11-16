"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  BriefcaseBusiness,
  FolderKanban,
  MessageSquareQuote,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seo", label: "SEO & AEO", icon: Search },
  { href: "/insights", label: "Insights", icon: Newspaper },
  { href: "/case-studies", label: "Case studies", icon: FolderKanban },
  { href: "/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/careers", label: "Careers", icon: BriefcaseBusiness },
];

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const NavInner = (
    <div className="flex h-full flex-col" style={{ color: "#f8fafc" }}>
      <div
        className={`flex items-center gap-3 border-b px-4 py-5 ${
          collapsed ? "justify-center" : ""
        }`}
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
          style={{ background: "#14c4ad", color: "#07231f" }}
        >
          mH
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold" style={{ color: "#ffffff" }}>
              me-HR Admin
            </p>
            <p className="truncate text-[11px]" style={{ color: "#94a3b8" }}>
              Content & analytics
            </p>
          </div>
        )}
      </div>

      <nav className="admin-scroll flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              title={item.label}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                collapsed ? "justify-center" : ""
              }`}
              style={
                active
                  ? { background: "#ffffff", color: "#0b5f58" }
                  : { color: "#e2e8f0", background: "transparent" }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#e2e8f0";
                }
              }}
            >
              <Icon size={18} strokeWidth={1.9} color="currentColor" />
              {!collapsed && <span style={{ color: "inherit" }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className="space-y-2 border-t p-3"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <button
          type="button"
          onClick={onToggle}
          className={`hidden w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition lg:flex ${
            collapsed ? "justify-center" : ""
          }`}
          style={{ color: "#cbd5e1" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#cbd5e1";
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          type="button"
          onClick={logout}
          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
            collapsed ? "justify-center" : ""
          }`}
          style={{ color: "#cbd5e1" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#cbd5e1";
          }}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden transition-all duration-300 lg:block ${
          collapsed ? "w-[76px]" : "w-[248px]"
        }`}
        style={{ background: "#0b1220" }}
      >
        {NavInner}
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 transition"
          style={{
            background: "rgba(0,0,0,0.5)",
            opacity: mobileOpen ? 1 : 0,
          }}
          onClick={onMobileClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[260px] shadow-2xl transition-transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ background: "#0b1220" }}
        >
          <button
            type="button"
            onClick={onMobileClose}
            className="absolute right-3 top-4 rounded-lg p-1.5"
            style={{ color: "#e2e8f0" }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
          {NavInner}
        </aside>
      </div>
    </>
  );
}

export function MobileTopBar({ onMenu }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={onMenu}
        className="rounded-lg border border-slate-200 p-2 text-slate-700"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>
      <p className="text-sm font-semibold text-slate-900">me-HR Admin</p>
      <span className="w-9" />
    </div>
  );
}

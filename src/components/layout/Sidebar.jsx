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
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seo", label: "SEO & AEO", icon: Search },
  { href: "/insights", label: "Insights", icon: Newspaper },
  { href: "/case-studies", label: "Case studies", icon: FolderKanban },
  { href: "/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/careers", label: "Careers", icon: BriefcaseBusiness },
];

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden transition-all duration-300 md:block ${
        collapsed ? "w-[76px]" : "w-[248px]"
      }`}
      style={{ background: "var(--mehr-charcoal)" }}
    >
      <div className="flex h-full flex-col text-white">
        <div
          className={`flex items-center border-b px-4 py-5 ${
            collapsed ? "justify-center" : "justify-start"
          }`}
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          <Link
            href="/dashboard"
            className={`block overflow-hidden rounded-xl bg-black ${
              collapsed ? "p-1" : "px-2 py-1.5"
            }`}
            title="me-HR Admin"
          >
            <img
              src="/logo1.png"
              alt="me-HR"
              width={collapsed ? 36 : 148}
              height={36}
              className={`object-contain object-left ${
                collapsed ? "h-8 w-8" : "h-8 w-auto max-w-[150px]"
              }`}
            />
          </Link>
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
                title={item.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  collapsed ? "justify-center" : ""
                }`}
                style={
                  active
                    ? {
                        background: "var(--mehr-teal)",
                        color: "var(--mehr-charcoal)",
                      }
                    : { color: "#e4f6f2", background: "transparent" }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(20,196,173,0.16)";
                    e.currentTarget.style.color = "#ffffff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#e4f6f2";
                  }
                }}
              >
                <Icon size={18} strokeWidth={1.9} color="currentColor" />
                {!collapsed && (
                  <span style={{ color: "inherit" }}>{item.label}</span>
                )}
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
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
              collapsed ? "justify-center" : ""
            }`}
            style={{ color: "#c5ddd8" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(20,196,173,0.16)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#c5ddd8";
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
            style={{ color: "#c5ddd8" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(20,196,173,0.16)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#c5ddd8";
            }}
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

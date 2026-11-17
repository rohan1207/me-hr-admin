"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import DesktopOnlyGate from "./DesktopOnlyGate";

export default function AdminShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <DesktopOnlyGate>
      <div className="min-h-screen bg-[var(--mehr-panel)]">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />
        <div
          className={`min-h-screen transition-all duration-300 ${
            collapsed ? "md:pl-[76px]" : "md:pl-[248px]"
          }`}
        >
          <main className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </DesktopOnlyGate>
  );
}

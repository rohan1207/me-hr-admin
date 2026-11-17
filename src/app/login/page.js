"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DesktopOnlyGate from "@/components/layout/DesktopOnlyGate";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      const next = params.get("next") || "/dashboard";
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 18% 18%, rgba(20,196,173,0.16), transparent 55%), radial-gradient(ellipse 55% 40% at 88% 12%, rgba(11,95,88,0.22), transparent 50%), var(--mehr-charcoal)",
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-7 shadow-[var(--shadow-card)] sm:p-9">
        <div className="mb-7 text-center">
          <img
            src="/logo1.png"
            alt="me-HR"
            width={180}
            height={56}
            className="mx-auto h-12 w-auto object-contain"
          />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--mehr-ink)]">
            Admin sign in
          </h1>
          <p className="mt-1.5 text-sm text-[var(--mehr-mist)]">
            Secure access to me-HR content &amp; analytics
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--mehr-slate)]">
              Username
            </label>
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-[var(--mehr-line)] bg-[var(--mehr-panel)] px-3.5 py-2.5 outline-none ring-[var(--mehr-teal)]/40 focus:bg-white focus:ring-2"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--mehr-slate)]">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--mehr-line)] bg-[var(--mehr-panel)] px-3.5 py-2.5 outline-none ring-[var(--mehr-teal)]/40 focus:bg-white focus:ring-2"
              required
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--mehr-deep)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--mehr-teal-dark)] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <DesktopOnlyGate>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[var(--mehr-charcoal)]" />
        }
      >
        <LoginForm />
      </Suspense>
    </DesktopOnlyGate>
  );
}

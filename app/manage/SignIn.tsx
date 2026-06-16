"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle, LayoutDashboard } from "lucide-react";

export default function SignIn({ invalid }: { invalid?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        <LayoutDashboard className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">Sign in to LAIG</h1>
      <p className="mt-2 text-sm text-slate-600">
        For Campus Ambassadors, executive team members, and LAIG HQ. Enter your
        email and we&apos;ll send you a secure sign-in link.
      </p>

      {invalid && (
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          That sign-in link was invalid or expired. Request a fresh one below.
        </div>
      )}

      {status === "sent" ? (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
          <div className="text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Check your inbox</p>
            <p className="mt-1">
              If <span className="font-medium">{email}</span> manages a LAIG
              chapter, a sign-in link is on its way. It expires in 15 minutes.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
            >
              <Mail className="h-4 w-4 text-slate-400" />
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu.ng"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Send me a sign-in link"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

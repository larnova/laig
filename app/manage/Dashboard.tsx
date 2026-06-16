"use client";

import { useState } from "react";
import {
  Loader2,
  LogOut,
  UserCog,
  Users,
  CalendarPlus,
  Trash2,
  Plus,
  ShieldCheck,
  CalendarDays,
  Globe,
  Building2,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Repeat2,
  History,
  UserCheck,
  BookOpen,
  BadgeCheck,
  Clock,
  type LucideIcon,
} from "lucide-react";
import type { Chapter, ExecMember, LaigEvent, Adviser } from "../lib/store";

const GRAD_YEARS = Array.from({ length: 7 }, (_, i) => 2026 + i);

const ROLES = [
  "Vice Ambassador",
  "Events Lead",
  "Technical Lead",
  "Community Lead",
  "Partnerships Lead",
  "Secretary",
];

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Dashboard({
  chapter,
  role,
  email,
  isAdmin,
  initialEvents,
  allChapters,
}: {
  chapter: Chapter | null;
  role: string;
  email: string;
  isAdmin: boolean;
  initialEvents: LaigEvent[];
  allChapters: Chapter[];
}) {
  const isAmbassador = role === "Campus Ambassador" && chapter !== null;
  const [activeTab, setActiveTab] = useState("");

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  type Tab = { key: string; label: string; icon: LucideIcon; node: React.ReactNode };
  const tabs = ([
    isAmbassador && chapter && {
      key: "account",
      label: "Account",
      icon: UserCog,
      node: <AccountSection chapter={chapter} />,
    },
    isAmbassador && chapter && {
      key: "team",
      label: "Team",
      icon: Users,
      node: <ExecSection chapter={chapter} />,
    },
    isAmbassador && chapter && {
      key: "advisers",
      label: "Advisers",
      icon: BookOpen,
      node: <AdvisersSection chapter={chapter} />,
    },
    {
      key: "events",
      label: "Events",
      icon: CalendarPlus,
      node: (
        <EventsSection
          chapterName={chapter ? chapter.university : null}
          isAdmin={isAdmin}
          initialEvents={initialEvents}
        />
      ),
    },
    isAmbassador && chapter && {
      key: "handover",
      label: "Handover",
      icon: Repeat2,
      node: <HandoverSection chapter={chapter} />,
    },
    chapter && chapter.alumni.length > 0 && {
      key: "alumni",
      label: "Alumni",
      icon: History,
      node: <AlumniSection chapter={chapter} />,
    },
    isAdmin && {
      key: "chapters",
      label: "Chapters",
      icon: Building2,
      node: <AdminChaptersSection chapters={allChapters} />,
    },
  ] as (Tab | false | null)[]).filter((t): t is Tab => Boolean(t));

  const activeKey = tabs.some((t) => t.key === activeTab) ? activeTab : tabs[0]?.key;
  const isPending = chapter?.status === "pending";

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            {role}
            {isAdmin && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] text-white">
                <ShieldCheck className="h-3 w-3" /> HQ Admin
              </span>
            )}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {chapter ? chapter.university : "LAIG HQ"}
          </h1>
          <p className="text-sm text-slate-500">Signed in as {email}</p>
        </div>
        <button
          onClick={signOut}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      {!chapter && isAdmin && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-slate-700">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
          <p>
            You&apos;re signed in as <strong>LAIG HQ</strong>. You can post and
            manage org-wide events that appear, featured, for the whole community.
          </p>
        </div>
      )}

      {isPending ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Your chapter is awaiting HQ review
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Thanks for starting the {chapter?.university} chapter. LAIG HQ
                reviews every request before it goes live. Once approved, you can
                add your executive team, post events, and recruit members — and
                we&apos;ll let you know. You can close this page in the meantime.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Sub-navigation */}
          <div className="sticky top-16 z-40 -mx-6 mt-6 border-b border-slate-200 bg-white/85 px-6 backdrop-blur">
            <div className="flex gap-1 overflow-x-auto py-2">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = t.key === activeKey;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                      active
                        ? "bg-violet-100 text-violet-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-violet-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panes (kept mounted to preserve form state across tabs) */}
          {tabs.map((t) => (
            <div key={t.key} className={t.key === activeKey ? "" : "hidden"}>
              {t.node}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ── Account ─────────────────────────────────────────────── */
function AccountSection({ chapter }: { chapter: Chapter }) {
  const [form, setForm] = useState({
    ambassadorName: chapter.ambassadorName,
    github: chapter.github,
    linkedin: chapter.linkedin,
    graduationYear: chapter.graduationYear ? String(chapter.graduationYear) : "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    setMsg(
      res.ok && data.ok
        ? { ok: true, text: "Saved." }
        : { ok: false, text: data.error || "Could not save." }
    );
  }

  return (
    <Section icon={<UserCog className="h-5 w-5" />} title="Your account">
      <form onSubmit={save} className="space-y-4">
        <Input
          label="Ambassador name"
          value={form.ambassadorName}
          onChange={(v) => setForm({ ...form, ambassadorName: v })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="GitHub URL"
            value={form.github}
            onChange={(v) => setForm({ ...form, github: v })}
            placeholder="https://github.com/…"
          />
          <Input
            label="LinkedIn URL"
            value={form.linkedin}
            onChange={(v) => setForm({ ...form, linkedin: v })}
            placeholder="https://linkedin.com/in/…"
          />
        </div>
        <div className="sm:max-w-[12rem]">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Expected graduation year
          </label>
          <select
            value={form.graduationYear}
            onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <option value="">Not set</option>
            {GRAD_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
          {msg && (
            <span
              className={`inline-flex items-center gap-1 text-sm ${msg.ok ? "text-emerald-600" : "text-red-600"}`}
            >
              {msg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {msg.text}
            </span>
          )}
        </div>
      </form>
    </Section>
  );
}

/* ── Exec team ───────────────────────────────────────────── */
function ExecSection({ chapter }: { chapter: Chapter }) {
  const [execs, setExecs] = useState<ExecMember[]>(chapter.execs);
  const [form, setForm] = useState({ name: "", email: "", role: ROLES[0] });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    const res = await fetch("/api/execs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Could not add.");
      return;
    }
    setExecs((prev) => [...prev, data.exec]);
    setForm({ name: "", email: "", role: ROLES[0] });
  }

  async function remove(id: string) {
    const prev = execs;
    setExecs((x) => x.filter((m) => m.id !== id));
    const res = await fetch(`/api/execs?id=${id}`, { method: "DELETE" });
    if (!res.ok) setExecs(prev); // revert on failure
  }

  return (
    <Section
      icon={<Users className="h-5 w-5" />}
      title="Executive team"
      subtitle="Add vice ambassadors and leads who help you run the chapter. They can sign in with their email and manage events."
    >
      {execs.length > 0 && (
        <ul className="mb-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {execs.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{m.name}</p>
                <p className="text-xs text-slate-500">
                  {m.role} · {m.email}
                </p>
              </div>
              <button
                onClick={() => remove(m.id)}
                aria-label={`Remove ${m.name}`}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Input
          label="Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="h-[42px] w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          {error && (
            <p className="mb-2 flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add team member
          </button>
        </div>
      </form>
    </Section>
  );
}

/* ── Events ──────────────────────────────────────────────── */
function EventsSection({
  chapterName,
  isAdmin,
  initialEvents,
}: {
  chapterName: string | null;
  isAdmin: boolean;
  initialEvents: LaigEvent[];
}) {
  const hasChapter = chapterName !== null;
  const [events, setEvents] = useState<LaigEvent[]>(initialEvents);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startsAt: "",
    location: "",
    mode: "online",
    link: "",
    scope: hasChapter ? "chapter" : "global",
  });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Could not create event.");
      return;
    }
    setEvents((prev) =>
      [...prev, data.event].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    );
    setForm({
      title: "",
      description: "",
      startsAt: "",
      location: "",
      mode: "online",
      link: "",
      scope: hasChapter ? "chapter" : "global",
    });
  }

  async function remove(id: string) {
    const prev = events;
    setEvents((x) => x.filter((e) => e.id !== id));
    const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    if (!res.ok) setEvents(prev);
  }

  return (
    <Section
      icon={<CalendarPlus className="h-5 w-5" />}
      title="Events"
      subtitle={
        !hasChapter
          ? "Post and manage org-wide events for the whole community."
          : isAdmin
          ? "Post events for your chapter, or org-wide events for the whole community."
          : "Post and manage events for your chapter."
      }
    >
      {events.length > 0 && (
        <ul className="mb-6 space-y-2.5">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                  {e.chapterId === null ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                      <Globe className="h-3 w-3" /> Org-wide
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      <Building2 className="h-3 w-3" /> Chapter
                    </span>
                  )}
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatWhen(e.startsAt)}
                  {e.location ? ` · ${e.location}` : ""} · {e.mode}
                </p>
              </div>
              <button
                onClick={() => remove(e.id)}
                aria-label={`Delete ${e.title}`}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(v) => setForm({ ...form, title: v })}
          placeholder="Workshop: Fine-tuning open models"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            placeholder="What's it about?"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Date &amp; time
            </label>
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Format
            </label>
            <select
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <option value="online">Online</option>
              <option value="in-person">In person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Location / platform"
            value={form.location}
            onChange={(v) => setForm({ ...form, location: v })}
            placeholder="Google Meet, or a venue"
          />
          <Input
            label="Link (optional)"
            value={form.link}
            onChange={(v) => setForm({ ...form, link: v })}
            placeholder="https://…"
          />
        </div>
        {isAdmin && hasChapter && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Visibility
            </label>
            <select
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <option value="chapter">My chapter ({chapterName})</option>
              <option value="global">Org-wide (featured for everyone)</option>
            </select>
          </div>
        )}

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={adding}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add event
        </button>
      </form>
    </Section>
  );
}

/* ── Chapter advisers ────────────────────────────────────── */
function AdvisersSection({ chapter }: { chapter: Chapter }) {
  const [advisers, setAdvisers] = useState<Adviser[]>(chapter.advisers);
  const [form, setForm] = useState({ name: "", title: "", department: "", email: "" });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    const res = await fetch("/api/advisers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Could not add adviser.");
      return;
    }
    setAdvisers((prev) => [...prev, data.adviser]);
    setForm({ name: "", title: "", department: "", email: "" });
  }

  async function remove(id: string) {
    const prev = advisers;
    setAdvisers((x) => x.filter((a) => a.id !== id));
    const res = await fetch(`/api/advisers?id=${id}`, { method: "DELETE" });
    if (!res.ok) setAdvisers(prev);
  }

  const atMax = advisers.length >= 2;

  return (
    <Section
      icon={<BookOpen className="h-5 w-5" />}
      title="Chapter advisers"
      subtitle="A lecturer who backs your chapter adds real academic legitimacy and stays on through ambassador changes. LAIG HQ verifies advisers before they're shown publicly."
    >
      {advisers.length > 0 && (
        <ul className="mb-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {advisers.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">{a.name}</p>
                  {a.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      <Clock className="h-3 w-3" /> Pending HQ
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {a.title} · {a.department} · {a.email}
                </p>
              </div>
              <button
                onClick={() => remove(a.id)}
                aria-label={`Remove ${a.name}`}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {atMax ? (
        <p className="text-sm text-slate-500">
          You&apos;ve added the maximum of 2 advisers.
        </p>
      ) : (
        <form onSubmit={add} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Adviser name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Dr. Amaka Bello" />
            <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Senior Lecturer" />
            <Input label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} placeholder="Computer Science" />
            <Input label="University email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="a.bello@unilag.edu.ng" />
          </div>
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add adviser
          </button>
          <p className="text-xs text-slate-400">
            Please get the lecturer&apos;s consent before listing them.
          </p>
        </form>
      )}
    </Section>
  );
}

/* ── Handover / succession ───────────────────────────────── */
function HandoverSection({ chapter }: { chapter: Chapter }) {
  const [execId, setExecId] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const successor = chapter.execs.find((x) => x.id === execId);

  async function handover() {
    if (!successor) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/handover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ execId }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setBusy(false);
      setError(data.error || "Could not hand over.");
      return;
    }
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/?handover=done";
  }

  return (
    <Section
      icon={<Repeat2 className="h-5 w-5" />}
      title="Hand over the chapter"
      subtitle="Graduating or stepping down? Pass the Campus Ambassador role to a team member. They take over the chapter; you become an alumnus."
    >
      {chapter.execs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Add an executive team member above first — you can only hand over to
          someone already on your team.
        </p>
      ) : !confirming ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Successor
            </label>
            <select
              value={execId}
              onChange={(e) => setExecId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <option value="">Choose a team member…</option>
              {chapter.execs.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} — {x.role}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={!execId}
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-300 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserCheck className="h-4 w-4" />
            Hand over…
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-slate-800">
            Hand <strong>{chapter.university}</strong> to{" "}
            <strong>{successor?.name}</strong> ({successor?.email})? They become
            the new Campus Ambassador. You&apos;ll be recorded as an alumnus and
            will <strong>lose dashboard access</strong>.
          </p>
          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={handover}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Yes, hand over
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirming(false)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ── Alumni ──────────────────────────────────────────────── */
function AlumniSection({ chapter }: { chapter: Chapter }) {
  return (
    <Section
      icon={<History className="h-5 w-5" />}
      title="Chapter alumni"
      subtitle="Past Campus Ambassadors who have handed over or graduated."
    >
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {chapter.alumni.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{a.name}</p>
              <p className="text-xs text-slate-500">{a.email}</p>
            </div>
            <p className="text-right text-xs text-slate-500">
              {a.graduationYear ? `Class of ${a.graduationYear}` : "Alumnus"}
              <br />
              stepped down {new Date(a.steppedDownAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ── HQ admin: review / reassign / delete chapters ───────── */
function AdminChaptersSection({ chapters }: { chapters: Chapter[] }) {
  const [list, setList] = useState<Chapter[]>(chapters);

  // Pending requests first, then alphabetical.
  const sorted = [...list].sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    return a.university.localeCompare(b.university);
  });
  const pendingCount = list.filter((c) => c.status === "pending").length;

  if (list.length === 0) {
    return (
      <Section
        icon={<Building2 className="h-5 w-5" />}
        title="All chapters (HQ)"
        subtitle="Review and approve new chapter requests, reassign ambassadors, or remove a chapter."
      >
        <p className="text-sm text-slate-500">No chapters yet.</p>
      </Section>
    );
  }
  return (
    <Section
      icon={<Building2 className="h-5 w-5" />}
      title="All chapters (HQ)"
      subtitle="Review and approve new chapter requests, reassign ambassadors, or remove a chapter."
    >
      {pendingCount > 0 && (
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800">
          <Clock className="h-4 w-4" />
          {pendingCount} request{pendingCount > 1 ? "s" : ""} awaiting review
        </p>
      )}
      <div className="space-y-3">
        {sorted.map((c) => (
          <ChapterAdminRow
            key={c.id}
            chapter={c}
            onReassigned={(name, emailAddr) =>
              setList((prev) =>
                prev.map((x) =>
                  x.id === c.id
                    ? { ...x, ambassadorName: name, ambassadorEmail: emailAddr }
                    : x
                )
              )
            }
            onApproved={() =>
              setList((prev) =>
                prev.map((x) => (x.id === c.id ? { ...x, status: "approved" } : x))
              )
            }
            onDeleted={() => setList((prev) => prev.filter((x) => x.id !== c.id))}
          />
        ))}
      </div>
    </Section>
  );
}

function ChapterAdminRow({
  chapter,
  onReassigned,
  onApproved,
  onDeleted,
}: {
  chapter: Chapter;
  onReassigned: (name: string, email: string) => void;
  onApproved: () => void;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [execId, setExecId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [advisers, setAdvisers] = useState<Adviser[]>(chapter.advisers);
  const [working, setWorking] = useState<"approve" | "delete" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isPending = chapter.status === "pending";

  async function approve() {
    setWorking("approve");
    const res = await fetch("/api/admin/approve-chapter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterId: chapter.id }),
    });
    setWorking(null);
    if (res.ok) onApproved();
  }

  async function del() {
    setWorking("delete");
    const res = await fetch("/api/admin/delete-chapter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterId: chapter.id }),
    });
    setWorking(null);
    if (res.ok) onDeleted();
  }

  async function toggleVerify(a: Adviser) {
    const next = !a.verified;
    setAdvisers((prev) => prev.map((x) => (x.id === a.id ? { ...x, verified: next } : x)));
    const res = await fetch("/api/admin/verify-adviser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterId: chapter.id, adviserId: a.id, verified: next }),
    });
    if (!res.ok)
      setAdvisers((prev) => prev.map((x) => (x.id === a.id ? { ...x, verified: a.verified } : x)));
  }

  async function reassign(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = execId ? { chapterId: chapter.id, execId } : { chapterId: chapter.id, name, email };
    const res = await fetch("/api/admin/reassign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Could not reassign.");
      return;
    }
    onReassigned(data.ambassador.name, data.ambassador.email);
    setDone(true);
    setOpen(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{chapter.university}</p>
            {isPending ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                <Clock className="h-3 w-3" /> Pending review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <BadgeCheck className="h-3 w-3" /> Live
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {chapter.ambassadorName} · {chapter.ambassadorEmail}
            {chapter.graduationYear ? ` · Class of ${chapter.graduationYear}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isPending && (
            <button
              type="button"
              onClick={approve}
              disabled={working !== null}
              className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
            >
              {working === "approve" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Approve
            </button>
          )}
          {!isPending && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              {open ? "Cancel" : "Reassign"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label={`Delete ${chapter.university}`}
            className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <span>
            Delete <strong>{chapter.university}</strong> and its events? This
            can&apos;t be undone.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={del}
              disabled={working !== null}
              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {working === "delete" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {advisers.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Chapter advisers
          </p>
          {advisers.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-600">
                <span className="font-medium text-slate-800">{a.name}</span> · {a.title},{" "}
                {a.department} · {a.email}
              </p>
              <button
                type="button"
                onClick={() => toggleVerify(a)}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  a.verified
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                }`}
              >
                {a.verified ? (
                  <>
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" /> Verify
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {done && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Ambassador reassigned.
        </p>
      )}

      {open && (
        <form onSubmit={reassign} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          {chapter.execs.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Promote an exec
              </label>
              <select
                value={execId}
                onChange={(e) => setExecId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <option value="">— choose exec —</option>
                {chapter.execs.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name} ({x.role})
                  </option>
                ))}
              </select>
            </div>
          )}
          {!execId && (
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New ambassador name"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="new@email.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              />
            </div>
          )}
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
            Make ambassador
          </button>
        </form>
      )}
    </div>
  );
}

/* ── Shared bits ─────────────────────────────────────────── */
function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      />
    </div>
  );
}

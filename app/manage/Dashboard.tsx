"use client";

import { useState, useEffect } from "react";
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
  X,
  type LucideIcon,
} from "lucide-react";
import type { Chapter, ExecMember, LaigEvent, Adviser } from "../lib/store";
import { nextOccurrence, recurrenceDaysLabel, WEEKDAY_ABBR } from "../lib/recurrence";

const GRAD_YEARS = Array.from({ length: 7 }, (_, i) => 2026 + i);

const ROLES = [
  "Vice Ambassador",
  "Events Lead",
  "Technical Lead",
  "Community Lead",
  "Partnerships Lead",
  "Secretary",
];

function formatWhen(when: string | Date) {
  return new Date(when).toLocaleString(undefined, {
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
                add your executive team, post events, and recruit members, and
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
    recurrence: "none",
    recurrenceEnd: "",
    daysOfWeek: [] as number[],
  });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(day: number) {
    setForm((f) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day)
        ? f.daysOfWeek.filter((d) => d !== day)
        : [...f.daysOfWeek, day],
    }));
  }

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
      recurrence: "none",
      recurrenceEnd: "",
      daysOfWeek: [],
    });
  }

  async function remove(id: string, series: boolean) {
    const prev = events;
    const event = events.find((e) => e.id === id);
    setEvents((x) =>
      series && event?.seriesId
        ? x.filter((e) => !(e.seriesId === event.seriesId && e.startsAt >= event.startsAt))
        : x.filter((e) => e.id !== id)
    );
    const res = await fetch(`/api/events?id=${id}${series ? "&series=true" : ""}`, {
      method: "DELETE",
    });
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
          {events.map((e) => {
            const isWeekly = e.recurrence === "weekly";
            const occursAt = isWeekly ? nextOccurrence(e) : new Date(e.startsAt);
            return (
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
                    {(isWeekly || e.seriesId) && (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          <Repeat2 className="h-3 w-3" /> Weekly
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          <CalendarDays className="h-3 w-3" />
                          {recurrenceDaysLabel(e)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {occursAt ? `Next: ${formatWhen(occursAt)}` : "Series ended"}
                    {e.location ? ` · ${e.location}` : ""} · {e.mode}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {e.seriesId && (
                    <button
                      onClick={() => remove(e.id, true)}
                      className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      Cancel series
                    </button>
                  )}
                  <button
                    onClick={() => remove(e.id, false)}
                    aria-label={
                      isWeekly ? `Delete ${e.title} and all future occurrences` : `Delete ${e.title}`
                    }
                    title={isWeekly ? "Deletes this and all future occurrences" : undefined}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
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

        <div className="rounded-xl border border-slate-200 p-3.5">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.recurrence === "weekly"}
              onChange={(e) =>
                setForm({ ...form, recurrence: e.target.checked ? "weekly" : "none" })
              }
              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            <Repeat2 className="h-4 w-4 text-violet-500" />
            Repeats weekly
          </label>
          {form.recurrence === "weekly" && (
            <div className="mt-3 space-y-3">
              <div>
                <p className="mb-1.5 text-xs text-slate-500">
                  Repeat on (defaults to the Date &amp; time field&apos;s own day if none picked)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAY_ABBR.map((label, day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        form.daysOfWeek.includes(day)
                          ? "bg-violet-600 text-white"
                          : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="recurrenceEnd" className="text-xs text-slate-500">
                  Until (optional)
                </label>
                <input
                  id="recurrenceEnd"
                  type="date"
                  value={form.recurrenceEnd}
                  onChange={(e) => setForm({ ...form, recurrenceEnd: e.target.value })}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                />
                <span className="text-xs text-slate-500">
                  same time every occurrence. Leave blank to repeat indefinitely.
                </span>
              </div>
            </div>
          )}
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
          Add an executive team member above first. You can only hand over to
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
                  {x.name} - {x.role}
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
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ university: "", ambassadorName: "", ambassadorEmail: "", github: "", linkedin: "" });
  const [error, setError] = useState<string | null>(null);

  // Pending requests first, then alphabetical.
  const sorted = [...list].sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    return a.university.localeCompare(b.university);
  });
  const pendingCount = list.filter((c) => c.status === "pending").length;

  async function createChapter(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    const res = await fetch("/api/admin/create-chapter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Could not create chapter.");
      return;
    }
    setList((prev) => [...prev, data.chapter]);
    setForm({ university: "", ambassadorName: "", ambassadorEmail: "", github: "", linkedin: "" });
    setIsOpen(false);
  }

  return (
    <Section
      icon={<Building2 className="h-5 w-5" />}
      title="All chapters (HQ)"
      subtitle="Manage student chapters and ambassadors."
      action={
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setError(null);
          }}
          title="Create Chapter"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 p-2 sm:px-4 sm:py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Chapter</span>
        </button>
      }
    >
      {pendingCount > 0 && (
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800">
          <Clock className="h-4 w-4" />
          {pendingCount} request{pendingCount > 1 ? "s" : ""} awaiting review
        </p>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl relative animate-scale-up">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="mb-1 text-lg font-bold text-slate-900">Directly Create Chapter</h3>
            <p className="mb-4 text-xs text-slate-500">Create an approved student chapter instantly.</p>
            
            <form onSubmit={createChapter} className="space-y-4">
              <Input label="University" value={form.university} onChange={(v) => setForm({ ...form, university: v })} placeholder="University of Lagos" />
              <Input label="Ambassador Name" value={form.ambassadorName} onChange={(v) => setForm({ ...form, ambassadorName: v })} placeholder="Ada Lovelace" />
              <Input label="Ambassador Email" type="email" value={form.ambassadorEmail} onChange={(v) => setForm({ ...form, ambassadorEmail: v })} placeholder="ada@unilag.edu.ng" />
              <Input label="GitHub Profile URL (optional)" value={form.github} onChange={(v) => setForm({ ...form, github: v })} placeholder="https://github.com/username" />
              <Input label="LinkedIn Profile URL (optional)" value={form.linkedin} onChange={(v) => setForm({ ...form, linkedin: v })} placeholder="https://linkedin.com/in/username" />
              
              {error && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60 cursor-pointer"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create Approved Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <p className="text-sm text-slate-500">No chapters yet.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((c) => (
            <ChapterAdminRow
              key={c.id}
              chapter={c}
              onUpdated={(updatedChapter) =>
                setList((prev) =>
                  prev.map((x) => (x.id === updatedChapter.id ? updatedChapter : x))
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
      )}
    </Section>
  );
}

function ChapterAdminRow({
  chapter,
  onUpdated,
  onApproved,
  onDeleted,
}: {
  chapter: Chapter;
  onUpdated: (chapter: Chapter) => void;
  onApproved: () => void;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [execId, setExecId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    university: chapter.university,
    ambassadorName: chapter.ambassadorName,
    ambassadorEmail: chapter.ambassadorEmail,
    github: chapter.github || "",
    linkedin: chapter.linkedin || "",
    graduationYear: chapter.graduationYear ? String(chapter.graduationYear) : "",
  });
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editDone, setEditDone] = useState(false);

  const [advisers, setAdvisers] = useState<Adviser[]>(chapter.advisers);
  const [working, setWorking] = useState<"approve" | "delete" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isPending = chapter.status === "pending";
  // Pending applications start expanded so HQ sees the motivation immediately.
  const [showApp, setShowApp] = useState(isPending);

  // Sync state if chapter prop changes
  useEffect(() => {
    setEditForm({
      university: chapter.university,
      ambassadorName: chapter.ambassadorName,
      ambassadorEmail: chapter.ambassadorEmail,
      github: chapter.github || "",
      linkedin: chapter.linkedin || "",
      graduationYear: chapter.graduationYear ? String(chapter.graduationYear) : "",
    });
  }, [chapter]);

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
    onUpdated(data.chapter);
    setDone(true);
    setOpen(false);
  }

  async function editAmbassador(e: React.FormEvent) {
    e.preventDefault();
    setEditBusy(true);
    setEditError(null);
    setEditDone(false);
    const res = await fetch("/api/admin/edit-ambassador", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterId: chapter.id,
        university: editForm.university,
        ambassadorName: editForm.ambassadorName,
        ambassadorEmail: editForm.ambassadorEmail,
        github: editForm.github,
        linkedin: editForm.linkedin,
        graduationYear: editForm.graduationYear ? Number(editForm.graduationYear) : null,
      }),
    });
    const data = await res.json();
    setEditBusy(false);
    if (!res.ok || !data.ok) {
      setEditError(data.error || "Could not update ambassador info.");
      return;
    }
    onUpdated(data.chapter);
    setEditDone(true);
    setEditOpen(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
          {(chapter.github || chapter.linkedin) && (
            <div className="mt-1 flex gap-2 text-xs">
              {chapter.github && (
                <a
                  href={chapter.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-violet-700 hover:underline"
                >
                  GitHub ↗
                </a>
              )}
              {chapter.github && chapter.linkedin && <span className="text-slate-300">·</span>}
              {chapter.linkedin && (
                <a
                  href={chapter.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-violet-700 hover:underline"
                >
                  LinkedIn ↗
                </a>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
          {chapter.motivation && (
            <button
              type="button"
              onClick={() => setShowApp((o) => !o)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {showApp ? "Hide" : "Application"}
            </button>
          )}
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
            <>
              <button
                type="button"
                onClick={() => {
                  setEditOpen((o) => !o);
                  setOpen(false);
                  setEditError(null);
                }}
                title={editOpen ? "Cancel Edit" : "Edit Info"}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {editOpen ? <X className="h-3.5 w-3.5" /> : <UserCog className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">
                  {editOpen ? "Cancel Edit" : "Edit Info"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen((o) => !o);
                  setEditOpen(false);
                  setError(null);
                }}
                title={open ? "Cancel Reassign" : "Reassign"}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {open ? <X className="h-3.5 w-3.5" /> : <Repeat2 className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">
                  {open ? "Cancel" : "Reassign"}
                </span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label={`Delete ${chapter.university}`}
            className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showApp && chapter.motivation && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Why they applied
          </p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {chapter.motivation}
          </p>
        </div>
      )}

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
              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 cursor-pointer"
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
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
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

      {editDone && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Ambassador details saved.
        </p>
      )}

      {editOpen && (
        <form onSubmit={editAmbassador} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Edit Chapter Info</h4>
          <input
            value={editForm.university}
            onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
            placeholder="University Name"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-violet-400 focus:outline-none"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={editForm.ambassadorName}
              onChange={(e) => setEditForm({ ...editForm, ambassadorName: e.target.value })}
              placeholder="Ambassador Name"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none"
            />
            <input
              type="email"
              value={editForm.ambassadorEmail}
              onChange={(e) => setEditForm({ ...editForm, ambassadorEmail: e.target.value })}
              placeholder="Ambassador Email"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none"
            />
            <input
              value={editForm.github}
              onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
              placeholder="GitHub Profile URL (optional)"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none"
            />
            <input
              value={editForm.linkedin}
              onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
              placeholder="LinkedIn Profile URL (optional)"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Expected Graduation Year</label>
            <select
              value={editForm.graduationYear}
              onChange={(e) => setEditForm({ ...editForm, graduationYear: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none"
            >
              <option value="">Not set</option>
              {GRAD_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {editError && (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {editError}
            </p>
          )}
          <button
            type="submit"
            disabled={editBusy}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60 cursor-pointer"
          >
            {editBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
            Save Details
          </button>
        </form>
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
                <option value="">Choose executive...</option>
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
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60 cursor-pointer"
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
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex justify-between gap-4 items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
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

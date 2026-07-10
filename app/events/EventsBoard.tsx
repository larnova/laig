"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Globe,
  Building2,
  ArrowUpRight,
  Star,
  Repeat2,
} from "lucide-react";
import type { LaigEvent } from "../lib/store";
import { nextOccurrence, recurrenceDaysLabel } from "../lib/recurrence";

function formatWhen(when: string | Date): string {
  return new Date(when).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const modeStyles: Record<LaigEvent["mode"], string> = {
  online: "bg-violet-100 text-violet-700",
  "in-person": "bg-emerald-100 text-emerald-700",
  hybrid: "bg-amber-100 text-amber-700",
};

type Occurrence = { event: LaigEvent; occursAt: Date };

export default function EventsBoard({ events }: { events: LaigEvent[] }) {
  const [chapter, setChapter] = useState<string>("all");

  const now = Date.now();
  const upcoming = useMemo(() => {
    // One card per event — a recurring event shows its next occurrence
    // instead of every future week.
    const from = new Date(now - 12 * 3600 * 1000);
    const occurrences: Occurrence[] = [];
    for (const event of events) {
      const occursAt = nextOccurrence(event, from);
      if (occursAt) occurrences.push({ event, occursAt });
    }
    return occurrences.sort((a, b) => a.occursAt.getTime() - b.occursAt.getTime());
  }, [events, now]);

  const chapterNames = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => e.chapterName && set.add(e.chapterName));
    return Array.from(set).sort();
  }, [events]);

  const filtered = upcoming.filter(({ event }) => {
    if (chapter === "all") return true;
    if (chapter === "hq") return event.chapterId === null;
    return event.chapterName === chapter;
  });

  if (upcoming.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          No upcoming events yet
        </h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
          Chapters and LAIG HQ post events here. Check back soon, or join a
          chapter to get them in your inbox.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <FilterChip active={chapter === "all"} onClick={() => setChapter("all")}>
          All
        </FilterChip>
        <FilterChip active={chapter === "hq"} onClick={() => setChapter("hq")}>
          LAIG HQ
        </FilterChip>
        {chapterNames.map((name) => (
          <FilterChip
            key={name}
            active={chapter === name}
            onClick={() => setChapter(name)}
          >
            {name}
          </FilterChip>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {filtered.map(({ event: e, occursAt }) => (
          <article
            key={e.id}
            className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
              e.featured ? "border-violet-300 ring-1 ring-violet-200" : "border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${modeStyles[e.mode]}`}
              >
                {e.mode}
              </span>
              {e.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                  <Star className="h-3 w-3" />
                  Featured
                </span>
              )}
              {e.recurrence === "weekly" && (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    <Repeat2 className="h-3 w-3" />
                    Weekly
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    <CalendarDays className="h-3 w-3" />
                    {recurrenceDaysLabel(e)}
                  </span>
                </>
              )}
            </div>

            <h3 className="mt-3 text-lg font-bold text-slate-900">{e.title}</h3>
            {e.description && (
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {e.description}
              </p>
            )}

            <dl className="mt-4 space-y-1.5 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-violet-500" />
                {formatWhen(occursAt)}
              </div>
              {e.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-violet-500" />
                  {e.location}
                </div>
              )}
              <div className="flex items-center gap-2">
                {e.chapterId === null ? (
                  <>
                    <Globe className="h-4 w-4 text-violet-500" />
                    LAIG HQ - org-wide
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 text-violet-500" />
                    {e.chapterName}
                  </>
                )}
              </div>
            </dl>

            {e.link && (
              <a
                href={e.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                Details &amp; RSVP
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
        active
          ? "bg-violet-600 text-white"
          : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

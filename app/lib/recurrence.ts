/**
 * Pure recurrence math, kept separate from store.ts (which pulls in
 * @netlify/blobs and Node's fs/path) so client components can compute
 * occurrence dates without bundling server-only dependencies.
 */

export type RecurrenceInfo = {
  startsAt: string;
  recurrence: "none" | "weekly";
  recurrenceEnd: string | null;
  /** 0=Sunday..6=Saturday. Null/empty = repeats only on startsAt's own weekday. */
  daysOfWeek: number[] | null;
};

function activeDays(event: RecurrenceInfo): number[] {
  if (event.daysOfWeek && event.daysOfWeek.length > 0) {
    return [...new Set(event.daysOfWeek)];
  }
  return [new Date(event.startsAt).getDay()];
}

/**
 * The next occurrence of `event` at or after `from` — its own startsAt for a
 * one-off event, or the next matching weekday for a recurring one (which may
 * repeat on several days a week). Returns null once a recurring event's
 * `recurrenceEnd` has passed, or it hasn't started yet relative to `from`.
 */
export function nextOccurrence(event: RecurrenceInfo, from: Date = new Date()): Date | null {
  const anchor = new Date(event.startsAt);
  if (event.recurrence !== "weekly") return anchor;

  const end = event.recurrenceEnd ? new Date(event.recurrenceEnd) : null;
  const days = activeDays(event);
  const start = from.getTime() > anchor.getTime() ? from : anchor;

  // Scan the next 8 calendar days for the earliest one that (a) matches one
  // of the active weekdays, (b) is on/after the search window, and (c) is
  // on/after the series' own start date. 8, not 7: if `start`'s own weekday
  // matches but its time-of-day has already passed, the next match for a
  // single-weekday series is a full 7 days later (day 7 in this loop).
  for (let i = 0; i < 8; i++) {
    const candidate = new Date(start);
    candidate.setDate(candidate.getDate() + i);
    candidate.setHours(anchor.getHours(), anchor.getMinutes(), anchor.getSeconds(), anchor.getMilliseconds());

    if (candidate.getTime() < start.getTime()) continue;
    if (!days.includes(candidate.getDay())) continue;
    if (candidate.getTime() < anchor.getTime()) continue;
    if (end && candidate.getTime() > end.getTime()) return null;
    return candidate;
  }
  return null;
}

const WEEKDAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const WEEKDAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** e.g. "Monday" for a single recurring day, "Mon, Wed, Fri" for several. */
export function recurrenceDaysLabel(event: RecurrenceInfo): string {
  const days = activeDays(event).sort((a, b) => a - b);
  if (days.length === 1) return WEEKDAY_LONG[days[0]];
  return days.map((d) => WEEKDAY_ABBR[d]).join(", ");
}

export { WEEKDAY_LONG, WEEKDAY_ABBR };

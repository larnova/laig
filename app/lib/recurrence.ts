/**
 * Pure recurrence math, kept separate from store.ts (which pulls in
 * @netlify/blobs and Node's fs/path) so client components can compute
 * occurrence dates without bundling server-only dependencies.
 */

export type RecurrenceInfo = {
  startsAt: string;
  recurrence: "none" | "weekly";
  recurrenceEnd: string | null;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * The next occurrence of `event` at or after `from` — its own startsAt for a
 * one-off event, or the next weekly-cadence date for a recurring one. Returns
 * null once a recurring event's `recurrenceEnd` has passed.
 */
export function nextOccurrence(event: RecurrenceInfo, from: Date = new Date()): Date | null {
  const anchor = new Date(event.startsAt);
  if (event.recurrence !== "weekly") return anchor;

  const end = event.recurrenceEnd ? new Date(event.recurrenceEnd) : null;
  const diff = from.getTime() - anchor.getTime();
  const next = diff > 0 ? new Date(anchor.getTime() + Math.ceil(diff / WEEK_MS) * WEEK_MS) : anchor;

  if (end && next.getTime() > end.getTime()) return null;
  return next;
}

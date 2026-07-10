import { getManager } from "../../lib/auth";
import { getEvents, saveEvents, type LaigEvent } from "../../lib/store";

export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const MODES = ["online", "in-person", "hybrid"] as const;

// Public: list events sorted by start time.
export async function GET() {
  const events = await getEvents();
  events.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return Response.json({ events });
}

export async function POST(request: Request) {
  const mgr = await getManager();
  if (!mgr) return Response.json({ ok: false, error: "Not authorized." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const title = str(body.title);
  const description = str(body.description);
  const startsAt = str(body.startsAt);
  const location = str(body.location);
  const link = str(body.link);
  const mode = MODES.includes(body.mode) ? body.mode : "online";
  const scope = str(body.scope) === "global" ? "global" : "chapter";
  const recurrence = body.recurrence === "weekly" ? "weekly" : "none";
  const recurrenceEndRaw = str(body.recurrenceEnd);
  const recurrenceEnd =
    recurrence === "weekly" && recurrenceEndRaw && !Number.isNaN(Date.parse(recurrenceEndRaw))
      ? new Date(recurrenceEndRaw).toISOString()
      : null;
  const daysOfWeekRaw: unknown[] = Array.isArray(body.daysOfWeek) ? body.daysOfWeek : [];
  const isValidDay = (d: unknown): d is number => typeof d === "number" && Number.isInteger(d) && d >= 0 && d <= 6;
  const daysOfWeekSet = [...new Set(daysOfWeekRaw.filter(isValidDay))];
  const daysOfWeek = recurrence === "weekly" && daysOfWeekSet.length > 0 ? daysOfWeekSet : null;

  if (!title) return Response.json({ ok: false, error: "Title is required." }, { status: 400 });
  if (!startsAt || Number.isNaN(Date.parse(startsAt)))
    return Response.json({ ok: false, error: "A valid date & time is required." }, { status: 400 });
  if (link && !/^https?:\/\//i.test(link))
    return Response.json({ ok: false, error: "Link must start with http(s)://" }, { status: 400 });

  if (scope === "global" && !mgr.isAdmin)
    return Response.json(
      { ok: false, error: "Only LAIG HQ can post org-wide events." },
      { status: 403 }
    );

  const isGlobal = scope === "global";
  let chapterId: string | null = null;
  let chapterName: string | null = null;
  if (!isGlobal) {
    if (!mgr.chapter)
      return Response.json(
        { ok: false, error: "You don't manage a chapter. Post an org-wide event instead." },
        { status: 400 }
      );
    chapterId = mgr.chapter.id;
    chapterName = mgr.chapter.university;
  }

  const event: LaigEvent = {
    id: crypto.randomUUID(),
    title,
    description,
    startsAt: new Date(startsAt).toISOString(),
    location,
    mode,
    link,
    chapterId,
    chapterName,
    featured: isGlobal,
    createdByEmail: mgr.email,
    createdAt: new Date().toISOString(),
    seriesId: null,
    recurrence,
    recurrenceEnd,
    daysOfWeek,
  };

  const events = await getEvents();
  events.push(event);
  await saveEvents(events);

  return Response.json({ ok: true, event });
}

export async function DELETE(request: Request) {
  const mgr = await getManager();
  if (!mgr) return Response.json({ ok: false, error: "Not authorized." }, { status: 401 });

  const url = new URL(request.url);
  const id = str(url.searchParams.get("id") || "");
  const wholeSeries = url.searchParams.get("series") === "true";
  if (!id) return Response.json({ ok: false, error: "Missing event id." }, { status: 400 });

  const events = await getEvents();
  const event = events.find((e) => e.id === id);
  if (!event) return Response.json({ ok: false, error: "Event not found." }, { status: 404 });

  const ownsChapterEvent = mgr.chapter !== null && event.chapterId === mgr.chapter.id;
  if (!mgr.isAdmin && !ownsChapterEvent)
    return Response.json({ ok: false, error: "You can't remove this event." }, { status: 403 });

  // "Delete whole series" removes this occurrence and every future one that
  // shares its seriesId, leaving past occurrences (and their reminder
  // history) untouched.
  const removeIds =
    wholeSeries && event.seriesId
      ? new Set(
          events
            .filter((e) => e.seriesId === event.seriesId && e.startsAt >= event.startsAt)
            .map((e) => e.id)
        )
      : new Set([id]);

  await saveEvents(events.filter((e) => !removeIds.has(e.id)));
  return Response.json({ ok: true, removed: removeIds.size });
}

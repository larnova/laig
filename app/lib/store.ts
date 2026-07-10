import { getStore, type Store } from "@netlify/blobs";
import { promises as fs } from "fs";
import path from "path";
import { nextOccurrence } from "./recurrence";

export { nextOccurrence };

/**
 * Netlify Blobs is the source of truth in production. When the app runs on
 * Netlify (or via `netlify dev`) the runtime injects credentials automatically.
 * Under a plain `next dev` there is no Netlify context, so we transparently fall
 * back to a local JSON store on disk (`.laig-data/`).
 */

// ── Types ──────────────────────────────────────────────────────────

export type ExecMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  addedAt: string;
};

export type Alumnus = {
  id: string;
  name: string;
  email: string;
  graduationYear: number | null;
  steppedDownAt: string;
};

export type Adviser = {
  id: string;
  name: string;
  title: string; // e.g. "Senior Lecturer"
  department: string;
  email: string;
  verified: boolean; // verified by LAIG HQ
  addedAt: string;
};

export type ChapterStatus = "pending" | "approved";

export type Chapter = {
  id: string;
  university: string;
  ambassadorName: string;
  ambassadorEmail: string;
  github: string;
  linkedin: string;
  motivation: string; // why they applied — shown to HQ during review
  createdAt: string;
  status: ChapterStatus; // "pending" until LAIG HQ approves the request
  graduationYear: number | null; // current ambassador's expected graduation
  execs: ExecMember[];
  alumni: Alumnus[]; // past ambassadors who handed over / graduated
  advisers: Adviser[]; // chapter advisers (added by ambassador, verified by HQ)
};

export type MemberRecord = {
  id: string;
  fullName: string;
  email: string;
  chapterId: string;
  university: string;
  department: string;
  level: string;
  createdAt: string;
};

export type LaigEvent = {
  id: string;
  title: string;
  description: string;
  startsAt: string; // ISO datetime — the anchor/first occurrence
  location: string;
  mode: "online" | "in-person" | "hybrid";
  link: string;
  chapterId: string | null; // null = HQ / org-wide
  chapterName: string | null;
  featured: boolean;
  createdByEmail: string;
  createdAt: string;
  /** @deprecated legacy: grouped pre-generated batches from an earlier
   *  "repeats weekly" implementation that duplicated N rows up front.
   *  Kept only so old batches remain bulk-deletable; new events don't set it. */
  seriesId: string | null;
  recurrence: "none" | "weekly";
  recurrenceEnd: string | null; // ISO date; null = repeats indefinitely
  daysOfWeek: number[] | null; // 0=Sunday..6=Saturday; null = just startsAt's own weekday
};

export type MagicToken = { email: string; expiresAt: number };
export type Session = { email: string; expiresAt: number };

const STORE_NAME = "laig";
const DATA_DIR = path.join(process.cwd(), ".laig-data");

// ── Generic KV (Blobs in prod, local files in dev) ─────────────────

function netlifyStore(): Store | null {
  try {
    return getStore({ name: STORE_NAME, consistency: "strong" });
  } catch {
    return null;
  }
}

function keyToFile(key: string): string {
  // "magic:abc" -> ".laig-data/magic/abc.json"; "chapters" -> "chapters.json"
  return path.join(DATA_DIR, ...key.split(":")) + ".json";
}

async function kvGet<T>(key: string, fallback: T): Promise<T> {
  const store = netlifyStore();
  if (store) {
    const data = await store.get(key, { type: "json" });
    return (data as T) ?? fallback;
  }
  try {
    return JSON.parse(await fs.readFile(keyToFile(key), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function kvSet(key: string, value: unknown): Promise<void> {
  const store = netlifyStore();
  if (store) {
    await store.setJSON(key, value);
    return;
  }
  const file = keyToFile(key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

async function kvDelete(key: string): Promise<void> {
  const store = netlifyStore();
  if (store) {
    await store.delete(key);
    return;
  }
  await fs.rm(keyToFile(key), { force: true });
}

// ── Helpers ────────────────────────────────────────────────────────

export function normalizeUniversity(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Chapters
export async function getChapters(): Promise<Chapter[]> {
  const chapters = await kvGet<Chapter[]>("chapters", []);
  // Back-compat: ensure newer fields exist on older records.
  return chapters.map((c) => ({
    ...c,
    execs: c.execs ?? [],
    alumni: c.alumni ?? [],
    advisers: c.advisers ?? [],
    graduationYear: c.graduationYear ?? null,
    motivation: c.motivation ?? "",
    // Chapters created before the approval flow are treated as approved.
    status: c.status ?? "approved",
  }));
}

export async function saveChapters(chapters: Chapter[]): Promise<void> {
  await kvSet("chapters", chapters);
}

/** Delete a chapter and any events that belong to it. */
export async function deleteChapter(chapterId: string): Promise<void> {
  const chapters = await getChapters();
  await saveChapters(chapters.filter((c) => c.id !== chapterId));
  const events = await getEvents();
  const remaining = events.filter((e) => e.chapterId !== chapterId);
  if (remaining.length !== events.length) await saveEvents(remaining);
}

/** Find the chapter a person manages, by ambassador email or exec email. */
export async function getChapterForEmail(
  email: string
): Promise<{ chapter: Chapter; role: string } | null> {
  const e = normalizeEmail(email);
  const chapters = await getChapters();
  for (const chapter of chapters) {
    if (normalizeEmail(chapter.ambassadorEmail) === e) {
      return { chapter, role: "Campus Ambassador" };
    }
    const exec = chapter.execs.find((x) => normalizeEmail(x.email) === e);
    if (exec) return { chapter, role: exec.role };
  }
  return null;
}

export async function saveMember(member: MemberRecord): Promise<void> {
  await kvSet(`member:${member.id}`, member);
}

/** Every campus ambassador + exec across approved chapters, deduplicated by email. */
export async function getAllChapterContacts(): Promise<{ email: string; name: string }[]> {
  const chapters = await getChapters();
  const seen = new Map<string, string>();
  for (const c of chapters) {
    if (c.status !== "approved") continue;
    if (c.ambassadorEmail && !seen.has(normalizeEmail(c.ambassadorEmail))) {
      seen.set(normalizeEmail(c.ambassadorEmail), c.ambassadorName);
    }
    for (const exec of c.execs) {
      if (exec.email && !seen.has(normalizeEmail(exec.email))) {
        seen.set(normalizeEmail(exec.email), exec.name);
      }
    }
  }
  return Array.from(seen, ([email, name]) => ({ email, name }));
}

/**
 * The org-wide "meetup" event whose next occurrence falls today (Africa/Lagos
 * calendar date). Works for one-off events and for weekly recurring ones —
 * a recurring event has exactly one stored record, so this computes today's
 * occurrence rather than matching a literal stored startsAt.
 */
export async function getTodaysGlobalMeetup(): Promise<{ event: LaigEvent; occursAt: Date } | null> {
  const events = await getEvents();
  const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" });
  const today = dateFormatter.format(new Date());
  // Look back a day so an event that started a few hours ago (before this
  // function runs) still resolves to "today's" occurrence, not next week's.
  const lookback = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const candidates = events
    .filter((e) => e.chapterId === null)
    .filter((e) => e.title.toLowerCase().includes("meetup"))
    .map((event) => {
      const occursAt = nextOccurrence(event, lookback);
      return occursAt ? { event, occursAt } : null;
    })
    .filter((x): x is { event: LaigEvent; occursAt: Date } => x !== null)
    .filter((x) => dateFormatter.format(x.occursAt) === today);

  candidates.sort((a, b) => a.occursAt.getTime() - b.occursAt.getTime());
  return candidates[0] ?? null;
}

// Events
export async function getEvents(): Promise<LaigEvent[]> {
  const events = await kvGet<LaigEvent[]>("events", []);
  // Back-compat: events created before recurrence support have no seriesId
  // (legacy field) or recurrence/recurrenceEnd/daysOfWeek (new fields).
  return events.map((e) => ({
    ...e,
    seriesId: e.seriesId ?? null,
    recurrence: e.recurrence ?? "none",
    recurrenceEnd: e.recurrenceEnd ?? null,
    daysOfWeek: e.daysOfWeek ?? null,
  }));
}

export async function saveEvents(events: LaigEvent[]): Promise<void> {
  await kvSet("events", events);
}

// Magic tokens (one-time login links)
export async function createMagicToken(email: string): Promise<string> {
  const token = crypto.randomUUID();
  const fifteenMin = 15 * 60 * 1000;
  await kvSet(`magic:${token}`, {
    email: normalizeEmail(email),
    expiresAt: Date.now() + fifteenMin,
  } satisfies MagicToken);
  return token;
}

/** Validate + consume a magic token. Returns the email or null. */
export async function consumeMagicToken(token: string): Promise<string | null> {
  const rec = await kvGet<MagicToken | null>(`magic:${token}`, null);
  await kvDelete(`magic:${token}`); // single use
  if (!rec || rec.expiresAt < Date.now()) return null;
  return rec.email;
}

// Sessions
export async function createSession(email: string): Promise<string> {
  const id = crypto.randomUUID();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  await kvSet(`session:${id}`, {
    email: normalizeEmail(email),
    expiresAt: Date.now() + thirtyDays,
  } satisfies Session);
  return id;
}

export async function getSession(id: string): Promise<Session | null> {
  const rec = await kvGet<Session | null>(`session:${id}`, null);
  if (!rec || rec.expiresAt < Date.now()) return null;
  return rec;
}

export async function deleteSession(id: string): Promise<void> {
  await kvDelete(`session:${id}`);
}

import { getStore, type Store } from "@netlify/blobs";
import { promises as fs } from "fs";
import path from "path";

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

export type Chapter = {
  id: string;
  university: string;
  ambassadorName: string;
  ambassadorEmail: string;
  github: string;
  linkedin: string;
  createdAt: string;
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
  startsAt: string; // ISO datetime
  location: string;
  mode: "online" | "in-person" | "hybrid";
  link: string;
  chapterId: string | null; // null = HQ / org-wide
  chapterName: string | null;
  featured: boolean;
  createdByEmail: string;
  createdAt: string;
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
  }));
}

export async function saveChapters(chapters: Chapter[]): Promise<void> {
  await kvSet("chapters", chapters);
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

// Events
export async function getEvents(): Promise<LaigEvent[]> {
  return kvGet<LaigEvent[]>("events", []);
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

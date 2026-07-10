import { cookies } from "next/headers";
import {
  getSession,
  getChapterForEmail,
  normalizeEmail,
  type Chapter,
} from "./store";

export const SESSION_COOKIE = "laig_session";

/** Admins can post org-wide / featured events. */
export function isAdmin(email: string): boolean {
  const e = normalizeEmail(email);
  const allow = (process.env.LAIG_ADMIN_EMAILS || "admin@larnova.co")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  return e.endsWith("@larnova.co") || allow.includes(e);
}

/** Read the signed-in email from the session cookie, or null. */
export async function getCurrentEmail(): Promise<string | null> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const session = await getSession(id);
  return session?.email ?? null;
}

export type Manager = {
  email: string;
  chapter: Chapter | null; // null for LAIG HQ admins without a chapter
  role: string;
  isAdmin: boolean;
};

/**
 * The signed-in person's management context. Returns a context for chapter
 * managers (ambassador/exec) and for HQ admins (who may have no chapter), or
 * null for anyone else.
 */
export async function getManager(): Promise<Manager | null> {
  const email = await getCurrentEmail();
  if (!email) return null;
  const admin = isAdmin(email);
  const managed = await getChapterForEmail(email);
  if (managed) {
    return { email, chapter: managed.chapter, role: managed.role, isAdmin: admin };
  }
  if (admin) {
    return { email, chapter: null, role: "LAIG HQ", isAdmin: true };
  }
  return null;
}

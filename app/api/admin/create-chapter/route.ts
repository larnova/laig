import { getManager } from "../../../lib/auth";
import { getChapters, saveChapters, normalizeUniversity, type Chapter } from "../../../lib/store";

export const dynamic = "force-dynamic";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function fail(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  const mgr = await getManager();
  if (!mgr) {
    return fail("Unauthorized", 401);
  }
  if (!mgr.isAdmin) {
    return fail("HQ admins only.", 403);
  }

  const body = await request.json().catch(() => ({}));
  const university = str(body.university);
  const ambassadorName = str(body.ambassadorName);
  const ambassadorEmail = str(body.ambassadorEmail);
  const github = str(body.github);
  const linkedin = str(body.linkedin);

  if (!university) return fail("University is required.");
  if (!ambassadorName) return fail("Ambassador name is required.");
  if (!ambassadorEmail) return fail("Ambassador email is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ambassadorEmail)) {
    return fail("A valid email is required.");
  }
  if (github && !/github\.com\//i.test(github)) {
    return fail("Enter a valid GitHub URL.");
  }
  if (linkedin && !/linkedin\.com\//i.test(linkedin)) {
    return fail("Enter a valid LinkedIn URL.");
  }

  const chapters = await getChapters();
  const key = normalizeUniversity(university);

  const existing = chapters.find((c) => normalizeUniversity(c.university) === key);
  if (existing) {
    return fail(`${existing.university} already has a chapter or pending request.`);
  }

  const chapter: Chapter = {
    id: crypto.randomUUID(),
    university,
    ambassadorName,
    ambassadorEmail,
    github,
    linkedin,
    motivation: "Created by LAIG HQ",
    createdAt: new Date().toISOString(),
    status: "approved",
    graduationYear: null,
    execs: [],
    alumni: [],
    advisers: [],
  };

  chapters.push(chapter);
  await saveChapters(chapters);

  return Response.json({ ok: true, chapter });
}

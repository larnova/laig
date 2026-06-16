import { getManager } from "../../../lib/auth";
import {
  getChapters,
  saveChapters,
  normalizeEmail,
  type Alumnus,
} from "../../../lib/store";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * LAIG HQ reassigns a chapter's ambassador — the backstop for when an
 * ambassador graduates/goes silent without handing over. The successor can be
 * an existing exec (by id) or a brand-new person (name + email).
 */
export async function POST(request: Request) {
  const mgr = await getManager();
  if (!mgr) return Response.json({ ok: false, error: "Not authorized." }, { status: 401 });
  if (!mgr.isAdmin)
    return Response.json({ ok: false, error: "HQ admins only." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const chapterId = str(body.chapterId);
  const execId = str(body.execId);
  let name = str(body.name);
  let email = normalizeEmail(str(body.email));

  if (!chapterId) return Response.json({ ok: false, error: "Missing chapter." }, { status: 400 });

  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) return Response.json({ ok: false, error: "Chapter not found." }, { status: 404 });

  let fromExecId: string | null = null;
  if (execId) {
    const exec = chapter.execs.find((x) => x.id === execId);
    if (!exec) return Response.json({ ok: false, error: "Exec not found." }, { status: 404 });
    name = exec.name;
    email = normalizeEmail(exec.email);
    fromExecId = exec.id;
  } else {
    if (!name) return Response.json({ ok: false, error: "Name is required." }, { status: 400 });
    if (!EMAIL_RE.test(email))
      return Response.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }

  // Outgoing ambassador becomes an alumnus.
  const alumnus: Alumnus = {
    id: crypto.randomUUID(),
    name: chapter.ambassadorName,
    email: chapter.ambassadorEmail,
    graduationYear: chapter.graduationYear,
    steppedDownAt: new Date().toISOString(),
  };
  chapter.alumni.unshift(alumnus);

  if (fromExecId) chapter.execs = chapter.execs.filter((x) => x.id !== fromExecId);
  chapter.ambassadorName = name;
  chapter.ambassadorEmail = email;
  chapter.github = "";
  chapter.linkedin = "";
  chapter.graduationYear = null;

  await saveChapters(chapters);

  return Response.json({ ok: true, ambassador: { name, email } });
}

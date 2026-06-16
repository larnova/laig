import { getManager } from "../../lib/auth";
import {
  getChapters,
  saveChapters,
  normalizeEmail,
  type Adviser,
} from "../../lib/store";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const MAX_ADVISERS = 2;

// Only the Campus Ambassador adds/removes chapter advisers.
async function requireAmbassador() {
  const mgr = await getManager();
  if (!mgr) return { ok: false as const, error: "Not authorized.", status: 401 as const };
  if (!mgr.chapter || mgr.role !== "Campus Ambassador")
    return {
      ok: false as const,
      error: "Only the Campus Ambassador can manage chapter advisers.",
      status: 403 as const,
    };
  return { ok: true as const, chapterId: mgr.chapter.id };
}

export async function POST(request: Request) {
  const gate = await requireAmbassador();
  if (!gate.ok) return Response.json({ ok: false, error: gate.error }, { status: gate.status });

  const body = await request.json().catch(() => ({}));
  const name = str(body.name);
  const title = str(body.title);
  const department = str(body.department);
  const email = normalizeEmail(str(body.email));

  if (!name) return Response.json({ ok: false, error: "Name is required." }, { status: 400 });
  if (!title) return Response.json({ ok: false, error: "Title is required." }, { status: 400 });
  if (!department) return Response.json({ ok: false, error: "Department is required." }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return Response.json({ ok: false, error: "Enter a valid email." }, { status: 400 });

  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === gate.chapterId);
  if (!chapter) return Response.json({ ok: false, error: "Chapter not found." }, { status: 404 });

  if (chapter.advisers.length >= MAX_ADVISERS)
    return Response.json(
      { ok: false, error: `A chapter can have at most ${MAX_ADVISERS} advisers.` },
      { status: 409 }
    );
  if (chapter.advisers.some((a) => normalizeEmail(a.email) === email))
    return Response.json(
      { ok: false, error: "That adviser is already listed." },
      { status: 409 }
    );

  const adviser: Adviser = {
    id: crypto.randomUUID(),
    name,
    title,
    department,
    email,
    verified: false, // pending HQ verification
    addedAt: new Date().toISOString(),
  };
  chapter.advisers.push(adviser);
  await saveChapters(chapters);

  return Response.json({ ok: true, adviser });
}

export async function DELETE(request: Request) {
  const gate = await requireAmbassador();
  if (!gate.ok) return Response.json({ ok: false, error: gate.error }, { status: gate.status });

  const id = str(new URL(request.url).searchParams.get("id") || "");
  if (!id) return Response.json({ ok: false, error: "Missing adviser id." }, { status: 400 });

  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === gate.chapterId);
  if (!chapter) return Response.json({ ok: false, error: "Chapter not found." }, { status: 404 });

  chapter.advisers = chapter.advisers.filter((a) => a.id !== id);
  await saveChapters(chapters);

  return Response.json({ ok: true });
}

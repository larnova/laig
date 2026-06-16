import { getManager } from "../../lib/auth";
import {
  getChapters,
  saveChapters,
  normalizeEmail,
  type ExecMember,
} from "../../lib/store";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// Only the Campus Ambassador manages their executive team.
async function requireAmbassador() {
  const mgr = await getManager();
  if (!mgr) return { ok: false as const, error: "Not authorized.", status: 401 as const };
  if (!mgr.chapter || mgr.role !== "Campus Ambassador")
    return {
      ok: false as const,
      error: "Only the Campus Ambassador can manage the executive team.",
      status: 403 as const,
    };
  return { ok: true as const, chapter: mgr.chapter };
}

export async function POST(request: Request) {
  const gate = await requireAmbassador();
  if (!gate.ok) return Response.json({ ok: false, error: gate.error }, { status: gate.status });

  const body = await request.json().catch(() => ({}));
  const name = str(body.name);
  const email = normalizeEmail(str(body.email));
  const role = str(body.role) || "Vice Ambassador";

  if (!name) return Response.json({ ok: false, error: "Name is required." }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return Response.json({ ok: false, error: "Enter a valid email." }, { status: 400 });

  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === gate.chapter.id);
  if (!chapter) return Response.json({ ok: false, error: "Chapter not found." }, { status: 404 });

  if (normalizeEmail(chapter.ambassadorEmail) === email)
    return Response.json(
      { ok: false, error: "That's already the ambassador's email." },
      { status: 409 }
    );
  if (chapter.execs.some((x) => normalizeEmail(x.email) === email))
    return Response.json(
      { ok: false, error: "That person is already on the team." },
      { status: 409 }
    );

  const exec: ExecMember = {
    id: crypto.randomUUID(),
    name,
    email,
    role,
    addedAt: new Date().toISOString(),
  };
  chapter.execs.push(exec);
  await saveChapters(chapters);

  return Response.json({ ok: true, exec });
}

export async function DELETE(request: Request) {
  const gate = await requireAmbassador();
  if (!gate.ok) return Response.json({ ok: false, error: gate.error }, { status: gate.status });

  const id = str(new URL(request.url).searchParams.get("id") || "");
  if (!id) return Response.json({ ok: false, error: "Missing exec id." }, { status: 400 });

  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === gate.chapter.id);
  if (!chapter) return Response.json({ ok: false, error: "Chapter not found." }, { status: 404 });

  chapter.execs = chapter.execs.filter((x) => x.id !== id);
  await saveChapters(chapters);

  return Response.json({ ok: true });
}

import { getManager } from "../../lib/auth";
import { getChapters, saveChapters, type Alumnus } from "../../lib/store";

export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * The current Campus Ambassador hands the chapter over to an executive team
 * member (e.g. before graduating). The exec becomes the new ambassador; the
 * outgoing ambassador is recorded as an alumnus.
 */
export async function POST(request: Request) {
  const mgr = await getManager();
  if (!mgr) return Response.json({ ok: false, error: "Not authorized." }, { status: 401 });
  if (!mgr.chapter || mgr.role !== "Campus Ambassador")
    return Response.json(
      { ok: false, error: "Only the current Campus Ambassador can hand over the chapter." },
      { status: 403 }
    );
  const chapterId = mgr.chapter.id;

  const body = await request.json().catch(() => ({}));
  const execId = str(body.execId);
  if (!execId) return Response.json({ ok: false, error: "Choose a successor." }, { status: 400 });

  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) return Response.json({ ok: false, error: "Chapter not found." }, { status: 404 });

  const successor = chapter.execs.find((x) => x.id === execId);
  if (!successor)
    return Response.json(
      { ok: false, error: "That successor is no longer on the team." },
      { status: 404 }
    );

  // Record the outgoing ambassador as an alumnus.
  const alumnus: Alumnus = {
    id: crypto.randomUUID(),
    name: chapter.ambassadorName,
    email: chapter.ambassadorEmail,
    graduationYear: chapter.graduationYear,
    steppedDownAt: new Date().toISOString(),
  };
  chapter.alumni.unshift(alumnus);

  // Promote the successor; they leave the exec list.
  chapter.execs = chapter.execs.filter((x) => x.id !== execId);
  chapter.ambassadorName = successor.name;
  chapter.ambassadorEmail = successor.email;
  chapter.github = "";
  chapter.linkedin = "";
  chapter.graduationYear = null; // the new ambassador sets their own

  await saveChapters(chapters);

  return Response.json({
    ok: true,
    newAmbassador: { name: successor.name, email: successor.email },
  });
}

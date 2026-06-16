import { getManager } from "../../lib/auth";
import { getChapters, saveChapters } from "../../lib/store";

export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function PATCH(request: Request) {
  const mgr = await getManager();
  if (!mgr) return Response.json({ ok: false, error: "Not authorized." }, { status: 401 });
  if (!mgr.chapter || mgr.role !== "Campus Ambassador") {
    return Response.json(
      { ok: false, error: "Only the Campus Ambassador can edit chapter details." },
      { status: 403 }
    );
  }
  const chapterId = mgr.chapter.id;

  const body = await request.json().catch(() => ({}));
  const name = str(body.ambassadorName);
  const github = str(body.github);
  const linkedin = str(body.linkedin);
  const gradRaw = body.graduationYear;
  const gradYear =
    gradRaw === null || gradRaw === undefined || gradRaw === ""
      ? null
      : Number(gradRaw);

  if (!name) return Response.json({ ok: false, error: "Name is required." }, { status: 400 });
  if (github && !/github\.com\//i.test(github))
    return Response.json({ ok: false, error: "Enter a valid GitHub URL." }, { status: 400 });
  if (linkedin && !/linkedin\.com\//i.test(linkedin))
    return Response.json({ ok: false, error: "Enter a valid LinkedIn URL." }, { status: 400 });
  if (gradYear !== null && (!Number.isInteger(gradYear) || gradYear < 2024 || gradYear > 2040))
    return Response.json({ ok: false, error: "Enter a valid graduation year." }, { status: 400 });

  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) return Response.json({ ok: false, error: "Chapter not found." }, { status: 404 });

  chapter.ambassadorName = name;
  chapter.github = github;
  chapter.linkedin = linkedin;
  if (gradYear !== null) chapter.graduationYear = gradYear;
  await saveChapters(chapters);

  return Response.json({ ok: true, chapter });
}

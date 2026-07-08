import { getManager } from "../../../lib/auth";
import { getChapters, saveChapters, normalizeEmail } from "../../../lib/store";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(request: Request) {
  const mgr = await getManager();
  if (!mgr) return Response.json({ ok: false, error: "Not authorized." }, { status: 401 });
  if (!mgr.isAdmin)
    return Response.json({ ok: false, error: "HQ admins only." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const chapterId = str(body.chapterId);
  const name = str(body.ambassadorName);
  const email = normalizeEmail(str(body.ambassadorEmail));
  const github = str(body.github);
  const linkedin = str(body.linkedin);
  const gradRaw = body.graduationYear;
  const gradYear =
    gradRaw === null || gradRaw === undefined || gradRaw === ""
      ? null
      : Number(gradRaw);

  if (!chapterId) return Response.json({ ok: false, error: "Missing chapter." }, { status: 400 });
  if (!name) return Response.json({ ok: false, error: "Name is required." }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return Response.json({ ok: false, error: "Enter a valid email." }, { status: 400 });

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
  chapter.ambassadorEmail = email;
  chapter.github = github;
  chapter.linkedin = linkedin;
  chapter.graduationYear = gradYear;

  await saveChapters(chapters);

  return Response.json({ ok: true, chapter });
}

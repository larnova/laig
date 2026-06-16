import {
  getChapters,
  saveChapters,
  saveMember,
  normalizeUniversity,
  type Chapter,
  type MemberRecord,
} from "../../lib/store";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function fail(error: string, code: string, status = 400) {
  return Response.json({ ok: false, error, code }, { status });
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return fail("Invalid request body.", "bad_json");
  }

  const path = str(body.path);
  const fullName = str(body.fullName);
  const email = str(body.email);

  if (!fullName) return fail("Full name is required.", "fullName");
  if (!EMAIL_RE.test(email)) return fail("A valid email is required.", "email");

  try {
    if (path === "ambassador") {
      return await handleAmbassador(body, fullName, email);
    }
    if (path === "member") {
      return await handleMember(body, fullName, email);
    }
    return fail("Unknown application path.", "path");
  } catch (err) {
    console.error("Application failed:", err);
    return fail(
      "Something went wrong saving your application. Please try again.",
      "server",
      500
    );
  }
}

async function handleAmbassador(
  body: Payload,
  fullName: string,
  email: string
) {
  const university = str(body.university);
  const github = str(body.github);
  const linkedin = str(body.linkedin);
  const motivation = str(body.motivation);
  const gradYear = Number(body.graduationYear);

  if (!university) return fail("University is required.", "university");
  if (!/github\.com\//i.test(github))
    return fail("A valid GitHub profile URL is required.", "github");
  if (!/linkedin\.com\//i.test(linkedin))
    return fail("A valid LinkedIn profile URL is required.", "linkedin");
  if (motivation.length < 40)
    return fail("Please share a longer motivation statement.", "motivation");
  if (!Number.isInteger(gradYear) || gradYear < 2024 || gradYear > 2040)
    return fail("Select your expected graduation year.", "graduationYear");

  const chapters = await getChapters();
  const key = normalizeUniversity(university);

  // One ambassador (one chapter) per university — pending requests count too.
  const existing = chapters.find((c) => normalizeUniversity(c.university) === key);
  if (existing) {
    const msg =
      existing.status === "pending"
        ? `A chapter request for ${existing.university} is already under review by LAIG HQ.`
        : `${existing.university} already has a chapter and Campus Ambassador. You can join it as a member instead.`;
    return fail(msg, "chapter_taken", 409);
  }

  const chapter: Chapter = {
    id: crypto.randomUUID(),
    university,
    ambassadorName: fullName,
    ambassadorEmail: email,
    github,
    linkedin,
    createdAt: new Date().toISOString(),
    status: "pending", // awaits HQ review before going live
    graduationYear: gradYear,
    execs: [],
    alumni: [],
    advisers: [],
  };

  chapters.push(chapter);
  await saveChapters(chapters);

  return Response.json({
    ok: true,
    path: "ambassador",
    pending: true,
    chapter: { id: chapter.id, university: chapter.university },
  });
}

async function handleMember(body: Payload, fullName: string, email: string) {
  const chapterId = str(body.chapterId);
  const department = str(body.department);
  const level = str(body.level);

  if (!chapterId) return fail("Please select a chapter to join.", "chapterId");
  if (!department) return fail("Course / department is required.", "department");
  if (!level) return fail("Level of study is required.", "level");

  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === chapterId);

  // The chapter could have been removed (or not yet approved) between page
  // load and submit.
  if (!chapter || chapter.status !== "approved") {
    return fail(
      "That chapter is no longer available. There may be no chapter at your university yet — consider becoming a Campus Ambassador.",
      "chapter_missing",
      409
    );
  }

  const member: MemberRecord = {
    id: crypto.randomUUID(),
    fullName,
    email,
    chapterId: chapter.id,
    university: chapter.university,
    department,
    level,
    createdAt: new Date().toISOString(),
  };

  await saveMember(member);

  return Response.json({
    ok: true,
    path: "member",
    chapter: { id: chapter.id, university: chapter.university },
  });
}

import { getChapters } from "../../lib/store";

// Always read fresh from Netlify Blobs — never prerender at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const chapters = await getChapters();
    // Only expose what the public dropdown needs.
    const summary = chapters
      .map((c) => ({ id: c.id, university: c.university }))
      .sort((a, b) => a.university.localeCompare(b.university));
    return Response.json({ chapters: summary });
  } catch (err) {
    console.error("Failed to load chapters:", err);
    return Response.json(
      { chapters: [], error: "Could not load chapters." },
      { status: 500 }
    );
  }
}

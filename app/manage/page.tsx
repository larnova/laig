import type { Metadata } from "next";
import { getManager } from "../lib/auth";
import { getEvents, getChapters } from "../lib/store";
import SignIn from "./SignIn";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chapter Dashboard — Larnova AI Group",
};

export default async function ManagePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const manager = await getManager();

  if (!manager) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <SignIn invalid={error === "invalid"} />
      </main>
    );
  }

  const all = await getEvents();
  const myEvents = all
    .filter(
      (e) =>
        (manager.chapter !== null && e.chapterId === manager.chapter.id) ||
        (manager.isAdmin && e.chapterId === null)
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const allChapters = manager.isAdmin ? await getChapters() : [];

  return (
    <main className="flex-1">
      <Dashboard
        chapter={manager.chapter}
        role={manager.role}
        email={manager.email}
        isAdmin={manager.isAdmin}
        initialEvents={myEvents}
        allChapters={allChapters}
      />
    </main>
  );
}

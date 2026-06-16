import type { Metadata } from "next";
import { getEvents } from "../lib/store";
import EventsBoard from "./EventsBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events — Larnova AI Group",
  description:
    "Workshops, weekly sessions, hackathons and chapter meetups across the LAIG community.",
};

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-slate-200">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-300/40 blur-[120px]"
        />
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            What&apos;s on
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            LAIG Events
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-slate-600">
            Weekly sessions, workshops, hackathons and chapter meetups — across
            the whole community and at universities near you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <EventsBoard events={events} />
      </section>
    </main>
  );
}

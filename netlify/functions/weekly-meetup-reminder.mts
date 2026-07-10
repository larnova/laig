import type { Config } from "@netlify/functions";
import { getAllChapterContacts, getTodaysGlobalMeetup } from "../../app/lib/store";
import { sendWeeklyMeetupReminders } from "../../app/lib/email";

// Runs every Sunday at 09:00 WAT (Africa/Lagos, UTC+1) — the morning of the
// weekly LAIG meetup. Looks up the org-wide "meetup" event HQ posted for
// today via the events dashboard, and skips sending if none is found so a
// missed weekly posting doesn't blast a stale or empty reminder.
const handler = async () => {
  const event = await getTodaysGlobalMeetup();
  if (!event) {
    console.log("[weekly-meetup-reminder] No global meetup event scheduled for today — skipping.");
    return new Response("No meetup scheduled today.");
  }

  const contacts = await getAllChapterContacts();
  console.log(`[weekly-meetup-reminder] Sending "${event.title}" reminder to ${contacts.length} recipients.`);

  // Sent via Resend's batch endpoint (chunks of up to 100) so this stays as
  // one or two HTTP calls regardless of how many chapters sign up, instead
  // of one Resend request per recipient.
  const { sent, failed } = await sendWeeklyMeetupReminders(contacts, {
    title: event.title,
    startsAt: event.startsAt,
    description: event.description,
    link: event.link,
  });

  if (failed) {
    console.error(`[weekly-meetup-reminder] ${failed}/${contacts.length} emails failed to send.`);
  }

  return new Response(`Sent to ${sent}/${contacts.length} recipients.`);
};

export default handler;

export const config: Config = {
  schedule: "0 8 * * 0", // 08:00 UTC = 09:00 WAT, every Sunday
};

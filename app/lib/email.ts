/**
 * Email sending. Uses Resend (https://resend.com) when RESEND_API_KEY is set.
 * Without a key (local dev, or before the key is configured) it logs the
 * message to the server console so flows stay testable.
 *
 * Env:
 *   RESEND_API_KEY  – Resend API key (production)
 *   EMAIL_FROM      – verified sender, e.g. "LAIG <noreply@larnova.co>"
 */

const FROM = process.env.EMAIL_FROM || "LAIG <noreply@larnova.co>";

const shell = (inner: string) =>
  `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1e293b">${inner}</div>`;

const button = (href: string, label: string) =>
  `<p style="margin:28px 0"><a href="${href}" style="background:#7c3aed;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">${label}</a></p>`;

async function send(
  to: string,
  subject: string,
  html: string,
  devLine: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev fallback — surface the content so flows work without an email service.
    console.log(`\n[email:dev] to ${to}: ${devLine}\n`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend failed (${res.status}): ${detail}`);
  }
}

export interface BatchEmail {
  to: string;
  subject: string;
  html: string;
}

// Resend's batch endpoint accepts at most 100 emails per request.
const RESEND_BATCH_LIMIT = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Sends many (personalized) emails via Resend's /emails/batch endpoint — one
 * HTTP request per up-to-100 recipients instead of one request per recipient.
 * Use this for bulk sends (e.g. the weekly meetup reminder) so fan-out to a
 * growing number of chapters doesn't multiply Netlify function invocations
 * or trip Resend's per-request rate limit.
 */
export async function sendBatch(messages: BatchEmail[]): Promise<{ sent: number; failed: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    for (const m of messages) {
      console.log(`\n[email:dev] to ${m.to}: ${m.subject}\n`);
    }
    return { sent: messages.length, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const batch of chunk(messages, RESEND_BATCH_LIMIT)) {
    const payload = batch.map((m) => ({ from: FROM, to: m.to, subject: m.subject, html: m.html }));
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] Resend batch send failed (${res.status}): ${detail}`);
      failed += batch.length;
      continue;
    }

    sent += batch.length;
  }

  return { sent, failed };
}

export async function sendMagicLink(email: string, url: string): Promise<void> {
  const html = shell(
    `<h2 style="color:#7c3aed">Sign in to LAIG</h2>
     <p>Click the button below to access your chapter dashboard. This link
        expires in 15 minutes and can only be used once.</p>
     ${button(url, "Open my dashboard")}
     <p style="color:#64748b;font-size:13px">If you didn't request this, you can
        safely ignore this email.</p>`
  );
  await send(email, "Your LAIG dashboard sign-in link", html, `Magic link: ${url}`);
}

type MeetupEvent = { title: string; startsAt: string; description: string; link: string };

function weeklyMeetupReminderContent(firstName: string, event: MeetupEvent) {
  const hi = firstName ? `Hi ${firstName},` : "Hi,";
  const when = new Date(event.startsAt).toLocaleString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  });
  const html = shell(
    `<h2 style="color:#7c3aed">${event.title} is tonight</h2>
     <p>${hi}</p>
     <p>Reminder: this week's meetup is <strong>${when} (WAT)</strong>.</p>
     ${event.description ? `<p style="color:#334155">${event.description}</p>` : ""}
     ${event.link ? button(event.link, "Join the meetup") : ""}
     <p style="color:#64748b;font-size:13px">See you there!</p>`
  );
  return { subject: `${event.title} tonight — reminder`, html };
}

export async function sendWeeklyMeetupReminder(
  email: string,
  firstName: string,
  event: MeetupEvent
): Promise<void> {
  const { subject, html } = weeklyMeetupReminderContent(firstName, event);
  await send(email, subject, html, `${subject} (${event.link})`);
}

/** Batch variant of {@link sendWeeklyMeetupReminder} — one Resend request per up-to-100 recipients. */
export async function sendWeeklyMeetupReminders(
  contacts: { email: string; name: string }[],
  event: MeetupEvent
): Promise<{ sent: number; failed: number }> {
  const messages = contacts.map((c) => {
    const { subject, html } = weeklyMeetupReminderContent(c.name.split(" ")[0] ?? "", event);
    return { to: c.email, subject, html };
  });
  return sendBatch(messages);
}

export async function sendChapterApproved(
  email: string,
  firstName: string,
  university: string,
  dashboardUrl: string
): Promise<void> {
  const hi = firstName ? `Hi ${firstName},` : "Hi,";
  const html = shell(
    `<h2 style="color:#7c3aed">Your chapter is approved 🎉</h2>
     <p>${hi}</p>
     <p>Great news! LAIG HQ has approved the <strong>${university}</strong>
        chapter. It's now live: members can find and join it, and you can sign in
        to add your executive team, list chapter advisers, and post events.</p>
     ${button(dashboardUrl, "Open my dashboard")}
     <p style="color:#64748b;font-size:13px">Welcome aboard. Let's build.</p>`
  );
  await send(
    email,
    `Your ${university} LAIG chapter is approved`,
    html,
    `Chapter approved - dashboard: ${dashboardUrl}`
  );
}

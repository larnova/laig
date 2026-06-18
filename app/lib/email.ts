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

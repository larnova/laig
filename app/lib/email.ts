/**
 * Email sending. Uses Resend (https://resend.com) when RESEND_API_KEY is set.
 * Without a key (local dev, or before the key is configured) it logs the link
 * to the server console so the magic-link flow is still fully testable.
 *
 * Env:
 *   RESEND_API_KEY  – Resend API key (production)
 *   EMAIL_FROM      – verified sender, e.g. "LAIG <noreply@larnova.co>"
 */

const FROM = process.env.EMAIL_FROM || "LAIG <noreply@larnova.co>";

export async function sendMagicLink(
  email: string,
  url: string
): Promise<void> {
  const subject = "Your LAIG dashboard sign-in link";
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1e293b">
      <h2 style="color:#7c3aed">Sign in to LAIG</h2>
      <p>Click the button below to access your chapter dashboard. This link
         expires in 15 minutes and can only be used once.</p>
      <p style="margin:28px 0">
        <a href="${url}" style="background:#7c3aed;color:#fff;padding:12px 20px;
           border-radius:10px;text-decoration:none;font-weight:600">
          Open my dashboard
        </a>
      </p>
      <p style="color:#64748b;font-size:13px">If you didn't request this, you can
         safely ignore this email.</p>
    </div>`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev fallback — surface the link so it can be used without an email service.
    console.log(`\n[email:dev] Magic link for ${email}:\n${url}\n`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: email, subject, html }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend failed (${res.status}): ${detail}`);
  }
}

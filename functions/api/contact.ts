interface Env {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  CONTACT_EMAIL: string;
}

interface TurnstileResult {
  success: boolean;
}

export async function onRequestPost(
  context: EventContext<Env, string, unknown>
): Promise<Response> {
  const { request, env } = context;

  const formData = await request.formData();
  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim();
  const message = (formData.get("message") as string || "").trim();
  const turnstileToken = formData.get("cf-turnstile-response") as string || "";

  // Honeypot: hidden field that real users never see. Bots fill it in.
  // Return 200 so the bot thinks it worked.
  if (formData.get("website")) {
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!name || !email || !message) {
    return errorResponse(400, "All fields are required.");
  }

  if (!turnstileToken) {
    return errorResponse(400, "Turnstile verification missing.");
  }

  // Verify Turnstile token server-side
  console.log("Verifying Turnstile token...");
  const turnstileResult = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: request.headers.get("CF-Connecting-IP") || "",
      }),
    }
  );

  const turnstile = (await turnstileResult.json()) as TurnstileResult;
  console.log("Turnstile result:", JSON.stringify(turnstile));
  if (!turnstile.success) {
    return errorResponse(403, "Turnstile verification failed.");
  }

  // Send email via Resend
  console.log("Sending email via Resend...");
  const emailResult = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Contact Form <noreply@bojan.delic.rs>",
      to: [env.CONTACT_EMAIL],
      reply_to: email,
      subject: `Contact form: ${name}`,
      text: `From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: contactEmailHtml(name, email, message),
    }),
  });

  const emailBody = await emailResult.text();
  console.log("Resend response:", emailResult.status, emailBody);

  if (!emailResult.ok) {
    return errorResponse(500, "Failed to send message. Please try again later.");
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

function contactEmailHtml(name: string, email: string, message: string): string {
  const escapedName = escapeHtml(name);
  const escapedEmail = escapeHtml(email);
  const escapedMessage = escapeHtml(message).replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f4f4f8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8; padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
        <tr>
          <td style="background:#2d6a4f; padding:20px 28px;">
            <span style="color:#ffffff; font-size:18px; font-weight:600;">New Contact Form Message</span>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:16px;">
                  <span style="font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#888;">From</span><br>
                  <span style="font-size:15px; color:#1a1a2e; font-weight:500;">${escapedName}</span>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:20px;">
                  <span style="font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#888;">Email</span><br>
                  <a href="mailto:${escapedEmail}" style="font-size:15px; color:#2d6a4f; text-decoration:none;">${escapedEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="border-top:1px solid #e0e0e6; padding-top:20px;">
                  <span style="font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#888;">Message</span>
                  <div style="margin-top:8px; font-size:15px; line-height:1.6; color:#333;">${escapedMessage}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px; background:#f7f7f8; border-top:1px solid #e0e0e6;">
            <span style="font-size:12px; color:#999;">Sent from the contact form on bojan.delic.rs</span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function errorResponse(status: number, error: string): Response {
  return new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

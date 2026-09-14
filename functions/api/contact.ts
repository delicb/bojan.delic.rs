import turnstilePlugin, { type PluginData } from "@cloudflare/pages-plugin-turnstile";

const TURNSTILE_ACTION = "contact";
const MAX_REQUEST_BYTES = 32 * 1024;
const MAX_TURNSTILE_TOKEN_LENGTH = 2048;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Env {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  CONTACT_EMAIL: string;
}

type ContactData = {
  [key: string]: unknown;
  formData?: FormData;
  turnstile?: PluginData["turnstile"];
};

type ContactFunction = PagesFunction<Env, string, ContactData>;

const validateContactRequest: ContactFunction = async (context) => {
  const { request } = context;
  const contentType = request.headers.get("content-type")?.toLowerCase() || "";

  if (
    !contentType.includes("multipart/form-data") &&
    !contentType.includes("application/x-www-form-urlencoded")
  ) {
    return errorResponse(415, "Expected form data.");
  }

  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : 0;
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return errorResponse(413, "Request is too large.");
  }

  let formData: FormData;
  try {
    formData = await request.clone().formData();
  } catch {
    return errorResponse(400, "Invalid form data.");
  }

  if (getFormValue(formData, "website")) {
    return successResponse();
  }

  const token = getFormValue(formData, "cf-turnstile-response");
  if (!token || token.length > MAX_TURNSTILE_TOKEN_LENGTH) {
    return errorResponse(400, "Turnstile verification missing.");
  }

  context.data.formData = formData;

  return turnstilePlugin({
    secret: context.env.TURNSTILE_SECRET_KEY,
    response: token,
    onError: (turnstileContext) => {
      const result = turnstileContext.data.turnstile;
      console.warn(
        JSON.stringify({
          event: "turnstile_rejected",
          errorCodes: result.success ? [] : result["error-codes"],
        }),
      );
      return errorResponse(403, "Turnstile verification failed.");
    },
  })(context);
};

const sendContactEmail: ContactFunction = async (context) => {
  const { request, env } = context;
  const turnstile = context.data.turnstile;
  const expectedHostname = new URL(request.url).hostname;

  if (
    !turnstile?.success ||
    turnstile.hostname !== expectedHostname ||
    turnstile.action !== TURNSTILE_ACTION
  ) {
    console.warn(
      JSON.stringify({
        event: "turnstile_metadata_mismatch",
        expectedHostname,
        hostname: turnstile?.success ? turnstile.hostname : undefined,
        action: turnstile?.success ? turnstile.action : undefined,
      }),
    );
    return errorResponse(403, "Turnstile verification failed.");
  }

  const formData = context.data.formData;
  if (!formData) {
    return errorResponse(400, "Invalid form data.");
  }

  const name = getFormValue(formData, "name");
  const email = getFormValue(formData, "email");
  const message = getFormValue(formData, "message");

  if (!name || !email || !message) {
    return errorResponse(400, "All fields are required.");
  }

  if (name.length > MAX_NAME_LENGTH) {
    return errorResponse(400, "Name is too long.");
  }

  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return errorResponse(400, "Email address is invalid.");
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return errorResponse(400, "Message is too long.");
  }

  let emailResult: Response;
  try {
    emailResult = await fetch("https://api.resend.com/emails", {
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
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "contact_email_request_failed",
        error: error instanceof Error ? error.name : "unknown",
      }),
    );
    return errorResponse(500, "Failed to send message. Please try again later.");
  }

  if (!emailResult.ok) {
    console.error(
      JSON.stringify({
        event: "contact_email_rejected",
        status: emailResult.status,
      }),
    );
    return errorResponse(500, "Failed to send message. Please try again later.");
  }

  return successResponse();
};

export const onRequestPost: ContactFunction[] = [validateContactRequest, sendContactEmail];

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

function getFormValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function successResponse(): Response {
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(status: number, error: string): Response {
  return new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

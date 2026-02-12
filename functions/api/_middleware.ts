const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface Env {
  TURNSTILE_SECRET_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const token = (await context.request.clone().formData())
    .get("cf-turnstile-response")
    ?.toString();

  if (!token) {
    return new Response(
      JSON.stringify({ success: false, error: "Turnstile verification missing." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const formData = new FormData();
  formData.set("secret", context.env.TURNSTILE_SECRET_KEY);
  formData.set("response", token);

  const result = await fetch(SITEVERIFY_URL, {
    method: "POST",
    body: formData,
  });

  const outcome = (await result.json()) as { success: boolean };
  console.log("Turnstile result:", JSON.stringify(outcome));

  if (!outcome.success) {
    return new Response(
      JSON.stringify({ success: false, error: "Turnstile verification failed." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return context.next();
};

import turnstilePlugin from "@cloudflare/pages-plugin-turnstile";

interface Env {
  TURNSTILE_SECRET_KEY: string;
}

export const onRequest: PagesFunction<Env>[] = [
  (context) =>
    turnstilePlugin({
      secret: context.env.TURNSTILE_SECRET_KEY,
      onError: () => {
        return new Response(
          JSON.stringify({ success: false, error: "Turnstile verification failed." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      },
    })(context),
];

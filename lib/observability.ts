// Lightweight, dependency-free error reporting.
//
// Emits a single structured JSON line that Firebase App Hosting / Cloud Run
// forwards to Cloud Logging (where you can build alerts). It's the hook point to
// forward to Sentry/Crashlytics later: set NEXT_PUBLIC_SENTRY_DSN and wire it in
// `forward()` below. Safe on both server and client.

export function reportError(error: unknown, context?: Record<string, unknown>): void {
  const payload = {
    severity: "ERROR",
    source: "afrosmart",
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    at: new Date().toISOString(),
    ...context,
  };
  try {
    // eslint-disable-next-line no-console
    console.error("[afrosmart:error]", JSON.stringify(payload));
  } catch {
    /* never throw from the error reporter */
  }
  forward(payload);
}

function forward(payload: Record<string, unknown>): void {
  // Optional, zero-dependency forwarding to an external collector. Set
  // ERROR_WEBHOOK_URL (server-side env) to receive one JSON POST per error —
  // e.g. a Cloud Function, a Slack/Discord incoming webhook, or a Sentry tunnel.
  // Unset => no-op, so there are still no new runtime dependencies by default.
  // Read from process.env so it never leaks to the client bundle (no NEXT_PUBLIC_).
  const url =
    typeof process !== "undefined" && process.env ? process.env.ERROR_WEBHOOK_URL : undefined;
  if (!url) return;
  try {
    // Fire-and-forget; keepalive lets it complete past a serverless response.
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* a failed report must never surface to the user */
    });
  } catch {
    /* never throw from the error reporter */
  }
}

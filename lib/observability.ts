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
  // If/when a monitoring service is configured, forward here. Kept a no-op so the
  // app has zero new runtime dependencies until a DSN is provided.
  // e.g. if (process.env.NEXT_PUBLIC_SENTRY_DSN) Sentry.captureException(...)
  void payload;
}

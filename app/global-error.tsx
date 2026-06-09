"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/observability";

// Global error boundary — catches failures in the root layout itself. Must render
// its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { digest: error.digest, boundary: "global" });
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "5rem 1rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ marginTop: "0.5rem", color: "#666" }}>Please refresh the page.</p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: "1.25rem", padding: "0.6rem 1.5rem", borderRadius: "999px", border: 0, background: "#bd8a16", color: "#fff", fontWeight: 600 }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

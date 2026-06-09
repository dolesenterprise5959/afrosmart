"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/observability";

// Route-level error boundary: reports the error and shows a recoverable UI
// instead of a white screen.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { digest: error.digest, boundary: "route" });
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">
        An unexpected error occurred. You can try again — if it keeps happening, please let us know.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground hover:bg-brand-dark"
      >
        Try again
      </button>
    </div>
  );
}

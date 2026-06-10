// Best-effort client IP from proxy headers. On Firebase App Hosting / Cloud Run
// the real client IP is the first entry of X-Forwarded-For. Used to rate-limit
// unauthenticated endpoints (OTP send, assistant) per source, not just per phone.

export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim().slice(0, 64);
  return "unknown";
}

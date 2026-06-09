"use client";

// Prominent invite CTA: uses the native share sheet (Web Share API) when available
// — best on mobile — and falls back to WhatsApp (the dominant channel in Liberia).
export function InviteFriends({ code, url }: { code: string; url: string }) {
  const text = `Join me on AfroSmart — Liberia's marketplace. Use my referral code ${code} when you sign up: ${url}`;

  async function invite() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Join me on AfroSmart", text, url });
        return;
      } catch {
        return; // user dismissed the share sheet
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={invite}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-brand-foreground hover:bg-brand-dark"
    >
      🎁 Invite Friends
    </button>
  );
}

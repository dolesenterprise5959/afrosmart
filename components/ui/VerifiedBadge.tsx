import type { ReactNode } from "react";

export type VerificationKind = "founder" | "business" | "seller";

// Verification is a positive signal → green. Founder is the brand gold accent.
const styles: Record<VerificationKind, { label: string; cls: string }> = {
  founder: { label: "Verified Founder", cls: "bg-accent/15 text-amber-700 ring-1 ring-accent/40" },
  business: { label: "Verified Business", cls: "bg-success/10 text-success ring-1 ring-success/25" },
  seller: { label: "Verified Seller", cls: "bg-success/10 text-success ring-1 ring-success/25" },
};

/** Small badge shown next to a verified user's name (profiles, listings, cards). */
export function VerifiedBadge({
  kind,
  label,
  className,
}: {
  kind: VerificationKind;
  /** Override the default label (e.g. shorten to "Founder"). */
  label?: ReactNode;
  className?: string;
}) {
  const s = styles[kind];
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        s.cls,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={s.label}
    >
      <svg viewBox="0 0 20 20" aria-hidden className="h-3.5 w-3.5 fill-current">
        <path d="M10 1.5l2.1 1.6 2.6-.3 1 2.4 2.3 1.2-.6 2.6.6 2.6-2.3 1.2-1 2.4-2.6-.3L10 18.5l-2.1-1.6-2.6.3-1-2.4-2.3-1.2.6-2.6-.6-2.6 2.3-1.2 1-2.4 2.6.3L10 1.5zm-1 11.7l4.7-4.7-1.2-1.2L9 10.8 7.5 9.3 6.3 10.5 9 13.2z" />
      </svg>
      {label ?? s.label}
    </span>
  );
}

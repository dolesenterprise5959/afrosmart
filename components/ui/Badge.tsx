import type { ReactNode } from "react";

type Tone = "brand" | "accent" | "neutral";

const tones: Record<Tone, string> = {
  brand: "bg-brand/10 text-brand-dark",
  accent: "bg-accent/15 text-amber-700",
  neutral: "bg-surface text-muted border border-border",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

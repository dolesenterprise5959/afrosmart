import Link from "next/link";
import type { ReactNode } from "react";

// Central AfroSmart logo. Currently renders the brand mark + wordmark; when the
// official asset is added at public/afrosmart-logo.png, swap the mark `<span>`
// for an <Image src="/afrosmart-logo.png" …> here and it updates everywhere.

const boxSize = { sm: "h-8 w-8 rounded-lg text-base", md: "h-9 w-9 rounded-xl text-lg", lg: "h-12 w-12 rounded-2xl text-2xl" };
const textSize = { sm: "text-base", md: "text-lg", lg: "text-2xl" };

export function Logo({
  href = "/",
  showWordmark = true,
  size = "md",
}: {
  /** Wrap in a link; pass null to render inline (no link). */
  href?: string | null;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const content: ReactNode = (
    <span className="inline-flex items-center gap-2 font-bold">
      <span className={`grid place-items-center bg-brand font-bold text-brand-foreground ${boxSize[size]}`}>A</span>
      {showWordmark && (
        <span className={`${textSize[size]} tracking-tight`}>
          Afro<span className="text-brand">Smart</span>
        </span>
      )}
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="AfroSmart home">
      {content}
    </Link>
  );
}

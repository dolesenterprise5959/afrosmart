import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

// Central AfroSmart logo, backed by the official asset at public/afrosmart-logo.png.
//  - default (mark): a compact dark tile of the gold "A" + the wordmark text.
//  - full: the complete lockup image (mark + wordmark), for login & splash.

const tileSize = { sm: "h-8 w-8 rounded-lg", md: "h-9 w-9 rounded-xl", lg: "h-12 w-12 rounded-2xl" };
const fullPx = { sm: 72, md: 104, lg: 160 };
const textSize = { sm: "text-base", md: "text-lg", lg: "text-2xl" };

export function Logo({
  href = "/",
  showWordmark = true,
  size = "md",
  full = false,
  subtitle = false,
}: {
  /** Wrap in a link; pass null to render inline (no link). */
  href?: string | null;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  /** Render the complete lockup image instead of the tile + text. */
  full?: boolean;
  /** Show the "Buy • Sell • Connect Across Liberia" tagline under the wordmark. */
  subtitle?: boolean;
}) {
  let content: ReactNode;
  if (full) {
    const px = fullPx[size];
    content = (
      <Image
        src="/afrosmart-logo.png"
        alt="AfroSmart"
        width={px}
        height={px}
        priority
        className="rounded-2xl"
      />
    );
  } else {
    content = (
      <span className="inline-flex items-center gap-2 font-bold">
        <span className={`relative shrink-0 overflow-hidden bg-black ${tileSize[size]}`}>
          <Image
            src="/afrosmart-logo.png"
            alt="AfroSmart"
            fill
            sizes="48px"
            className="scale-[1.35] object-contain"
            priority
          />
        </span>
        {showWordmark && (
          <span className="flex flex-col leading-none">
            <span className={`${textSize[size]} tracking-tight`}>
              Afro<span className="text-brand">Smart</span>
            </span>
            {subtitle && (
              <span className="mt-1 text-[10px] font-medium leading-none text-muted">
                Buy • Sell • Connect Across Liberia
              </span>
            )}
          </span>
        )}
      </span>
    );
  }

  if (href === null) return content;
  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="AfroSmart home">
      {content}
    </Link>
  );
}

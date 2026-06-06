import Image from "next/image";
import { getCategory } from "@/lib/mock";
import { placeholderImage } from "@/lib/placeholders";
import type { CategoryId } from "@/lib/types";

// Priority: user's uploaded photo → category AI placeholder image (if available)
// → clean neutral fallback. Real photos go through next/image (resized/WebP —
// important on Liberian bandwidth) and lazy-load below the fold.
function isImageUrl(photo: string): boolean {
  return photo.startsWith("http") || photo.startsWith("/");
}

const DEFAULT_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

export function ListingImage({
  photo,
  category,
  className,
  alt,
  sizes = DEFAULT_SIZES,
}: {
  photo: string | undefined;
  category: CategoryId;
  className?: string;
  alt?: string;
  sizes?: string;
}) {
  const meta = getCategory(category);
  const icon = meta?.icon ?? "📦";

  // 1) The user's own uploaded photo always wins.
  if (photo && isImageUrl(photo)) {
    return (
      <div className={["relative overflow-hidden", className].filter(Boolean).join(" ")}>
        <Image src={photo} alt={alt ?? ""} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  // 2) Professional category placeholder image, when one exists for this category.
  const art = placeholderImage(category);
  if (art) {
    return (
      <div className={["relative overflow-hidden", className].filter(Boolean).join(" ")}>
        <Image src={art} alt={alt ?? meta?.label ?? ""} fill sizes={sizes} loading="lazy" className="object-cover" />
      </div>
    );
  }

  // 3) Clean neutral fallback (no bright gradients) — keeps photos as the focus.
  return (
    <div
      aria-hidden
      className={[
        "grid place-items-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-500 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-400",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="flex flex-col items-center gap-1">
        <span className="text-4xl opacity-80">{icon}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">{meta?.label ?? "Listing"}</span>
      </span>
    </div>
  );
}

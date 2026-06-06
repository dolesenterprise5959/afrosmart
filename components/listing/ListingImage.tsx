import Image from "next/image";
import { getCategory } from "@/lib/mock";
import type { CategoryId } from "@/lib/types";

// A listing photo is either a real image URL (Firebase Storage) or, for sample
// data without a photo, a clean neutral category placeholder. Real photos go
// through next/image (resized/WebP — important on Liberian bandwidth).
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

  if (photo && isImageUrl(photo)) {
    return (
      <div className={["relative overflow-hidden", className].filter(Boolean).join(" ")}>
        <Image src={photo} alt={alt ?? ""} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  // Clean, consistent neutral placeholder (no bright gradients) until a real
  // photo is uploaded — keeps photos as the visual focus across the marketplace.
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

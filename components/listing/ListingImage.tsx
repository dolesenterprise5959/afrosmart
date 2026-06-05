import Image from "next/image";
import { getCategory } from "@/lib/mock";
import type { CategoryId } from "@/lib/types";

// A listing photo can be either a real image URL (from Firebase Storage) or a
// Tailwind gradient class used as an offline placeholder for sample data. Real
// photos go through next/image (resized/WebP — important on Liberian bandwidth);
// placeholders render a category-tinted gradient.
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
  const icon = getCategory(category)?.icon ?? "📦";

  if (photo && isImageUrl(photo)) {
    return (
      <div className={["relative overflow-hidden", className].filter(Boolean).join(" ")}>
        <Image src={photo} alt={alt ?? ""} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={[
        "grid place-items-center bg-gradient-to-br text-4xl",
        photo || "from-zinc-200 to-zinc-400",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="drop-shadow">{icon}</span>
    </div>
  );
}

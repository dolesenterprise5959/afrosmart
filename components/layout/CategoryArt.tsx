import Image from "next/image";
import { placeholderImage } from "@/lib/placeholders";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

// Category-card artwork: a large square photo on top, with a bold title and a
// "N Listings" count beneath. Falls back to a gold icon tile when no photo.
export function CategoryArt({
  category,
  label,
  count,
}: {
  category: string;
  /** Legacy emoji prop — accepted for back-compat but no longer rendered. */
  icon?: string;
  label: string;
  count?: number;
}) {
  const art = placeholderImage(category);
  const countLine =
    count && count > 0 ? `${count} ${count === 1 ? "Listing" : "Listings"}` : null;

  return (
    <div>
      {art ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={art}
            alt={label}
            fill
            sizes="(max-width: 640px) 55vw, 240px"
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="grid aspect-[4/3] w-full place-items-center bg-accent/15">
          <CategoryIcon
            category={category}
            className="h-12 w-12 text-accent transition-transform group-hover:scale-110"
          />
        </div>
      )}
      <div className="px-3.5 py-3 text-left">
        <p className="text-xl font-bold leading-tight tracking-tight">{label}</p>
        {countLine && <p className="mt-1 text-sm text-muted">{countLine}</p>}
      </div>
    </div>
  );
}

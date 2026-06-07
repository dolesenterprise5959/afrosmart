import Image from "next/image";
import { placeholderImage } from "@/lib/placeholders";

// Category-card artwork: a large square photo on top, with a bold title and a
// "N Listings" count beneath. Falls back to a gold icon tile when no photo.
export function CategoryArt({
  category,
  icon,
  label,
  count,
}: {
  category: string;
  icon: string;
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
          <span className="text-4xl transition-transform group-hover:scale-110">{icon}</span>
        </div>
      )}
      <div className="px-3 py-2.5 text-left">
        <p className="text-lg font-bold leading-tight">{label}</p>
        {countLine && <p className="mt-0.5 text-xs text-muted">{countLine}</p>}
      </div>
    </div>
  );
}

import Image from "next/image";
import { placeholderImage } from "@/lib/placeholders";

// Category-card artwork: a professional placeholder image with a subtle dark
// overlay for text legibility when one exists, otherwise a gold-tinted icon tile.
// Lazy-loaded + responsive for fast mobile performance.
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
  const countLabel = count && count > 0 ? ` (${count})` : "";

  if (art) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-xl">
        <Image
          src={art}
          alt={label}
          fill
          sizes="(max-width: 640px) 28vw, 14vw"
          loading="lazy"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <span className="absolute inset-x-1.5 bottom-2 text-center text-sm font-semibold leading-tight text-white drop-shadow">
          {label}{countLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 px-2 py-5">
      <span className="grid h-14 w-14 place-items-center rounded-xl bg-accent/15 text-2xl ring-1 ring-accent/20 transition-transform group-hover:scale-110">
        {icon}
      </span>
      <span className="text-sm font-medium">{label}{countLabel}</span>
    </div>
  );
}

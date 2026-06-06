import Image from "next/image";
import { placeholderImage } from "@/lib/placeholders";

// Category-card artwork: a professional placeholder image with a subtle dark
// overlay for text legibility when one exists, otherwise a gold-tinted icon tile.
// Lazy-loaded + responsive for fast mobile performance.
export function CategoryArt({
  category,
  icon,
  label,
}: {
  category: string;
  icon: string;
  label: string;
}) {
  const art = placeholderImage(category);

  if (art) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
        <Image
          src={art}
          alt={label}
          fill
          sizes="(max-width: 640px) 25vw, 12vw"
          loading="lazy"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <span className="absolute inset-x-1 bottom-1.5 text-center text-[11px] font-semibold leading-tight text-white drop-shadow">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 px-2 py-4">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-xl ring-1 ring-accent/20 transition-transform group-hover:scale-110">
        {icon}
      </span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

import { ListingImage } from "@/components/listing/ListingImage";
import type { CategoryId } from "@/lib/types";

// Static gallery for Phase 1: a large lead image with thumbnails beneath.
// Thumbnail selection becomes interactive in a later phase.
export function ListingGallery({
  photos,
  category,
}: {
  photos: string[];
  category: CategoryId;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ListingImage
        photo={photos[0]}
        category={category}
        className="aspect-[4/3] w-full rounded-2xl object-cover text-6xl"
      />
      {photos.length > 1 && (
        <div className="flex gap-2">
          {photos.map((photo, i) => (
            <ListingImage
              key={i}
              photo={photo}
              category={category}
              className={`h-16 w-16 rounded-xl object-cover text-xl ${
                i === 0 ? "ring-2 ring-brand" : "opacity-80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

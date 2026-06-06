import Image from "next/image";

// Avatar: shows the user's profile photo when set, otherwise the first letter of
// their (first) name on a gold-tinted tile.
function firstLetter(name: string): string {
  const t = name.trim();
  return t ? t[0]!.toUpperCase() : "•";
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-xl",
} as const;

const px = { sm: 32, md: 44, lg: 64 } as const;

export function Avatar({
  name,
  photoURL,
  size = "md",
}: {
  name: string;
  photoURL?: string | null;
  size?: keyof typeof sizes;
}) {
  if (photoURL) {
    return (
      <Image
        src={photoURL}
        alt={name}
        width={px[size]}
        height={px[size]}
        className={`shrink-0 rounded-full object-cover ${sizes[size]}`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent/20 font-bold text-accent ${sizes[size]}`}
    >
      {firstLetter(name)}
    </span>
  );
}

// Initials avatar — no remote image needed, ideal for low-bandwidth Phase 1.

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
} as const;

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: keyof typeof sizes;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand/15 font-semibold text-brand-dark ${sizes[size]}`}
    >
      {initials(name)}
    </span>
  );
}

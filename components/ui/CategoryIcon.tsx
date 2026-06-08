// Clean, branded line icons for categories (monochrome, inherit currentColor so
// they pick up the AfroSmart gold accent). Falls back to the category emoji for
// any id without a dedicated icon, so the long-tail taxonomy still renders.

import type { SVGProps } from "react";

type IconFn = (p: SVGProps<SVGSVGElement>) => React.ReactElement;

const base = (children: React.ReactNode): IconFn =>
  function Icon(p: SVGProps<SVGSVGElement>) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        {...p}
      >
        {children}
      </svg>
    );
  };

const ICONS: Record<string, IconFn> = {
  "free-stuff": base(<><path d="M20 12v8H4v-8" /><path d="M2 7h20v5H2z" /><path d="M12 22V7" /><path d="M12 7S10.5 3 8 4s1 3 4 3 .5-3-2-3" /></>),
  wanted: base(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  events: base(<><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M14 6v12" /></>),
  "lost-found": base(<><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></>),
  donations: base(<><path d="M20.8 6.6a4.5 4.5 0 0 0-7.6-2.1L12 5.7l-1.2-1.2a4.5 4.5 0 1 0-6.4 6.4l1.2 1.2L12 19l6.4-6.9 1.2-1.2a4.5 4.5 0 0 0 1.2-4.3Z" /></>),
  volunteers: base(<><circle cx="9" cy="8" r="3" /><path d="M4 20a5 5 0 0 1 10 0" /><path d="M16 4.5a3 3 0 0 1 0 6" /><path d="M18 14a5 5 0 0 1 3 5" /></>),
  services: base(<><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5 2.5-2.5Z" /></>),
  cars: base(<><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" /><path d="M4 13h16v4H4z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></>),
  property: base(<><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>),
  jobs: base(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 12h18" /></>),
  land: base(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></>),
  restaurants: base(<><path d="M6 3v7a2 2 0 0 0 4 0V3" /><path d="M8 10v11" /><path d="M16 3c-1.5 0-2.5 2-2.5 5S15 13 16 13s2.5-2 2.5-5S17.5 3 16 3Z" /><path d="M16 13v8" /></>),
  "sports-fields": base(<><circle cx="12" cy="12" r="9" /><path d="m12 7 2.5 1.8-1 3h-3l-1-3L12 7Z" /></>),
  clothing: base(<><path d="M8 3 4 6l2 3 1-1v10h10V8l1 1 2-3-4-3-2 2a2.5 2.5 0 0 1-4 0L8 3Z" /></>),
};

export function CategoryIcon({
  category,
  emoji,
  className,
}: {
  category: string;
  /** Emoji to show when no branded icon exists for this category. */
  emoji?: string;
  className?: string;
}) {
  const Icon = ICONS[category];
  if (!Icon) {
    // No branded icon — render the emoji so the full taxonomy still has a glyph.
    return <span className={["text-4xl leading-none", className].filter(Boolean).join(" ")} aria-hidden>{emoji ?? "🏷️"}</span>;
  }
  return <Icon className={className} />;
}

/** True when a dedicated branded icon exists (lets callers theme it). */
export function hasCategoryIcon(category: string): boolean {
  return category in ICONS;
}

"use client";

import { useEffect, useRef, useState } from "react";

// Touch-friendly dropdown that does NOT rely on the native <select> picker — the
// picker fails to open in some in-app browsers (Facebook/Messenger WebViews) and
// older Android WebViews. This renders the options as in-page buttons instead, so
// it works in every browser. Same visual footprint as the form's other inputs.
export interface DropdownOption {
  value: string;
  label: string;
}

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select",
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside tap/click (pointerdown covers both touch and mouse).
  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel ?? placeholder}
        onClick={() => setOpen((o) => !o)}
        className={[className, "flex items-center justify-between gap-2 text-left"].filter(Boolean).join(" ")}
      >
        <span className={["min-w-0 truncate", selected ? "" : "text-muted"].join(" ")}>
          {selected ? selected.label : placeholder}
        </span>
        <span aria-hidden className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-1 max-h-60 overflow-auto rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`block w-full px-4 py-2.5 text-left text-base hover:bg-surface ${o.value === value ? "font-semibold text-brand-dark" : ""}`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({
  placeholder = "Search cars, phones, property…",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    // Phase 1: route to the marketplace with the query as a search param.
    // Real full-text search is wired up in Phase 4.
    router.push(q ? `/marketplace?q=${encodeURIComponent(q)}` : "/marketplace");
  }

  return (
    <form
      onSubmit={onSubmit}
      className={["flex items-center gap-2", className].filter(Boolean).join(" ")}
      role="search"
    >
      <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4">
        <span aria-hidden className="text-muted">🔍</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search listings"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-medium text-brand-foreground hover:bg-brand-dark"
      >
        Search
      </button>
    </form>
  );
}

import Link from "next/link";
import { SearchBar } from "@/components/layout/SearchBar";
import { AuthMenu } from "@/components/layout/AuthMenu";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground">
            A
          </span>
          <span className="text-lg tracking-tight">
            Afro<span className="text-brand">Smart</span>
          </span>
        </Link>

        {/* Desktop search — hidden on small screens where the home page shows it inline. */}
        <div className="hidden flex-1 md:block">
          <SearchBar />
        </div>

        <nav className="ml-auto flex items-center gap-2">
          <Button href="/listing/new" variant="primary" size="sm">
            + Post
          </Button>
          <AuthMenu />
        </nav>
      </div>
    </header>
  );
}

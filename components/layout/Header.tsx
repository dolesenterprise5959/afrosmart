import { SearchBar } from "@/components/layout/SearchBar";
import { AuthMenu } from "@/components/layout/AuthMenu";
import { MessagesNavLink } from "@/components/layout/MessagesNavLink";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Logo href="/" subtitle />

        {/* Desktop search — hidden on small screens where the home page shows it inline. */}
        <div className="hidden flex-1 md:block">
          <SearchBar />
        </div>

        <nav className="ml-auto flex items-center gap-2">
          <MessagesNavLink />
          <Button href="/listing/new" variant="primary" size="sm">
            + Post
          </Button>
          <AuthMenu />
        </nav>
      </div>
    </header>
  );
}

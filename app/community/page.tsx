import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function CommunityPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-xl font-bold">🤝 Community</h1>
      <p className="mt-1 text-sm text-muted">
        Local announcements, tips, and safe-trading advice.
      </p>
      <div className="mt-6">
        <EmptyState
          icon="🚧"
          title="Community is coming soon"
          description="We're building a space for Liberians to share news and trade safely. Check back later."
          action={<Button href="/marketplace">Browse the marketplace</Button>}
        />
      </div>
    </div>
  );
}

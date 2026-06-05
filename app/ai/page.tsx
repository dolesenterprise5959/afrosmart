import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function AiPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-xl font-bold">✨ AfroSmart AI</h1>
      <p className="mt-1 text-sm text-muted">
        Smart help to search faster, price items fairly, and spot scams.
      </p>
      <div className="mt-6">
        <EmptyState
          icon="🤖"
          title="AI assistant is coming soon"
          description="Soon you'll be able to ask AfroSmart to find listings, suggest a fair price, and flag suspicious deals."
          action={<Button href="/marketplace">Browse for now</Button>}
        />
      </div>
    </div>
  );
}

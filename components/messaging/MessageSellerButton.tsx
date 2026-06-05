"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { createThread } from "@/lib/messaging/client";
import { Button } from "@/components/ui/Button";

// Starts (or resumes) a conversation with the seller, then navigates to it.
// Unauthenticated users are sent to login first.
export function MessageSellerButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!user) {
      router.push(`/login?next=/listing/${listingId}`);
      return;
    }
    setPending(true);
    setError(null);
    const result = await createThread(listingId);
    if (result.threadId) {
      router.push(`/messages/${result.threadId}`);
    } else {
      setError(result.error ?? "Could not start chat");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button onClick={onClick} size="lg" className="w-full" disabled={pending || loading}>
        {pending ? "Opening chat…" : "💬 Message seller"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

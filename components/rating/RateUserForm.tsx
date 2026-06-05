"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

// Interactive star picker + comment. Hidden for the viewer's own profile and
// when signed out. `canRate` reflects the server-side interaction gate (you may
// only rate someone after messaging them and getting a reply); the server
// re-checks it on submit regardless. Posts to /api/ratings.
export function RateUserForm({ rateeId, canRate }: { rateeId: string; canRate: boolean }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (loading) return null;
  if (!user) {
    return (
      <p className="text-sm text-muted">
        <a href={`/login?next=/u/${rateeId}`} className="text-brand">Sign in</a> to leave a rating.
      </p>
    );
  }
  if (user.uid === rateeId) return null;

  if (!canRate) {
    return (
      <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">
        💬 You can rate this person once you’ve messaged them and they’ve replied.
      </p>
    );
  }

  async function submit() {
    if (stars < 1) {
      setError("Please pick a star rating.");
      return;
    }
    setPending(true);
    setError(null);
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rateeId, stars, comment }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Could not submit rating");
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return <p className="text-sm text-brand-dark">✓ Thanks for your rating!</p>;
  }

  const active = hover || stars;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-medium">Leave a rating</p>
      <div className="mt-2 flex gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            className={i <= active ? "text-accent" : "text-border"}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setStars(i)}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="mt-3 min-h-20 w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-brand"
        placeholder="Share details of your experience (optional)"
        value={comment}
        maxLength={500}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <Button onClick={submit} size="sm" className="mt-2" disabled={pending}>
        {pending ? "Submitting…" : "Submit rating"}
      </Button>
    </div>
  );
}

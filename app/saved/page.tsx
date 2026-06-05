"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, deleteDoc, doc, onSnapshot, type Timestamp } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDb } from "@/lib/firebase/client";
import { ListingImage } from "@/components/listing/ListingImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/mock";
import type { CategoryId } from "@/lib/types";

interface SavedItem {
  id: string;
  listingId: string;
  title: string;
  price: number;
  photo: string;
  category: CategoryId;
  county: string;
  city: string;
  savedAt?: Timestamp;
}

export default function SavedPage() {
  const { user, loading, configured } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    const ref = collection(getDb(), "saved", user.uid, "items");
    return onSnapshot(
      ref,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SavedItem[];
        rows.sort((a, b) => (b.savedAt?.toMillis() ?? 0) - (a.savedAt?.toMillis() ?? 0));
        setItems(rows);
        setReady(true);
      },
      () => setReady(true),
    );
  }, [user]);

  async function unsave(listingId: string) {
    if (!user) return;
    await deleteDoc(doc(getDb(), "saved", user.uid, "items", listingId));
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="text-xl font-bold">Saved listings</h1>

      {!configured ? (
        <p className="mt-6 text-sm text-muted">Sign-in isn’t configured yet.</p>
      ) : loading || (user && !ready) ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      ) : !user ? (
        <div className="mt-6">
          <EmptyState
            icon="🔒"
            title="Sign in to see your saved listings"
            action={<Button href="/login?next=/saved">Sign in</Button>}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon="♡"
            title="Nothing saved yet"
            description="Tap Save on any listing to keep it here for later."
            action={<Button href="/marketplace">Browse listings</Button>}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              <Link href={`/listing/${item.listingId}`} className="block">
                <ListingImage
                  photo={item.photo}
                  category={item.category}
                  alt={item.title}
                  className="aspect-[4/3] w-full"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <Link
                  href={`/listing/${item.listingId}`}
                  className="line-clamp-2 text-sm font-medium hover:text-brand-dark"
                >
                  {item.title}
                </Link>
                <span className="text-base font-bold text-brand-dark">{formatPrice(item.price)}</span>
                <p className="text-xs text-muted">📍 {item.city}, {item.county}</p>
                <button
                  onClick={() => unsave(item.listingId)}
                  className="mt-1 self-start text-xs text-muted underline hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

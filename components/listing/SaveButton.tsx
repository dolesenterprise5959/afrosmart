"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDb } from "@/lib/firebase/client";
import { Button } from "@/components/ui/Button";
import type { CategoryId } from "@/lib/types";

// A saved item stores a denormalised snapshot of the listing so the /saved page
// renders without extra reads. Writes go straight to the user's own subcollection
// (saved/{uid}/items/{listingId}) — the security rules scope it to the owner.
export interface SaveSummary {
  id: string;
  title: string;
  price: number;
  photo: string;
  category: CategoryId;
  county: string;
  city: string;
}

export function SaveButton({ listing }: { listing: SaveSummary }) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const ref = doc(getDb(), "saved", user.uid, "items", listing.id);
    return onSnapshot(ref, (d) => setSaved(d.exists()));
  }, [user, listing.id]);

  async function toggle() {
    if (!user) {
      router.push(`/login?next=/listing/${listing.id}`);
      return;
    }
    const ref = doc(getDb(), "saved", user.uid, "items", listing.id);
    if (saved) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        listingId: listing.id,
        title: listing.title,
        price: listing.price,
        photo: listing.photo,
        category: listing.category,
        county: listing.county,
        city: listing.city,
        savedAt: serverTimestamp(),
      });
    }
  }

  return (
    <Button onClick={toggle} variant={saved ? "secondary" : "outline"} size="lg" className="flex-1">
      {saved ? "♥ Saved" : "♡ Save"}
    </Button>
  );
}

"use client";

// Uploads listing photos to Firebase Storage from the browser and returns their
// public download URLs. Photos are stored under listings/<uid>/ so Storage rules
// can scope writes to the owner.

import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getFirebaseApp } from "@/lib/firebase/client";

export async function uploadListingPhotos(
  files: File[],
  uid: string,
): Promise<string[]> {
  if (files.length === 0) return [];
  const storage = getStorage(getFirebaseApp());

  const urls = await Promise.all(
    files.map(async (file, i) => {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `listings/${uid}/${Date.now()}-${i}-${safeName}`;
      const snapshot = await uploadBytes(ref(storage, path), file);
      return getDownloadURL(snapshot.ref);
    }),
  );
  return urls;
}

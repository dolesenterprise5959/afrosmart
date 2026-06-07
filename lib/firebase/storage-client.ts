"use client";

// Uploads listing photos to Firebase Storage from the browser and returns their
// public download URLs. Photos are stored under listings/<uid>/ so Storage rules
// can scope writes to the owner.

import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getFirebaseApp } from "@/lib/firebase/client";

// Compress + downscale a photo in the browser BEFORE upload. Critical for slow
// Liberian mobile networks — a 4–8 MB camera photo becomes ~100–300 KB, so
// uploads finish quickly and don't fail on weak connections.
export async function compressImage(file: File, maxDim = 1280, quality = 0.8): Promise<File> {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) return file;
  try {
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new window.Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = dataUrl;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    if (scale === 1 && file.size < 400_000) return file; // already small enough
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file; // never block posting on a compression hiccup
  }
}

/** Upload a single profile photo (compressed) and return its public URL. */
export async function uploadProfilePhoto(file: File, uid: string): Promise<string> {
  const storage = getStorage(getFirebaseApp());
  const compressed = await compressImage(file, 512, 0.85);
  const path = `avatars/${uid}/${Date.now()}.jpg`;
  const snapshot = await uploadBytes(ref(storage, path), compressed);
  return getDownloadURL(snapshot.ref);
}

export async function uploadListingPhotos(
  files: File[],
  uid: string,
): Promise<string[]> {
  if (files.length === 0) return [];
  const storage = getStorage(getFirebaseApp());

  const urls = await Promise.all(
    files.map(async (file, i) => {
      const compressed = await compressImage(file);
      const path = `listings/${uid}/${Date.now()}-${i}.jpg`;
      const snapshot = await uploadBytes(ref(storage, path), compressed);
      return getDownloadURL(snapshot.ref);
    }),
  );
  return urls;
}

// Firebase client SDK (browser). Lazily initialised so importing this module is
// safe during SSR/build even when env vars are absent — getAuth/getFirestore
// only run when a function here is actually called (in the browser).

import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// App Check (reCAPTCHA Enterprise) — protects Auth/Firestore/Storage from abuse,
// fake clients and SMS/quota theft. The site key is public by design.
const RECAPTCHA_ENTERPRISE_SITE_KEY = "6Lf-yAwtAAAAABtv4yiqDJ3ILVbbLzQJsMKzFa6B";
let appCheckStarted = false;

function ensureAppCheck(app: FirebaseApp): void {
  if (appCheckStarted || typeof window === "undefined") return;
  appCheckStarted = true;
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch {
    // App Check init must never break the app (enforcement is monitored first).
  }
}

// The Firebase *Web* config is public by design — it ships to every browser and
// is safe to commit. Real security is enforced by Firestore/Storage rules and
// App Check, not by hiding these values (they're also in apphosting.yaml). We
// hardcode them as fallbacks so the client bundle always has a valid config even
// when build-time NEXT_PUBLIC_* injection is unavailable (e.g. Docker build-arg
// edge cases on Cloud Run). Set the env vars to point a build at a different
// Firebase project.
const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCDoMbDYC8gWdyGng1tyNXhQArNm3faloo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "afrosmart.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "afrosmart",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "afrosmart.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1041694228358",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:1041694228358:web:bf26df6982e2c1b6793607",
};

/** True when the public Firebase config is present (set in .env.local). */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Copy .env.local.example to .env.local and fill in the NEXT_PUBLIC_FIREBASE_* values.",
    );
  }
  const app = getApps()[0] ?? initializeApp(config);
  ensureAppCheck(app);
  return app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

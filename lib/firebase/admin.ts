import "server-only";

// Firebase Admin SDK (server only). Used to mint/verify session cookies and to
// perform trusted writes (moderation, call-unlock) that must never be done from
// the client. Lazily initialised so the build doesn't require credentials.
//
// Credentials, in order of preference:
//   1. Explicit service-account env vars (FIREBASE_*) — used for LOCAL dev and
//      the seed script.
//   2. Application Default Credentials (ADC) — used in PRODUCTION on Google Cloud
//      (Firebase App Hosting / Cloud Run), where the runtime service account
//      provides credentials and NO private key needs to be shipped. Preferred for
//      production. See docs/LAUNCH_RUNBOOK.md §7.

import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function hasExplicitServiceAccount(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

// True on Google Cloud runtimes (Cloud Run / App Hosting set K_SERVICE; GCP
// generally sets GOOGLE_CLOUD_PROJECT), or when GOOGLE_APPLICATION_CREDENTIALS
// points at a key file — i.e. when ADC can provide credentials.
function hasApplicationDefault(): boolean {
  return Boolean(
    process.env.K_SERVICE ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
  );
}

/** True when the Admin SDK can obtain credentials (explicit or ADC). */
export function isAdminConfigured(): boolean {
  return hasExplicitServiceAccount() || hasApplicationDefault();
}

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  if (hasExplicitServiceAccount()) {
    const projectId = process.env.FIREBASE_PROJECT_ID!;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
    // Private keys are stored with literal "\n"; convert them to real newlines.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }

  if (hasApplicationDefault()) {
    const projectId =
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    return initializeApp({ credential: applicationDefault(), projectId });
  }

  throw new Error(
    "Firebase Admin is not configured. Locally set FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env.local; in production run on Google Cloud with Application Default Credentials.",
  );
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}

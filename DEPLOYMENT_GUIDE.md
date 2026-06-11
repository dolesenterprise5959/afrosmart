# AfroSmart — Deployment Guide

Step-by-step guide to take AfroSmart from this repository to a live beta on
Google Cloud / Firebase. Companion to `BETA_LAUNCH_CHECKLIST.md` and
`docs/LAUNCH_RUNBOOK.md`. **Nothing here runs automatically — you execute each step.**

## Prerequisites

- Node.js 22+, npm
- **Java 17+** (only for the security-rules emulator step)
- Firebase CLI: `npm i -g firebase-tools`
- Google Cloud project with billing enabled
- `gcloud` CLI (only if using the Cloud Run path)

---

## Step 1 — Create the Firebase project

1. Firebase console → **Add project**; note the **project ID**.
2. **Authentication** → Sign-in method → enable **Phone**. Add your production domain(s) to *Authorized domains*.
3. **Firestore** → Create database → **Native mode** → pick a region (benchmark an EU-west region for Liberia latency).
4. **Storage** → set up the default bucket.
5. **Project settings → General →** register a **Web app**; copy the config values.

## Step 2 — Configure local env & link the project

```bash
cp .env.local.example .env.local      # fill NEXT_PUBLIC_* from the Web app config
cp .firebaserc.example .firebaserc     # set "default" to your project id
# For LOCAL admin/seed only, also set FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY
# (Project settings → Service accounts → Generate new private key).
firebase login
```

> Production does **not** use the private key — the Admin SDK uses Application
> Default Credentials from the hosting service account (see `lib/firebase/admin.ts`).

## Step 3 — Deploy rules, indexes, storage

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

## Step 4 — Prove the security rules (blocker)

```bash
npm i -D @firebase/rules-unit-testing@^4 firebase-tools --legacy-peer-deps
firebase emulators:exec --only firestore "npm run test:rules"
```
All assertions must pass — this is the only automated proof of phone-privacy,
call-unlock, and server-only-collection invariants. (CI runs this automatically;
see `.github/workflows/ci.yml`.)

## Step 5 — Seed (optional) & set the first admin

```bash
npm run seed     # OPTIONAL sample data — skip for a clean production DB
```
Make yourself admin (after signing in once in the app):
```js
// one-off Node script with the Admin SDK
await admin.auth().setCustomUserClaims(UID, { admin: true });
// Then sign out & back in — the claim is baked into the session cookie.
```

## Step 6 — Deploy the app

### Option A — Firebase App Hosting (recommended)

```bash
firebase init apphosting          # connect this GitHub repo + branch (main)
# Edit apphosting.yaml: fill NEXT_PUBLIC_* (build+runtime). Server creds via ADC.
# Grant the App Hosting backend service account: Cloud Datastore User,
# Firebase Authentication Admin, Storage Object Admin (least privilege).
git push                          # triggers a build + rollout
```
Set **min instances = 1** (avoid cold starts for Liberia latency).

### Option B — Cloud Run (Docker)

```bash
gcloud run deploy afrosmart \
  --source . --region <region> --allow-unauthenticated \
  --min-instances 1 --memory 512Mi \
  --set-build-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=...,NEXT_PUBLIC_FIREBASE_PROJECT_ID=...,...
```
The `Dockerfile` sets `BUILD_STANDALONE=true`, so `next build` emits
`.next/standalone/server.js` and the image runs `node server.js`; the runtime
service account provides ADC (no key in the image). App Hosting (Option A) does
**not** set that env, so its build keeps the default output.

> **One web target at a time.** Options A and B both serve the app on Cloud Run;
> pick one. `firebase.json` intentionally has **no** `hosting` block — the app is
> not served through Firebase Hosting. `firebase.json` only carries Firestore,
> Storage, and emulator config (used by the `firebase deploy --only firestore:*`
> / `storage` commands above).

## Step 7 — Domain & SSL

1. Add the custom domain in the host console; complete the TXT verification.
2. Point DNS (A/AAAA or the provided target) at the host.
3. Managed SSL auto-provisions — confirm HTTPS + HTTP→HTTPS redirect.
4. Add the domain(s) to Firebase Auth **Authorized domains** and App Check.

## Step 8 — Monitoring & guardrails

Follow `docs/MONITORING.md`:
- Uptime check + alerting (5xx, latency, 429 spikes).
- **Google Cloud budget + alerts** (50/90/100%) — protects against bill blowups.
- Sentry/Error Reporting; GA4 + Firebase Performance.
- Scheduled Firestore/Storage backups.

## Step 9 — Go-live hardening

1. **Live E2E smoke**: signup → post listing (with photo) → message seller → reply → call unlocks → reveal phone → rate → report → admin resolves. Confirm a **429** fires when spamming.
2. Check the browser console during sign-in for **CSP violations**; when clean, rename `Content-Security-Policy-Report-Only` → `Content-Security-Policy` in `next.config.ts` and redeploy.
3. Enable **Firebase App Check** (enforce on Firestore, Storage, Auth).

## Rollback

- **App Hosting / Cloud Run**: roll back to the previous revision in the console (instant traffic shift).
- **Rules/indexes**: re-deploy the previous `firestore.rules` from git history.
- Keep the prior release tagged in git (`v0.1.0-beta`).

---

### Quick reference

| Task | Command |
|---|---|
| Install | `npm ci` |
| Lint / typecheck / test / build | `npm run lint && npm run typecheck && npm test && npm run build` |
| Rules (emulator) | `firebase emulators:exec --only firestore "npm run test:rules"` |
| Deploy backend config | `firebase deploy --only firestore:rules,firestore:indexes,storage` |
| Seed sample data | `npm run seed` |

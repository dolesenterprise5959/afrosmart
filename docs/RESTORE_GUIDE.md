# AfroSmart — Restore Guide

How to recover the known‑good working version if something breaks. Pairs with `PROJECT_SNAPSHOT.md`.

**Known‑good commit:** `72d6016` on `origin/main` (2026-06-12). **Live target:** Firebase App Hosting backend `afrosmart`.

---

## TL;DR — fastest recovery
The live site auto‑deploys from `main`. To restore the working version, get `main` back to the good commit and let it redeploy:
```bash
cd ~/afrosmart
git fetch origin
git checkout main && git pull --ff-only
# inspect what broke:
git log --oneline -10

# Option A — a bad PR was merged: revert it (safe, keeps history)
git revert -m 1 <bad-merge-commit>        # -m 1 for a merge commit
git push origin main                       # → App Hosting auto-rolls out the fix

# Option B — hard reset main to the known-good snapshot (destructive to later commits)
git reset --hard 72d6016
git push --force-with-lease origin main    # → auto-rollout
```
A push to `main` triggers a new App Hosting rollout automatically (1–3 min). No manual deploy needed for code.

## Recover the deployment (App Hosting)
- **Roll back a bad deploy without touching git:** Firebase Console → **App Hosting → `afrosmart` → Rollouts** → pick the last good rollout → **Roll back**. (Each rollout is tied to a commit; the snapshot's good commit is `72d6016`.)
- List backends: `firebase apphosting:backends:list --project afrosmart`.

## Recover Firebase config (these do NOT auto‑deploy)
App Hosting only deploys the app. Rules/indexes/auth settings are separate:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage --project afrosmart
```
- **Firestore rules** → `firestore.rules` (phone protection + server‑only wallet/referral/notification fields).
- **Firestore indexes** → `firestore.indexes.json` (scalable search). Indexes take minutes to build.
- **Storage rules** → `storage.rules`.

## Recover Authentication settings (Console / API — not in git)
These live in the Firebase project, not the repo:
1. **Authorized domains** must include — Console → Authentication → Settings → Authorized domains:
   - `afrosmart--afrosmart.us-central1.hosted.app` ✅ (required for OTP on the live URL)
   - `afrosmart.app`, `www.afrosmart.app`, `localhost`, `afrosmart.firebaseapp.com`, `afrosmart.web.app`
   *(Missing the hosted.app one = the "couldn't complete in this browser" error.)*
2. **Phone provider** enabled; **App Check** left OFF.
3. **Test phone numbers** (for testing without real SMS) must mirror `lib/testNumbers.ts` in Console → Authentication → Sign‑in method → Phone → "Phone numbers for testing" (e.g. `+231770000000` / `123456`).

## Recover credentials / environment
- **Web (client) config:** hard‑coded with env fallbacks in `lib/firebase/client.ts` — project `afrosmart`. No `.env` needed for prod (App Hosting injects `NEXT_PUBLIC_*` via `apphosting.yaml`).
- **Admin SDK:** runs on ADC on App Hosting (no key file). For local admin scripts (e.g. `scripts/grant-admin.mjs`), set `GOOGLE_APPLICATION_CREDENTIALS` to a service‑account key from Console → Project Settings → Service accounts.
- **Admin access:** `node scripts/grant-admin.mjs +231YOURNUMBER` (sets the `admin` custom claim), then sign out/in.

## Verify a restore is healthy
```bash
U=https://afrosmart--afrosmart.us-central1.hosted.app
for p in / /login /wallet /marketplace; do echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' "$U$p")"; done   # expect 200
npm ci && npm run typecheck && npm test && npm run build                                                          # expect 0 errors, 79 tests pass
# auth domain check:
curl -s "https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=AIzaSyCDoMbDYC8gWdyGng1tyNXhQArNm3faloo" | python3 -c "import sys,json;print('afrosmart--afrosmart.us-central1.hosted.app' in json.load(sys.stdin)['authorizedDomains'])"  # expect True
```
*(Note: if a shell loses its PATH, prefix commands with absolute paths, e.g. `/usr/bin/curl`, `/usr/bin/git`.)*

## Data safety
- **Do not** run `scripts/seed.mjs` against prod — it writes demo listings/users (`l1–l8`, `u1–u4`). They were purged; re‑seeding re‑introduces fake data.
- Real listings/users live in Firestore (not in git). A code restore does **not** touch data. Back up Firestore separately if needed (`firebase firestore:export`).

## What a code/deploy restore does NOT recover
- Firestore data, Auth users, authorized domains, billing settings, DNS — all configured outside the repo. Re‑apply via the sections above.

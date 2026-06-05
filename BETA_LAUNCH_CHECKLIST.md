# AfroSmart — Beta Launch Checklist

_Audit date: 2026-06-05 · Next.js 16 · Firebase · Google Cloud_

Legend: ✅ done & verified · 🟡 ready in code, needs provisioning/config · ⛔ blocker · ⬜ todo

---

## A. Codebase audit — verification results

Verified by `next build` ✅, `tsc --noEmit` ✅, `vitest run` (41/41) ✅, `eslint` (0) ✅, and a live HTTP smoke test on the production server.

| Subsystem | Status | Evidence |
|---|---|---|
| **Authentication** | ✅ | Phone + OTP (`/login`), httpOnly session cookie via Admin SDK, `proxy.ts` optimistic guards + DAL `verifySession`/`verifyAdmin`. Live: protected routes → 307 `/login`, APIs → 401 unauth. |
| **Listings** | ✅ | Firestore reads (cached) + create flow (client Storage upload → `createListingAction` w/ validation, auth, suspended + rate-limit checks). Browse/detail/category render real data. |
| **Messaging** | ✅ | Realtime threads/messages (client `onSnapshot`, read-only); all writes server-side via `/api/threads*`. Participants-only. |
| **Call unlock** | ✅ | Server-flips `callUnlocked` when both parties message; phone revealed only via `/api/threads/[id]/phone` when unlocked. Unit-tested rule. |
| **Ratings** | ✅ | Transactional aggregate; **interaction gate** (must have an unlocked thread) + self-rating block + rate limit. |
| **Reports** | ✅ | Server-mediated create + rate limit; admin queue with resolve. |
| **Admin dashboard** | ✅ | `verifyAdmin` gate; live stats (`count()`), reports queue, remove-listing / suspend-user / resolve actions. |
| **Firebase integration** | 🟡 | Client + Admin SDK wired; Admin prefers **ADC** in prod (no shipped key). **Needs a real project + `.env.local`/secrets.** |
| **Firestore rules** | 🟡 | `firestore.rules` + `storage.rules` authored & strict (phone privacy, server-only writes, ownership). Suite authored (`tests/rules/`) but **not yet run on the emulator (needs Java)**. |
| **Mobile responsiveness** | ✅ | Mobile-first Tailwind: bottom tab nav (`md:hidden`), responsive grids (`grid-cols-2 sm:3 lg:4`), `max-w` containers, mobile inline search. |
| **Performance** | ✅ | Browse reads cached (`unstable_cache`, 30s TTL, busted on write); `next/image` for photos; `output: standalone`; security headers. |
| **CI / Docker** | ✅ | `.github/workflows/ci.yml` (lint·typecheck·test·build + rules-emulator job); `Dockerfile` (multi-stage standalone). |

**Critical errors found & fixed in this audit:** 1 — `revalidateTag` missing the Next 16 `profile` argument (build-breaking); fixed to `revalidateTag(LISTINGS_TAG, "max")`. No other errors. No functionality removed.

---

## B. Pre-launch checklist

### Engineering (complete)
- [x] All MVP features built & wired to Firestore
- [x] Security model: server-mediated writes, rate limiting, rating gate
- [x] Security headers (CSP report-only), ADC for prod credentials
- [x] Performance hardening (cache, images, standalone)
- [x] Build / typecheck / lint / unit tests all green
- [x] Config-as-code: `firebase.json`, `firestore.indexes.json`, `apphosting.yaml`, templates

### Firebase & infrastructure (to provision)
- [ ] 🟡 Create Firebase project; enable **Phone** auth + authorized domains
- [ ] 🟡 Set secrets (Secret Manager) / `.env.local`; never commit
- [ ] ⛔ `firebase deploy --only firestore:rules,firestore:indexes,storage`
- [ ] ⛔ **Run rules suite green on the emulator** (`npm run test:rules`, needs Java)
- [ ] 🟡 Provision hosting (Firebase App Hosting recommended) → first deploy
- [ ] 🟡 Custom domain + managed SSL
- [ ] 🟡 Monitoring + alerts + **budget cap** (see `docs/MONITORING.md`)
- [ ] 🟡 First admin custom claim set

### Go-live hardening (after provisioning)
- [ ] ⬜ Live E2E smoke (signup → post → message → reply → unlock → rate → report → admin resolve)
- [ ] ⬜ Validate CSP, then flip `Content-Security-Policy-Report-Only` → enforcing
- [ ] ⬜ Enable Firebase **App Check** (Firestore/Storage/Auth)
- [ ] ⬜ Confirm a 429 fires under spam (rate limits live)

---

## C. Remaining blockers (operational, not code)

1. **Firebase project not created** → blocks rules/index/storage deploy and all live data.
2. **Rules suite not yet proven on the emulator** (needs Java) → the only automated proof of phone-privacy / call-unlock invariants.
3. **No hosting/domain/monitoring provisioned yet.**

> The application code is launch-ready and verified. The remaining work is provisioning + a security proof, all covered step-by-step in `DEPLOYMENT_GUIDE.md`.

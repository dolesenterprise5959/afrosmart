# AfroSmart — Project Status

_Snapshot: 2026-06-05 · pre-launch · Next.js 16 · Firebase · Google Cloud_

A trusted local marketplace for Liberia (buy/sell cars, phones, electronics,
property, services, jobs, general goods) with privacy-preserving contact
(phone numbers hidden until a real conversation happens).

---

## Features completed ✅

**Core marketplace**
- Home (search, categories, featured + recent), Marketplace browse, Category pages
- Listing detail (gallery, seller card, price, location)
- Create listing (photo upload to Storage → validated server action → Firestore)
- Search + **county filter**, breadcrumbs

**Authentication & accounts**
- Phone + OTP sign-in; httpOnly **session cookie** via Admin SDK
- Route protection: `proxy.ts` (optimistic) + DAL `verifySession`/`verifyAdmin` (secure)
- Profile pages, **Settings** (edit profile), **Saved/wishlist**

**Messaging & call-unlock**
- 1:1 realtime messaging (client read-only via `onSnapshot`; all writes server-side)
- **Call-unlock**: phone revealed only after buyer messages and seller replies
- Phone number never present in any client-readable document

**Trust & safety**
- Ratings (1–5) with transactional aggregate + **interaction gate** + self-rating block
- Reports (scam/spam/fake/wrong-category), server-mediated
- **Admin dashboard**: live stats, reports queue, remove listing / suspend user / resolve
- **Rate limiting** (messages, reports, listings, threads, ratings)

**Platform & hardening**
- Firestore + Storage **security rules** (phone privacy, server-only writes, ownership)
- Security headers (CSP **enforced**), production credentials via **ADC**
- Performance: browse-read caching (`unstable_cache`, 30s TTL); `next/image` (unoptimized — raw URLs)
- **Docker** image + **CI** (lint·typecheck·test·build + rules-emulator job)
- Config-as-code: `firebase.json`, `firestore.indexes.json`, `apphosting.yaml`, env/templates
- Docs: `LAUNCH_RUNBOOK.md`, `DEPLOYMENT_GUIDE.md`, `BETA_LAUNCH_CHECKLIST.md`, `MONITORING.md`

## Features pending / post-beta 🟡

- **Provisioning** (operational, not code): create Firebase project, deploy rules/indexes/storage, hosting, domain, monitoring + budget cap
- **Prove rules suite on the emulator** (needs Java) — authored, not yet executed
- Enable **Firebase App Check** after validation (CSP is already enforced)
- Scale follow-ups: DB-side ordering + **pagination** (composite indexes ready), **shared cache handler** (Redis) for multi-instance, real-photo display end-to-end
- Future scope (not MVP): in-app payments, mobile app (Flutter), AI assistant, community feed

## Tests passed ✅

| Check | Result |
|---|---|
| `next build` | ✅ compiles, 25 routes |
| `tsc --noEmit` (typecheck) | ✅ no errors |
| `vitest run` (unit) | ✅ **41 / 41** (phone, call-unlock rule, validators, rate-limit core, route guards, catalog) |
| `eslint` | ✅ 0 problems |
| Live HTTP smoke | ✅ public 200 · protected 307→/login · APIs 401 · headers present · real content rendered |
| Firestore rules suite | 🟡 authored (`tests/rules/`), **not run here** (no Java/emulator) |

Critical errors fixed this cycle: 1 (`revalidateTag` Next 16 arity). No open code defects.

## Deployment readiness

| Dimension | Score |
|---|---:|
| Product completion | ~98% |
| Security | 91 / 100 |
| Infrastructure | 65 / 100 |
| Performance | 84 / 100 |
| **Launch readiness** | **82 / 100** |

**Blockers (all operational):** (1) create Firebase project + deploy rules/indexes/storage; (2) rules emulator green; (3) provision hosting/domain/monitoring.

**Estimated time to beta:** ~1–2 focused days to a live deployment; closed beta ≈ 2026-06-16.

**Next step:** `npm i -g firebase-tools && firebase login`, then follow `DEPLOYMENT_GUIDE.md`.

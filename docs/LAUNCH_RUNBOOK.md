# AfroSmart — Phase 8 Launch Runbook

> Operational runbook for taking AfroSmart from a verified codebase to a live beta
> in Liberia. Engineering (Phases 1–7) is complete: all MVP features, server-side
> security model, rate limiting, rating interaction gate, 41 passing unit tests,
> authored Firestore-rules suite. **Nothing here has been deployed yet.**
>
> Stack: Next.js 16 (App Router, SSR/route handlers/server actions) · Firebase
> (Auth, Firestore, Storage) · Google Cloud hosting.

---

## 0. Readiness scores (at runbook time)

| Area | Score | Notes |
|---|---:|---|
| Product | 90 / 100 | All MVP features built & tested; minor UX polish remains |
| Security | 88 / 100 | Strong model; needs live rules-emulator proof + headers + App Check |
| Infrastructure | 40 / 100 | Nothing provisioned yet (no Firebase project, host, domain, monitoring) |
| Launch | 72 / 100 | Engineering done; gated on infra setup + go-to-market prep |

---

## 1. Beta Launch Checklist (the master sequence)

Run top-to-bottom. Each item links to a detailed section below.

- [ ] **Code freeze** for beta scope; tag `v0.1.0-beta` in git (branch off `main`).
- [ ] **Firebase project** created & configured → §2
- [ ] **Secrets** in Secret Manager (not in repo); `.env.local` filled locally → §2
- [ ] **Security rules + indexes deployed**; `npm run test:rules` green on emulator → §2, §7
- [ ] **Security hardening** pass (headers, App Check, ADC) → §7
- [ ] **Hosting** provisioned on Google Cloud; first deploy succeeds → §5
- [ ] **Domain** connected with managed SSL → §4
- [ ] **Monitoring/logging/alerts** live, with a budget cap → §6
- [ ] **Seed/admin**: `npm run seed` (optional) + first admin custom claim set → §3
- [ ] **Live E2E smoke**: signup → post → message → reply → call unlock → rate → report → admin resolve; confirm a 429 fires under spam.
- [ ] **Go-to-market** assets ready (WhatsApp, Facebook, flyers, ambassadors) → §8–§10
- [ ] **Soft launch** to ~20 trusted users (Monrovia); 48h observation.
- [ ] **Closed beta** to first 100 → §8
- [ ] **Listing drive** to 500 → §9
- [ ] Go/No-Go review → public beta.

---

## 2. Firebase Setup Checklist

- [ ] Create project in the [Firebase console]; note the **project ID**.
- [ ] **Authentication** → enable **Phone** sign-in. Add production + preview domains to *Authorized domains*. Set the daily SMS quota and a budget for SMS.
- [ ] Configure **reCAPTCHA** for phone auth (App Check / reCAPTCHA Enterprise recommended, §7).
- [ ] **Firestore** → create database in **Native mode**, region `nam5`/closest GCP region with good Liberia latency (e.g., `europe-west1` is often a good EU hop for West Africa — benchmark both).
- [ ] **Storage** → create default bucket.
- [ ] Register a **Web app**; copy the config into the `NEXT_PUBLIC_FIREBASE_*` vars.
- [ ] **Service account** → Project settings → Service accounts → generate key **for local/seed use only**. In production, prefer Application Default Credentials (§7) over shipping the private key.
- [ ] Fill `.env.local` from `.env.local.example` (local dev + seeding only).
- [ ] Deploy rules & indexes:
  ```bash
  firebase deploy --only firestore:rules
  firebase deploy --only storage          # storage.rules
  firebase deploy --only firestore:indexes  # see §3 for indexes file
  ```
- [ ] Run the rules suite against the emulator (requires Java):
  ```bash
  npm i -D @firebase/rules-unit-testing@^4 firebase-tools --legacy-peer-deps
  firebase emulators:exec --only firestore "npm run test:rules"
  ```
  **This is a launch blocker — it is the only automated proof of the phone-privacy, call-unlock, and server-only-collection invariants.**
- [ ] Enable **daily Firestore/Storage backups** (scheduled export to a GCS bucket).

## 3. Production Deployment Checklist

- [ ] `npm ci` on a clean checkout; `npm run build` passes; `npm test` (unit) passes.
- [ ] Confirm **no secrets** committed (`.env.local` is gitignored; only `.env.local.example` is tracked).
- [ ] **Composite indexes** for scale (create `firestore.indexes.json` and deploy). Needed once browse adds DB-side ordering/pagination:
  - `listings`: `category ASC, createdAt DESC`; `sellerId ASC, createdAt DESC`; `featured ASC, createdAt DESC`.
- [ ] **First admin**: after the operator signs in once, set the custom claim with a one-off Admin SDK script:
  ```js
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  // The admin must sign out & back in — claims are baked into the session cookie.
  ```
- [ ] Optional **seed**: `npm run seed` (skip for a clean production DB; use only for a demo environment).
- [ ] Verify production env vars present at **build time** (`NEXT_PUBLIC_*`) and **runtime** (`FIREBASE_*` / ADC).
- [ ] Smoke the deployed URL: public routes 200, protected routes redirect to `/login`, API routes 401 unauthenticated.
- [ ] Roll-back plan: keep the previous release/revision; know how to pin traffic to it.

## 4. Domain Setup Checklist

- [ ] Choose domain: `afrosmart.com` (global) and/or `afrosmart.lr` (Liberia TLD via LIBTELCO/registrar). Recommend securing both; serve from `.com`, redirect `.lr`.
- [ ] Point DNS at the host (Firebase App Hosting / Cloud Run provides target records).
- [ ] Add the custom domain in the host console; complete domain verification (TXT record).
- [ ] **Managed SSL** auto-provisions (Google-managed cert) — confirm HTTPS + auto-redirect from HTTP.
- [ ] Add the apex + `www` (and `.lr`) to Firebase Auth **Authorized domains**.
- [ ] Add the apex + `www` to App Check / reCAPTCHA allowed domains.
- [ ] Set canonical host (redirect `www` → apex or vice-versa).
- [ ] Verify email/SMS sender names reference the domain/brand.

## 5. Google Cloud Hosting Checklist

AfroSmart needs a **Node server** (SSR, route handlers, server actions, `force-dynamic` pages) — not a static export.

**Recommended: Firebase App Hosting** (runs Next.js on Cloud Run under the hood, native Firebase integration).
- [ ] `firebase init apphosting`; connect the GitHub repo + branch (`main`).
- [ ] Add `apphosting.yaml`: set runtime, min/max instances, and reference secrets from **Secret Manager** (do not inline `FIREBASE_PRIVATE_KEY`).
- [ ] Ensure `NEXT_PUBLIC_FIREBASE_*` are present **at build time**; server secrets at **runtime**.
- [ ] First rollout builds on push; verify the live URL.
- [ ] Set **min instances = 1** (avoid cold starts for Liberia latency) and a sane max.

**Alternative: Cloud Run (container)**
- [ ] `Dockerfile` is included (Next standalone output via `BUILD_STANDALONE`); build with Cloud Build.
- [ ] `gcloud run deploy afrosmart --source . --region <region> --allow-unauthenticated`.
- [ ] Bind the runtime **service account** with least privilege (Firestore/Storage user roles only) → enables ADC (§7).
- [ ] Configure concurrency, min instances = 1, memory ≥ 512 MB.

Common:
- [ ] Region choice benchmarked for Liberia round-trip (test EU-west vs. us regions).
- [ ] CDN/edge caching for static assets (`_next/static`) — long-cache immutable assets.
- [ ] Health check + uptime check (§6).

## 6. Monitoring and Logging Checklist

- [ ] **Cloud Logging**: app logs flow from App Hosting/Cloud Run; create log-based metrics for 5xx and 429 rates.
- [ ] **Cloud Monitoring**: dashboards for request latency, error rate, instance count; **uptime check** on `/` + alerting policy (email/SMS to on-call).
- [ ] **Error reporting**: integrate Sentry (or Cloud Error Reporting) for unhandled exceptions in route handlers/server actions.
- [ ] **Firebase Performance Monitoring (web)** + **Google Analytics 4** for real-user metrics (load time on Liberian networks, funnel: browse → message → unlock).
- [ ] **Firestore usage** dashboard; alert on read/write spikes (catches runaway `force-dynamic` cost or abuse).
- [ ] **BUDGET CAP**: set a Google Cloud **budget + alerts** (e.g., alert at 50/90/100%) — protects against bill blowups from traffic or abuse. Consider a hard cap via a kill-switch function.
- [ ] **Auth monitoring**: track OTP send volume/cost (SMS) and failed-verification rates.
- [ ] Log retention policy + PII review (never log phone numbers).

## 7. Security Hardening Checklist

- [ ] **Run the rules emulator suite green** (§2) — blocker.
- [ ] **Firebase App Check**: enforce on Firestore, Storage, and Auth so only the real app (reCAPTCHA Enterprise on web) can call the backend — blocks scripted abuse beyond the in-app rate limits.
- [ ] **Security headers** in `next.config.ts`: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`.
- [ ] **Use Application Default Credentials in production** instead of a private key in env: on GCP, init the Admin SDK with no explicit cert (the runtime service account provides creds). Keep the key-based path only for local/seed. *(Update `lib/firebase/admin.ts` to prefer ADC when `FIREBASE_PRIVATE_KEY` is absent.)*
- [ ] **Secret Manager** for all server secrets; never in the repo or image layers.
- [ ] **Least-privilege** runtime service account (Firestore + Storage user roles only).
- [ ] Confirm rate limits live (messages 30/min, reports 5/hr, listings 10/hr, threads 20/hr, ratings 20/hr) and the **rating interaction gate** enforced server-side.
- [ ] reCAPTCHA Enterprise on phone auth; monitor SMS abuse + set quotas.
- [ ] Firestore/Storage **daily backups** + tested restore.
- [ ] Dependency audit (`npm audit`) triaged; pin versions.
- [ ] Privacy Policy + Terms pages published (login footer already links them).
- [ ] Incident response: who gets paged, how to suspend a user / remove a listing fast (admin console already supports this).

---

## 8. First 100 Users — Acquisition Plan

Goal: 100 verified, *active* users (posted or messaged) within 2 weeks of closed beta. Liberia is mobile-first, WhatsApp/Facebook-heavy, English-speaking, with high data costs — lead with low-data, trust, and word-of-mouth.

1. **Seed supply first (chicken-and-egg):** recruit 20–30 real sellers (phone shops, car dealers, landlords, service providers) in Monrovia *before* inviting buyers. A marketplace with empty shelves churns. (See §9.)
2. **WhatsApp broadcast + groups:** AfroSmart is shareable by link; seed it into active buy/sell WhatsApp groups (Monrovia community, university, church, market associations). Personal invites convert best.
3. **Facebook Marketplace migration:** Liberians already trade on Facebook groups — DM active sellers there with a "list it free on AfroSmart, get calls only after a real buyer messages you" pitch (the call-unlock privacy angle is the differentiator).
4. **Campus ambassadors:** University of Liberia, Cuttington, AME — 5–10 student ambassadors with a referral incentive (airtime/data top-ups).
5. **Physical presence:** flyers/QR at Waterside, Red-Light, Duala markets and busy junctions; a one-line value prop in Liberian English ("Buy & sell smart — your number stays private till a real buyer calls").
6. **Radio mention:** a short spot/interview on a popular Monrovia station (ELBC, Truth FM, OK FM).
7. **Referral loop:** "invite a friend" with airtime reward; track via UTM links.

Metrics to watch: signups, % who post or message (activation), call-unlocks (real intent), D7 retention.

## 9. First 500 Listings — Acquisition Plan

Goal: 500 quality active listings within ~3 weeks, concentrated in Montserrado first.

1. **Seller concierge / white-glove onboarding:** an ambassador sits with a seller and posts their first 3–5 items (photos + price). Removes the friction; guarantees quality.
2. **Category beachheads:** go deep before broad — **Phones & Electronics** (Waterside/Center Street shops), **Cars** (dealers + Kakata/Paynesville lots), **Property/rentals** (agents), **Services** (generator repair, tailors, etc.). 100+ listings in 2–3 categories beats 50 thin ones across all 7.
3. **Bulk import deals:** partner with shops that have inventory lists; help them post in a session.
4. **Listing incentives:** "first 100 sellers get a Featured badge free for a month"; small airtime reward for sellers who post ≥5 items with photos.
5. **Quality bar:** ambassadors ensure title/price/photo/county on every listing; the admin console removes spam/fakes early (keeps trust high while small).
6. **Geographic focus:** Montserrado (Monrovia, Paynesville) first; expand to Nimba (Ganta), Bong (Gbarnga), Margibi (Kakata) once liquidity is proven.

Metrics: listings/day, % with photos, listings per active seller, time-to-first-message per listing.

## 10. Liberia Launch Strategy

- **Mobile-first, low-data:** the app is already lightweight (placeholder imagery, lean pages) — keep image optimization on the roadmap (Phase 8 hardening) because data is expensive on Orange/Lonestar/MTN. Emphasize "works on small data."
- **Trust is the product:** the **call-unlock** model (phone hidden until a real buyer messages and the seller replies) directly addresses scam fear and number-harvesting — make it the headline message everywhere.
- **No in-app payments (by design):** transactions are contact + meet-in-person. Messaging is paired with **safe-meetup guidance** (public places, daytime). This avoids payment-rail complexity and fraud liability for the MVP.
- **Geographic rollout:** Monrovia/Montserrado density first → then Ganta, Gbarnga, Kakata, Buchanan as liquidity proves out (counties already modeled).
- **Local language tone:** UI is English; marketing copy in approachable Liberian English.
- **Community channels:** WhatsApp + Facebook are the real distribution; radio for reach; markets/campuses for ground game.
- **Moderation & safety:** lean on the admin console (remove listing, suspend user, resolve reports) + rate limits to keep the early community clean; respond fast to reports.
- **Sequenced launch:** soft (20 trusted) → closed beta (100 users / 500 listings, Monrovia) → public beta (after perf hardening + a week of feedback).

---

## Recommended timeline

- **Soft launch:** ~2026-06-12 (20 trusted users, Monrovia)
- **Closed beta:** ~2026-06-16 (first 100 users, 500-listing drive)
- **Public beta:** ~2026-06-30 (after ISR/image hardening + closed-beta feedback)

*Status: runbook only — no infrastructure provisioned, nothing deployed.*

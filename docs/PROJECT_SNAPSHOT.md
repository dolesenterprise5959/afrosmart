# AfroSmart — Project Snapshot

**Captured:** 2026-06-12 · **Known‑good commit:** `72d6016` (origin/main) · **Status:** ✅ live & healthy

A point‑in‑time record of the working AfroSmart deployment. See `RESTORE_GUIDE.md` to recover this version.

---

## 1. Deployed URL
- **Live (working):** https://afrosmart--afrosmart.us-central1.hosted.app — homepage / login / wallet / marketplace all return **200**.
- **Custom domain:** `afrosmart.app` — **not resolving yet** (DNS records not added). It *is* in Firebase authorized domains, so login will work there once DNS is set up.
- **Host:** Firebase App Hosting, backend **`afrosmart`** (`us-central1`). Auto‑rollout on every push to `main`.

## 2. GitHub branch + latest merged PRs
- **Branch:** `main` · **HEAD:** `72d6016` (Merge PR #34).
- **Recent merges (newest first):**
  - #34 neutral title placeholder · #33 observability+docs · #32 wallet honest‑payout UI · #30 security+login *(#30/#32/#33 from the `7zwebdevelopers` fork)*
  - #29/#28/#27 lucide SVG icon system · #26/#25 favicon + PWA · #24 admin auth‑events viewer
  - #23 login UX (rate‑limit vs wrong‑code, countdowns) · #22 wallet bottom‑nav + Invite Friends
  - earlier: #12 in‑app‑browser dropdown fix · #13/#14 referral & wallet · #15 image static‑import fix · #18 scalable search · #20 enforced CSP · #21 images.unoptimized

## 3. Firebase configuration — ✅ connected
- **Project:** `afrosmart`. Web config hard‑coded (with env fallbacks) in `lib/firebase/client.ts` (`apiKey …faloo`, `authDomain afrosmart.firebaseapp.com`).
- **Admin SDK:** Application Default Credentials on App Hosting (works in prod; **not** configured locally).
- **Firestore rules:** deployed (phone protected; wallet/referral/notification fields server‑only).
- **Firestore indexes:** deployed (powers scalable search).
- **Storage rules:** deployed (owner‑only writes, size/type limits).
- **App Check:** OFF by design (it broke phone auth; removed in `client.ts`).

## 4. Authentication — ✅ working
- Phone OTP (Firebase Phone Auth). **Authorized domains include `afrosmart--afrosmart.us-central1.hosted.app`** (verified) — this was the fix for the "couldn't complete in this browser" error.
- reCAPTCHA: **Enterprise not configured → falls back to reCAPTCHA v2** (works for real users; headless bots can't pass it).
- Session: `httpOnly` + `secure` + `sameSite=lax`, verified with revocation check each request.
- Login UX hardened: distinct rate‑limit vs wrong‑code messages, resend/lockout countdowns, in‑app‑browser gating; **all auth failures logged** to the `authEvents` collection.
- **Tests:** 79 unit tests passing; production build clean.

## 5. Wallet — ✅ built (display‑only payouts)
- `/wallet` + bottom‑nav tab. Shows wallet balance, lifetime earnings, valid referrals, progress tracker, **Invite Friends** (native share → WhatsApp).
- Referral rewards: $5 per 10 valid referrals, auto‑credited transactionally; all server‑controlled (clients can't self‑credit).
- **Withdrawals: NOT built** — UI shows eligibility only (PR #32 made the copy honest). No payout flow yet.
- ⚠️ Not yet exercised end‑to‑end with two real accounts.

## 6. Profile / account — ✅ working
- Onboarding (name + optional referral‑code entry / `?ref=` deep link), public profiles `/u/[id]` (phone stripped), settings (incl. avatar upload), dashboard (metrics + links).

## 7. Listing creation — ✅ working
- Posting wizard: category picker (SVG icons), photos with **client‑side compression (~81 KB)**, **vehicle Make/Model/Year dependent dropdowns** (custom tap‑based dropdown that works in in‑app browsers), neutral title placeholder ("What are you selling?").
- Manage via ⋮ menu (Edit / Mark Sold / Pause / Delete). Validity trigger fires referral crediting on first listing.

## 8. Chat / messaging — ✅ built (needs smoke test)
- Inbox, thread view, send, read receipts, **call‑unlock** (reveals seller phone). Server‑mediated routes + participant‑gated Firestore rules.
- ⚠️ **Not verified end‑to‑end with two real users** — recommend a real‑device smoke test.

## 9. Remaining bugs / warnings / known issues
| # | Issue | Severity |
|---|---|---|
| 1 | `afrosmart.app` **DNS not set up** — custom domain doesn't resolve; sitemap/canonical/OG point at it; login works only on the hosted.app URL | 🟠 launch |
| 2 | **Billing budget + SMS region lock NOT set** — SMS‑pumping fraud / cost risk | 🟠 launch |
| 3 | **Admin access** requires running `scripts/grant-admin.mjs` once — no `/admin` access until then | 🟡 |
| 4 | **Near‑empty marketplace** (~1 real listing) — no inventory | 🟠 launch |
| 5 | **No monetization** wired (Mobile Money) — $0 revenue path | 🟡 |
| 6 | reCAPTCHA Enterprise fails → v2 fallback (works; optional Enterprise setup for smoother UX) | 🟢 |
| 7 | next/image optimizer unavailable on App Hosting → `images.unoptimized`; images load **full‑size** (no resizing → bandwidth) | 🟡 |
| 8 | `/categories` cached aggressively (`s-maxage` ~1yr) → clients may see stale until hard‑refresh | 🟢 |
| 9 | Withdrawals not built; referral/wallet + messaging not e2e‑verified | 🟡 |
| 10 | ~6 minor emoji stragglers remain (country flags + rating ★ intentionally kept) | 🟢 |

## 10. Next recommended priorities
1. **`afrosmart.app` DNS** → custom domain + SEO + login on the branded URL.
2. **Billing budget + SMS region = Liberia** (Cloud console) — cost/fraud guardrail.
3. **Grant yourself admin** → `node scripts/grant-admin.mjs +231YOURNUMBER`.
4. **Real inventory** → onboard sellers / seed real listings.
5. **Real‑device smoke test** → login → post → message → wallet (incl. a Facebook in‑app‑browser link).
6. **End‑to‑end referral test** with two accounts.
7. **Monetization decision** (Mobile Money) if revenue is needed at launch.

---
*Out of scope / not part of AfroSmart: the separate Facebook Marketplace bot in `~/Desktop/VoiceAssistant` is intentionally not built/operationalized here.*

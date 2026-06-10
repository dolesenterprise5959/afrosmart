# AfroSmart

A mobile-first classifieds & marketplace for **Liberia** — buy and sell across
vehicles, property, jobs, services, and general goods, with built-in messaging,
phone-verified accounts, seller verification, and a referral wallet.

Built with the Next.js App Router and Firebase. Designed for low-end Android
devices and slow mobile networks (client-side image compression, no image
optimizer dependency, short cache windows).

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| UI | React 19, Tailwind CSS v4, lucide-react icons |
| Auth | Firebase Phone Auth (OTP) → httpOnly session cookie verified server-side |
| Data | Cloud Firestore (Admin SDK on the server, Web SDK for realtime reads) |
| Files | Firebase Storage (listing + profile photos) |
| Tests | Vitest (unit) + Firestore rules emulator suite |
| Hosting | Firebase App Hosting (Cloud Run under the hood) |

## How auth works

1. User enters a phone number → Firebase Phone Auth sends an OTP (with a
   reCAPTCHA challenge; an "open in Chrome/Safari" escape handles in-app browsers).
2. On success the client gets a Firebase ID token and POSTs it to
   `/api/auth/session`, which verifies it and sets an **httpOnly** session cookie.
3. Every server request re-verifies that cookie with revocation checks
   (`lib/auth/dal.ts`) — the cookie, not the client, is the source of truth.
4. New users pass through `/welcome` to set a display name before continuing.

An optional WhatsApp/SMS fallback OTP path exists (`/api/auth/otp/*`) and stays
disabled until a provider is configured (`NEXT_PUBLIC_OTP_FALLBACK_ENABLED`).

## Project layout

```
app/            App Router routes, server actions, and API route handlers
components/     UI components (layout, listing, messaging, auth, admin, …)
lib/firestore/  Data-access layer — one module per domain (listings, threads, …)
lib/auth/       Session DAL, custom OTP, constants
lib/firebase/   Client + Admin SDK init, Storage uploaders
firestore.rules / storage.rules    Security rules (clients read; trusted writes go via Admin SDK)
tests/          Vitest unit tests + Firestore rules tests
```

## Local development

Requires **Node 20+**.

```bash
npm install
cp .env.local.example .env.local   # then fill in the values below
npm run dev                        # http://localhost:3000
```

### Environment variables

`.env.local` is gitignored — never commit real credentials. See
`.env.local.example` for the full template.

- `NEXT_PUBLIC_FIREBASE_*` — Firebase **Web** config (public by design; inlined
  into the client bundle at build time).
- `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` —
  Admin SDK service-account creds for **local** dev and the seed script. In
  production on Google Cloud these stay unset and the app uses Application
  Default Credentials.

> **Making login actually work locally** requires a real Firebase project with
> **Phone Authentication enabled**, `localhost` added to **Authorized domains**,
> and either billing enabled (real SMS) or **test phone numbers** configured in
> the Firebase console (see `lib/testNumbers.ts`). Without Admin credentials the
> app still boots and serves mock data, but OTP sign-in will not complete.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit suite |
| `npm run test:rules` | Firestore security-rules tests (needs Java for the emulator) |
| `npm run seed` | Seed sample users/listings (idempotent; respects `.env.local`) |

## Deployment

The canonical target is **Firebase App Hosting** (`apphosting.yaml`); see
`DEPLOYMENT_GUIDE.md`. A direct **Cloud Run** path via the bundled `Dockerfile`
is the alternative — it sets `BUILD_STANDALONE=true` so `next build` emits a
standalone server, while App Hosting (which sets no such env) keeps the default
output. Pick one; the app is **not** served through Firebase Hosting
(`firebase.json` carries only Firestore/Storage/emulator config).

## Security notes

- The Firebase **Web** API key is public (it ships in every client bundle) — that
  is expected. Protect it with **GCP key restrictions**: lock it to your domains
  (HTTP-referrer) and to the Firebase Auth/Firestore/Storage APIs only. Do not
  rely on hiding it.
- All trusted writes go through the Admin SDK server-side; Firestore/Storage
  rules deny client writes to protected fields.
- Unauthenticated endpoints (OTP send, assistant) are rate-limited per client IP.
- Post-login redirects are validated (`lib/utils/safe-redirect.ts`) and
  user-supplied image URLs are allowlisted to Firebase Storage hosts
  (`lib/utils/image-url.ts`).

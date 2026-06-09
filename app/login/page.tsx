"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";
import { createRecaptcha, sendOtp, confirmOtp, signInWithCustomTokenAndSession } from "@/lib/firebase/auth-client";
import { validateMobile, toE164For } from "@/lib/utils/phone";
import { COUNTRIES, DEFAULT_COUNTRY, findCountry } from "@/lib/countries";
import { describeAuthError, describeVerifyError } from "@/lib/auth/otp-errors";
import { logLoginEvent } from "@/app/login/actions";
import { detectInApp, type InAppInfo } from "@/lib/utils/in-app-browser";

type FallbackChannel = "whatsapp" | "sms";

// In-app browsers (Messenger/Facebook/Instagram WebViews) block the cross-origin
// storage reCAPTCHA + Firebase Phone Auth need, so verification can't complete —
// the reliable fix is to open AfroSmart in Chrome/Safari.
function OpenInBrowserCard({ info, heading }: { info: InAppInfo; heading?: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const host = typeof window !== "undefined" ? window.location.host : "";
  const path = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
  const intentUrl = `intent://${host}${path}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  }
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-left text-amber-900">
      <p className="text-sm font-semibold">⚠️ {heading ?? "Sign-in needs Chrome or Safari"}</p>
      <p className="mt-1 text-xs">
        {info.name ? `${info.name}'s built-in browser` : "This in-app browser"} blocks phone verification.
        Open AfroSmart in your normal browser to sign in.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {info.android && (
          <a href={intentUrl} className="inline-flex h-9 items-center rounded-full bg-amber-900 px-3 text-xs font-semibold text-white">Open in Chrome</a>
        )}
        <button type="button" onClick={copy} className="inline-flex h-9 items-center rounded-full border border-amber-400 px-3 text-xs font-semibold">
          {copied ? "Link copied!" : "Copy link"}
        </button>
      </div>
      {info.ios && (
        <p className="mt-2 text-xs">On iPhone: tap the <strong>ᴬA</strong> or <strong>•••</strong> menu (top corner) → <strong>Open in Safari</strong>.</p>
      )}
    </div>
  );
}

// Paid WhatsApp/SMS fallback stays OFF until a provider is configured. Until then
// production runs Firebase Phone Auth + visible-reCAPTCHA fallback only.
const FALLBACK_ENABLED = process.env.NEXT_PUBLIC_OTP_FALLBACK_ENABLED === "true";

const RESEND_COOLDOWN = 30; // seconds between code sends (anti-spam)
const MAX_ATTEMPTS = 5; // wrong codes before a lockout
const LOCKOUT_SECONDS = 60;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const { configured } = useAuth();

  // Country — Liberia by default; a deep-link (?country=US) preselects another.
  const initialCountry = findCountry(params.get("country") ?? "") ?? DEFAULT_COUNTRY;
  const [country, setCountry] = useState(initialCountry);

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Reliability state: count reCAPTCHA failures, escalate invisible→visible, and
  // expose the WhatsApp/SMS fallback after 2 failures. method drives the verify step.
  const [method, setMethod] = useState<"firebase" | FallbackChannel>("firebase");
  const [captchaFails, setCaptchaFails] = useState(0);
  const [recaptchaSize, setRecaptchaSize] = useState<"invisible" | "normal">("invisible");
  const [showFallback, setShowFallback] = useState(false);
  // In-app browser detection + an "open in Chrome/Safari" escape on reCAPTCHA failure.
  const [inApp, setInApp] = useState<InAppInfo>({ inApp: false, name: "", ios: false, android: false });
  const [showOpenInBrowser, setShowOpenInBrowser] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setInApp(detectInApp()));
  }, []);

  // Anti-spam (resend cooldown) + brute-force lockout + device rate-limit countdowns.
  const [resendIn, setResendIn] = useState(0);
  const [lockedFor, setLockedFor] = useState(0);
  const [cooldown, setCooldown] = useState(0); // Firebase "too-many-requests" device cooldown
  const attemptsRef = useRef(0);

  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    if (resendIn <= 0 && lockedFor <= 0 && cooldown <= 0) return;
    const t = setInterval(() => {
      setResendIn((s) => Math.max(0, s - 1));
      setLockedFor((s) => Math.max(0, s - 1));
      setCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendIn, lockedFor, cooldown]);

  async function send() {
    setError(null);
    const localError = validateMobile(phone, country);
    if (localError) {
      setError(localError);
      return;
    }
    if (resendIn > 0 || cooldown > 0) return;
    // Don't burn a Firebase attempt inside an in-app browser — it can't complete.
    if (inApp.inApp) { setShowOpenInBrowser(true); return; }

    setPending(true);
    const e164 = toE164For(phone, country.dialCode);
    try {
      verifierRef.current ??= createRecaptcha("recaptcha-container", recaptchaSize);
      // Convert the local number to E.164 using the selected country's dial code.
      confirmationRef.current = await sendOtp(e164, verifierRef.current);
      attemptsRef.current = 0;
      setResendIn(RESEND_COOLDOWN);
      setMethod("firebase");
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
      void logLoginEvent({ status: "sent", phone: e164, country: `${country.code} ${country.dialCode}`, code: "ok", provider: "firebase", ua, inApp: inApp.name });
      setStep("otp");
    } catch (err) {
      const ex = err as { code?: string } | null;
      const code = ex?.code ?? "unknown";
      const { reason, message } = describeAuthError(code);
      console.error("[login] sendOtp failed:", code);
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
      void logLoginEvent({ status: "failed", phone: e164, country: `${country.code} ${country.dialCode}`, code, provider: "firebase", ua, inApp: inApp.name });
      setError(message);

      // reCAPTCHA/network/unknown failed → always give a real escape (open in a
      // proper browser — the reliable fix for in-app WebViews) so users aren't stuck.
      if (reason === "captcha" || reason === "network" || reason === "unknown") {
        setShowOpenInBrowser(true);
        const fails = captchaFails + 1;
        setCaptchaFails(fails);
        if (fails === 1) {
          // Also retry with a VISIBLE checkbox (helps real browsers; ignored by WebViews).
          try { verifierRef.current?.clear(); } catch { /* ignore */ }
          verifierRef.current = null;
          setRecaptchaSize("normal");
        }
        if (fails >= 2 && FALLBACK_ENABLED) setShowFallback(true);
      } else if (reason === "quota" || reason === "too-many") {
        // Device rate-limit: show a countdown instead of letting them keep tapping
        // (which only deepens the limit). This is the root of "too many attempts".
        setCooldown(120);
        if (FALLBACK_ENABLED) setShowFallback(true);
      }
    } finally {
      setPending(false);
    }
  }

  // ---- Fallback OTP (WhatsApp / SMS) ----
  async function sendFallback(channel: FallbackChannel) {
    setError(null);
    const localError = validateMobile(phone, country);
    if (localError) { setError(localError); return; }
    setPending(true);
    const e164 = toE164For(phone, country.dialCode);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: e164, channel, country: `${country.code} ${country.dialCode}` }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Couldn't send the code. Try the other method."); return; }
      attemptsRef.current = 0;
      setMethod(channel);
      setResendIn(RESEND_COOLDOWN);
      setStep("otp");
    } catch {
      setError("Network problem. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (lockedFor > 0) return;
    setError(null);
    setPending(true);
    try {
      if (method === "firebase") {
        if (!confirmationRef.current) { setPending(false); return; }
        await confirmOtp(confirmationRef.current, code);
      } else {
        // Fallback: verify the custom OTP → custom token → session.
        const e164 = toE164For(phone, country.dialCode);
        const res = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: e164, code }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.token) throw new Error(data.error ?? "Verification failed.");
        await signInWithCustomTokenAndSession(data.token);
      }
      void logLoginEvent({ status: "verified", phone: toE164For(phone, country.dialCode), country: `${country.code} ${country.dialCode}`, code: "ok", provider: method });
      // Route through onboarding — new users enter their name, returning users
      // with a name are passed straight through to `next`.
      router.replace(`/welcome?next=${encodeURIComponent(next)}`);
      router.refresh();
    } catch (err) {
      const fbCode = (err as { code?: string })?.code;
      console.error("[login] verify failed:", fbCode ?? err);
      // Log EVERY verify failure with its exact code so failures are diagnosable.
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
      void logLoginEvent({
        status: "verify_failed",
        phone: toE164For(phone, country.dialCode),
        country: `${country.code} ${country.dialCode}`,
        code: fbCode ?? "verify-failed",
        provider: method,
        ua,
        inApp: inApp.name,
      });

      const { reason, message, lockSeconds } = describeVerifyError(fbCode);
      if (reason === "too-many") {
        // Firebase device rate-limit — NOT a wrong code. Countdown, don't penalise.
        setLockedFor(lockSeconds ?? 120);
        setError(message);
      } else if (reason === "expired" || reason === "network" || reason === "provider") {
        // Recoverable without burning an attempt — tell them exactly what to do.
        setError(message);
      } else if (reason === "wrong-code") {
        attemptsRef.current += 1;
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          attemptsRef.current = 0;
          setLockedFor(LOCKOUT_SECONDS);
          setError(`Too many incorrect codes. Please wait ${LOCKOUT_SECONDS}s, then request a new code.`);
        } else {
          const left = MAX_ATTEMPTS - attemptsRef.current;
          setError(`${message} ${left} attempt${left === 1 ? "" : "s"} left before a short lockout.`);
        }
      } else if (method !== "firebase" && err instanceof Error && err.message) {
        // Fallback (WhatsApp/SMS) path returns a server message — surface it.
        setError(err.message);
      } else {
        setError(message);
      }
    } finally {
      setPending(false);
    }
  }

  const inputBox =
    "h-12 w-full rounded-xl border border-border bg-card px-4 text-base outline-none focus:border-brand";
  const submit =
    "inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-base font-medium text-brand-foreground hover:bg-brand-dark disabled:opacity-50";

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-10">
      <div className="text-center">
        <div className="flex justify-center">
          <Logo href={null} full size="lg" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Sign in to AfroSmart</h1>
        <p className="mt-1 text-sm text-muted">
          {step === "phone"
            ? "Enter your phone number and we'll text you a code. New here? This also creates your account."
            : `Enter the 6-digit code sent ${method === "whatsapp" ? "via WhatsApp" : method === "sms" ? "by SMS" : ""} to ${toE164For(phone, country.dialCode)}.`}
        </p>
      </div>

      {!configured && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ Firebase isn’t configured yet. Add your keys to <code>.env.local</code>{" "}
          (see <code>.env.local.example</code>) to enable phone sign-in.
        </div>
      )}

      {/* Up-front warning for Messenger/Facebook/Instagram in-app browsers. */}
      {inApp.inApp && (
        <div className="mt-6">
          <OpenInBrowserCard info={inApp} />
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="mt-6 flex flex-col gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Phone Number</span>

            {/* One country selector — the only place a flag appears. */}
            <select
              aria-label="Country"
              value={country.code}
              onChange={(e) => setCountry(findCountry(e.target.value) ?? DEFAULT_COUNTRY)}
              className="h-12 w-full rounded-xl border border-border bg-card px-3 text-base outline-none focus:border-brand"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.dialCode})</option>
              ))}
            </select>

            {/* Plain phone input — no flag, no dial-code prefix. */}
            <input
              className="h-12 w-full rounded-xl border border-border bg-card px-4 text-base outline-none focus:border-brand"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder={`Phone number (e.g. ${country.example})`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* On failure outside a detected in-app browser, still offer the escape. */}
          {showOpenInBrowser && !inApp.inApp && (
            <OpenInBrowserCard info={inApp} heading="Couldn't verify — open in Chrome or Safari" />
          )}

          {/* Visible checkbox only helps real browsers; never shown for Webviews. */}
          {recaptchaSize === "normal" && !inApp.inApp && (
            <p className="text-xs text-muted">If a verification box appears below, tick it, then tap “Send code” again.</p>
          )}
          {/* reCAPTCHA renders here (invisible by default; visible checkbox after a failure). */}
          <div id="recaptcha-container" className={recaptchaSize === "normal" ? "flex justify-center" : ""} />

          <button type="submit" className={submit} disabled={pending || !configured || cooldown > 0 || inApp.inApp}>
            {cooldown > 0
              ? `Too many attempts — wait ${cooldown}s`
              : inApp.inApp
                ? "Open in Chrome/Safari to continue"
                : pending
                  ? "Sending…"
                  : "Send code"}
          </button>
          {cooldown > 0 && (
            <p className="text-center text-xs text-muted">
              ⏳ This is Firebase’s device safety limit. The timer must finish before another code can be sent.
            </p>
          )}

          {showFallback && FALLBACK_ENABLED && (
            <div className="mt-1 rounded-xl border border-border bg-card p-3">
              <p className="text-sm font-medium">Having trouble getting the SMS?</p>
              <p className="mt-0.5 text-xs text-muted">Get your verification code another way:</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => void sendFallback("whatsapp")} disabled={pending}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#25D366] text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50">
                  💬 WhatsApp
                </button>
                <button type="button" onClick={() => void sendFallback("sms")} disabled={pending}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-border text-sm font-semibold hover:bg-surface disabled:opacity-50">
                  📩 SMS
                </button>
              </div>
            </div>
          )}
        </form>
      ) : (
        <form onSubmit={handleVerify} className="mt-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Verification code</span>
            <input
              className={`${inputBox} tracking-[0.4em]`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="------"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {/* Clear, always-visible countdowns so users know exactly when they can act. */}
          {lockedFor > 0 && (
            <p className="text-center text-sm font-medium text-amber-700">
              ⏳ Wait {lockedFor}s, then tap “Resend code” for a fresh code.
            </p>
          )}
          {lockedFor === 0 && resendIn > 0 && (
            <p className="text-center text-xs text-muted">You can request a new code in {resendIn}s.</p>
          )}
          <button type="submit" className={submit} disabled={pending || lockedFor > 0}>
            {pending ? "Verifying…" : lockedFor > 0 ? `Locked — wait ${lockedFor}s` : "Verify & continue"}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-muted hover:text-foreground"
              onClick={() => { setStep("phone"); setCode(""); setError(null); setMethod("firebase"); }}
            >
              ← Use a different number
            </button>
            <button
              type="button"
              disabled={resendIn > 0 || pending}
              className="font-medium text-brand disabled:text-muted"
              onClick={() => (method === "firebase" ? void send() : void sendFallback(method))}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-muted">
        By continuing you agree to AfroSmart’s Terms and Privacy Policy.
      </p>
    </div>
  );
}

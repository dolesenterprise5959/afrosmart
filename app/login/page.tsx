"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";
import { createRecaptcha, sendOtp, confirmOtp, toE164 } from "@/lib/firebase/auth-client";
import { validateLiberianMobile } from "@/lib/utils/phone";
import { DEFAULT_COUNTRY } from "@/lib/countries";

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

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Anti-spam (resend cooldown) + brute-force lockout countdowns.
  const [resendIn, setResendIn] = useState(0);
  const [lockedFor, setLockedFor] = useState(0);
  const attemptsRef = useRef(0);

  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    if (resendIn <= 0 && lockedFor <= 0) return;
    const t = setInterval(() => {
      setResendIn((s) => Math.max(0, s - 1));
      setLockedFor((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendIn, lockedFor]);

  async function send() {
    setError(null);
    const localError = validateLiberianMobile(phone);
    if (localError) {
      setError(localError);
      return;
    }
    if (resendIn > 0) return;

    setPending(true);
    try {
      verifierRef.current ??= createRecaptcha("recaptcha-container");
      // sendOtp normalises the local number to E.164 (+231…) automatically.
      confirmationRef.current = await sendOtp(phone, verifierRef.current);
      attemptsRef.current = 0;
      setResendIn(RESEND_COOLDOWN);
      setStep("otp");
    } catch (err) {
      const c = (err as { code?: string } | null)?.code;
      setError(
        c === "auth/invalid-phone-number" || c === "auth/missing-phone-number"
          ? "That doesn't look like a valid Liberian number. Enter your local number, e.g. 77 000 0000."
          : c === "auth/too-many-requests"
            ? "Too many attempts from this device. Please wait a few minutes and try again."
            : err instanceof Error
              ? err.message
              : "Could not send code. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmationRef.current || lockedFor > 0) return;
    setError(null);
    setPending(true);
    try {
      await confirmOtp(confirmationRef.current, code);
      router.replace(next);
      router.refresh();
    } catch {
      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        attemptsRef.current = 0;
        setLockedFor(LOCKOUT_SECONDS);
        setError(`Too many incorrect codes. Please wait ${LOCKOUT_SECONDS}s, then request a new code.`);
      } else {
        const left = MAX_ATTEMPTS - attemptsRef.current;
        setError(`That code didn't work. ${left} attempt${left === 1 ? "" : "s"} left before a short lockout.`);
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
            : `Enter the 6-digit code sent to ${toE164(phone)}.`}
        </p>
      </div>

      {!configured && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ Firebase isn’t configured yet. Add your keys to <code>.env.local</code>{" "}
          (see <code>.env.local.example</code>) to enable phone sign-in.
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="mt-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Phone number</span>
            <div className="flex h-12 items-center rounded-xl border border-border bg-card focus-within:border-brand">
              <span className="pl-3 pr-1 text-xl" aria-hidden>{DEFAULT_COUNTRY.flag}</span>
              <input
                className="h-12 min-w-0 flex-1 rounded-r-xl bg-transparent px-2 text-base outline-none"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder={DEFAULT_COUNTRY.example}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <span className="text-xs text-muted">
              Enter your Liberian mobile number — we add {DEFAULT_COUNTRY.dialCode} automatically (Lonestar 77…, Orange 88…).
            </span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className={submit} disabled={pending || !configured}>
            {pending ? "Sending…" : "Send code"}
          </button>
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
          <button type="submit" className={submit} disabled={pending || lockedFor > 0}>
            {pending ? "Verifying…" : lockedFor > 0 ? `Locked — wait ${lockedFor}s` : "Verify & continue"}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-muted hover:text-foreground"
              onClick={() => { setStep("phone"); setCode(""); setError(null); }}
            >
              ← Use a different number
            </button>
            <button
              type="button"
              disabled={resendIn > 0 || pending}
              className="font-medium text-brand disabled:text-muted"
              onClick={() => void send()}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-muted">
        By continuing you agree to AfroSmart’s Terms and Privacy Policy.
      </p>

      {/* Invisible reCAPTCHA mounts here (required by Firebase phone auth). */}
      <div id="recaptcha-container" />
    </div>
  );
}

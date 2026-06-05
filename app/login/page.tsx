"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import { createRecaptcha, sendOtp, confirmOtp, toE164 } from "@/lib/firebase/auth-client";

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

  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      verifierRef.current ??= createRecaptcha("recaptcha-container");
      confirmationRef.current = await sendOtp(phone, verifierRef.current);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmationRef.current) return;
    setError(null);
    setPending(true);
    try {
      await confirmOtp(confirmationRef.current, code);
      router.replace(next);
      router.refresh();
    } catch {
      setError("That code didn't work. Please check it and try again.");
    } finally {
      setPending(false);
    }
  }

  const field =
    "h-12 w-full rounded-xl border border-border bg-card px-4 text-base outline-none focus:border-brand";
  const submit =
    "inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-base font-medium text-brand-foreground hover:bg-brand-dark disabled:opacity-50";

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-10">
      <div className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand text-xl font-bold text-brand-foreground">
          A
        </span>
        <h1 className="mt-4 text-xl font-bold">Sign in to AfroSmart</h1>
        <p className="mt-1 text-sm text-muted">
          {step === "phone"
            ? "Enter your phone number and we'll text you a code."
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
        <form onSubmit={handleSendOtp} className="mt-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Phone number</span>
            <input
              className={field}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+231 77 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <span className="text-xs text-muted">
              Liberian numbers — a leading 0 is replaced with +231 automatically.
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
              className={`${field} tracking-[0.4em]`}
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
          <button type="submit" className={submit} disabled={pending}>
            {pending ? "Verifying…" : "Verify & continue"}
          </button>
          <button
            type="button"
            className="text-sm text-muted hover:text-foreground"
            onClick={() => {
              setStep("phone");
              setCode("");
              setError(null);
            }}
          >
            ← Use a different number
          </button>
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

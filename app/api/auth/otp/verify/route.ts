import { NextResponse } from "next/server";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { toE164 } from "@/lib/utils/phone";
import { verifyCode, mintCustomToken } from "@/lib/auth/custom-otp";

const MSG: Record<string, string> = {
  no_code: "No code found — please request a new one.",
  expired: "That code expired. Please request a new one.",
  too_many: "Too many wrong codes. Please request a new one.",
  wrong_code: "That code is incorrect.",
};

// Verify a fallback OTP and return a Firebase custom token for client sign-in.
export async function POST(request: Request) {
  if (!isAdminConfigured()) return NextResponse.json({ error: "Service unavailable." }, { status: 503 });

  const { phone: raw, code } = await request.json().catch(() => ({}));
  const phone = toE164(String(raw ?? ""));
  if (!/^\+\d{8,15}$/.test(phone) || !/^\d{6}$/.test(String(code ?? ""))) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const v = await verifyCode(phone, String(code));
  if (!v.ok) return NextResponse.json({ error: MSG[v.error ?? ""] ?? "Verification failed.", reason: v.error }, { status: 400 });

  const token = await mintCustomToken(phone);
  return NextResponse.json({ ok: true, token });
}

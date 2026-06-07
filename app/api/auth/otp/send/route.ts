import { NextResponse } from "next/server";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { checkRateLimit, rateLimitMessage } from "@/lib/firestore/ratelimit";
import { toE164 } from "@/lib/utils/phone";
import { generateCode, storeCode } from "@/lib/auth/custom-otp";
import { channelConfigured, sendOtpVia, type OtpChannel } from "@/lib/auth/otp-providers";
import { logAuthEvent } from "@/lib/firestore/auth-log";

// Fallback OTP send (WhatsApp / SMS). Only used when Firebase Phone Auth fails.
export async function POST(request: Request) {
  if (!isAdminConfigured()) return NextResponse.json({ error: "Service unavailable." }, { status: 503 });

  const { phone: raw, channel, country } = await request.json().catch(() => ({}));
  const ch: OtpChannel = channel === "sms" ? "sms" : "whatsapp";
  const phone = toE164(String(raw ?? ""));
  if (!/^\+\d{8,15}$/.test(phone)) {
    return NextResponse.json({ error: "That phone number doesn't look valid.", reason: "invalid-number" }, { status: 400 });
  }

  const limit = await checkRateLimit(`otp_${phone}`, "verification");
  if (!limit.ok) {
    return NextResponse.json({ error: rateLimitMessage("verification", limit.retryAfterSec), reason: "too-many" }, { status: 429 });
  }

  if (!channelConfigured(ch)) {
    await logAuthEvent({ phone, country: String(country ?? ""), code: `fallback_${ch}_not_configured`, provider: ch });
    return NextResponse.json(
      { error: `${ch === "whatsapp" ? "WhatsApp" : "SMS"} verification isn't enabled yet. Please use the other method.`, reason: "provider", configured: false },
      { status: 503 },
    );
  }

  const code = generateCode();
  await storeCode(phone, code);
  const res = await sendOtpVia(ch, phone, code);
  if (!res.ok) {
    await logAuthEvent({ phone, country: String(country ?? ""), code: `provider_${res.error}`, provider: ch });
    return NextResponse.json({ error: "Couldn't send the code right now. Please try the other method.", reason: "provider" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, channel: ch });
}

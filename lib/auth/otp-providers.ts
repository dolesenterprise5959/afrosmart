import "server-only";

// Secondary OTP delivery for Liberia, used only as a FALLBACK when Firebase
// Phone Auth fails. Each provider activates when its env credentials are present
// and degrades gracefully ("not_configured") otherwise — so the code ships safe
// and turns on the moment credentials are added (no redeploy of logic needed).
//
// Required env to activate:
//   WhatsApp (Meta Cloud API): WHATSAPP_TOKEN, WHATSAPP_PHONE_ID
//   SMS (Africa's Talking):    AT_API_KEY, AT_USERNAME  (AT_SENDER optional)

export type OtpChannel = "whatsapp" | "sms";
export interface SendResult { ok: boolean; error?: string }

export function channelConfigured(channel: OtpChannel): boolean {
  return channel === "whatsapp"
    ? Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID)
    : Boolean(process.env.AT_API_KEY && process.env.AT_USERNAME);
}

const body = (code: string) => `Your AfroSmart verification code is ${code}. It expires in 5 minutes.`;

async function sendWhatsApp(phone: string, code: string): Promise<SendResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return { ok: false, error: "not_configured" };
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone.replace(/^\+/, ""),
        type: "text",
        text: { body: body(code) },
      }),
    });
    if (!res.ok) return { ok: false, error: `whatsapp_${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: "whatsapp_network" };
  }
}

async function sendSms(phone: string, code: string): Promise<SendResult> {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  if (!apiKey || !username) return { ok: false, error: "not_configured" };
  try {
    const params = new URLSearchParams({ username, to: phone, message: body(code) });
    if (process.env.AT_SENDER) params.set("from", process.env.AT_SENDER);
    const res = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: { apiKey, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: params.toString(),
    });
    if (!res.ok) return { ok: false, error: `sms_${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: "sms_network" };
  }
}

export function sendOtpVia(channel: OtpChannel, phone: string, code: string): Promise<SendResult> {
  return channel === "whatsapp" ? sendWhatsApp(phone, code) : sendSms(phone, code);
}

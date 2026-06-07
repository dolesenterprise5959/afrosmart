// Detects embedded "in-app" browsers (Facebook, Messenger, Instagram, TikTok,
// generic Android WebViews). These WebViews block the cross-origin storage that
// reCAPTCHA + Firebase Phone Auth need, so verification fails inside them — the
// reliable fix is to send the user to Chrome/Safari.

export interface InAppInfo { inApp: boolean; name: string; ios: boolean; android: boolean }

export function detectInApp(ua?: string): InAppInfo {
  const s = ua ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  const ios = /iPhone|iPad|iPod/i.test(s);
  const android = /Android/i.test(s);
  let name = "";
  if (/Messenger|MessengerForiOS|MessengerLite/i.test(s)) name = "Messenger";
  else if (/FBAN|FBAV|FB_IAB|FBIOS|FBDV/i.test(s)) name = "Facebook";
  else if (/Instagram/i.test(s)) name = "Instagram";
  else if (/\bLine\//i.test(s)) name = "Line";
  else if (/TikTok|musical_ly|BytedanceWebview/i.test(s)) name = "TikTok";
  else if (android && /; wv\)/i.test(s)) name = "in-app browser";
  return { inApp: name !== "", name, ios, android };
}

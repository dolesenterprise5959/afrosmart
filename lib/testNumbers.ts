// Firebase test phone numbers — fixed codes, no real SMS sent. Use these to
// verify the OTP flow before/independently of carrier SMS delivery. These are
// mirrored in the Firebase Auth config (signIn.phoneNumber.testPhoneNumbers)
// and surfaced in the admin console for testers.

export interface TestNumber {
  /** Stored E.164 form. */
  phone: string;
  /** Local form a tester types into the login field. */
  local: string;
  /** Fixed verification code. */
  code: string;
}

export const TEST_PHONE_NUMBERS: TestNumber[] = [
  { phone: "+231770000000", local: "77 000 0000", code: "123456" },
  { phone: "+231880000000", local: "88 000 0000", code: "234567" },
  { phone: "+231770000001", local: "77 000 0001", code: "345678" },
  { phone: "+231550000000", local: "55 000 0000", code: "456789" },
];

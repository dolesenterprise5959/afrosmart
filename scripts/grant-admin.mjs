// Grant (or revoke) the `admin` custom claim — required to access /admin and
// /admin/auth-events. Run with Google Application Default Credentials (a service
// account that has Firebase Authentication Admin rights).
//
//   # by UID:
//   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
//     node scripts/grant-admin.mjs <uid>
//
//   # by phone number (E.164):
//   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
//     node scripts/grant-admin.mjs +231770000000
//
//   # revoke:
//   ... node scripts/grant-admin.mjs <uid|+phone> --revoke
//
// After running, the user must sign out and back in for the claim to take effect.

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const target = process.argv[2];
const revoke = process.argv.includes("--revoke");
if (!target) {
  console.error("Usage: node scripts/grant-admin.mjs <uid|+E164phone> [--revoke]");
  process.exit(1);
}

initializeApp({
  credential: applicationDefault(),
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || "afrosmart",
});
const auth = getAuth();

const user = target.startsWith("+")
  ? await auth.getUserByPhoneNumber(target)
  : await auth.getUser(target);

const claims = { ...(user.customClaims || {}) };
if (revoke) delete claims.admin;
else claims.admin = true;

await auth.setCustomUserClaims(user.uid, claims);
await auth.revokeRefreshTokens(user.uid); // force a fresh token with the new claim

console.log(
  `${revoke ? "Revoked" : "Granted"} admin for uid=${user.uid} (${user.phoneNumber || user.email || "no contact"}).`,
);
console.log("→ The user must sign OUT and back IN for it to take effect.");
process.exit(0);

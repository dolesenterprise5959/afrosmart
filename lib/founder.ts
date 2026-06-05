// Founder identity — used to render the "Verified Founder" badge on the
// founder's profile and listings, and the homepage founder card.
// The UID defaults to the current founder account (+231770000000); override
// with FOUNDER_UID if the founder signs in with a different account later.

export const FOUNDER = {
  uid: process.env.FOUNDER_UID ?? "vvSkeOc2EdbxoOhCwSjZgjvJshs1",
  name: "Emmett Doles",
  title: "Founder & CEO, AfroSmart",
  initials: "ED",
  bio: "Founder & CEO of AfroSmart. Building Liberia's digital marketplace for vehicles, real estate, electronics, jobs, services, and local commerce. Connecting buyers and sellers across Africa through a trusted, secure, and modern marketplace platform.",
} as const;

/** True when the given user id is the AfroSmart founder. */
export function isFounder(uid: string | null | undefined): boolean {
  return !!uid && uid === FOUNDER.uid;
}

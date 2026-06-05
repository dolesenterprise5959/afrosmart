/**
 * Firestore Security Rules tests for AfroSmart.
 *
 * These run against the Firestore emulator and are NOT part of the default
 * `npm test`. To run them:
 *
 *   1. Install Java (the emulator requires a JVM).
 *   2. npm i -D @firebase/rules-unit-testing@^4 firebase-tools --legacy-peer-deps
 *   3. firebase emulators:exec --only firestore "npm run test:rules"
 *
 * They assert the security-critical invariants of firestore.rules:
 *   - a user's phone number is never readable by another user
 *   - threads/messages are participants-only and client-read-only
 *   - callUnlocked / ratings / reports cannot be written from the client
 *   - saved items are owner-only
 */
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

const ALICE = "alice";
const BOB = "bob";
const CAROL = "carol";

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "afrosmart-rules-test",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  // Seed docs with admin (rules-bypassing) context.
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "users", ALICE), { displayName: "Alice", phone: "+231770000001" });
    await setDoc(doc(db, "users", BOB), { displayName: "Bob", phone: "+231770000002" });
    await setDoc(doc(db, "listings", "l1"), { sellerId: ALICE, title: "Car", status: "active" });
    await setDoc(doc(db, "threads", "t1"), {
      participants: [ALICE, BOB],
      buyerId: BOB,
      sellerId: ALICE,
      callUnlocked: false,
    });
    await setDoc(doc(db, "threads", "t1", "messages", "m1"), { senderId: BOB, text: "hi" });
    await setDoc(doc(db, "ratings", "r1"), { raterId: BOB, rateeId: ALICE, stars: 5 });
    await setDoc(doc(db, "reports", "rep1"), { reporterId: BOB, status: "open" });
  });
});

const aliceDb = () => testEnv.authenticatedContext(ALICE).firestore();
const bobDb = () => testEnv.authenticatedContext(BOB).firestore();
const carolDb = () => testEnv.authenticatedContext(CAROL).firestore();
const anonDb = () => testEnv.unauthenticatedContext().firestore();

describe("users / phone privacy", () => {
  it("lets a user read their own profile", async () => {
    await assertSucceeds(getDoc(doc(aliceDb(), "users", ALICE)));
  });
  it("FORBIDS reading another user's doc (protects phone)", async () => {
    await assertFails(getDoc(doc(bobDb(), "users", ALICE)));
  });
  it("forbids anonymous profile reads", async () => {
    await assertFails(getDoc(doc(anonDb(), "users", ALICE)));
  });
  it("lets a user update only their own profile", async () => {
    await assertSucceeds(setDoc(doc(aliceDb(), "users", ALICE), { displayName: "A2" }, { merge: true }));
    await assertFails(setDoc(doc(bobDb(), "users", ALICE), { displayName: "hacked" }, { merge: true }));
  });
});

describe("listings", () => {
  it("are world-readable", async () => {
    await assertSucceeds(getDoc(doc(anonDb(), "listings", "l1")));
  });
  it("can only be created by the seller themselves", async () => {
    await assertSucceeds(setDoc(doc(aliceDb(), "listings", "l2"), { sellerId: ALICE, status: "active" }));
    await assertFails(setDoc(doc(bobDb(), "listings", "l3"), { sellerId: ALICE, status: "active" }));
  });
  it("can only be edited by the owner", async () => {
    await assertSucceeds(updateDoc(doc(aliceDb(), "listings", "l1"), { title: "Car!" }));
    await assertFails(updateDoc(doc(bobDb(), "listings", "l1"), { title: "nope" }));
  });
});

describe("threads & messages (participants-only, client-read-only)", () => {
  it("lets a participant read the thread", async () => {
    await assertSucceeds(getDoc(doc(bobDb(), "threads", "t1")));
  });
  it("FORBIDS a non-participant from reading the thread", async () => {
    await assertFails(getDoc(doc(carolDb(), "threads", "t1")));
  });
  it("FORBIDS clients from writing messages (server-only)", async () => {
    await assertFails(setDoc(doc(bobDb(), "threads", "t1", "messages", "m2"), { senderId: BOB, text: "x" }));
  });
  it("FORBIDS clients from flipping callUnlocked", async () => {
    await assertFails(updateDoc(doc(bobDb(), "threads", "t1"), { callUnlocked: true }));
  });
  it("FORBIDS a non-participant from reading messages", async () => {
    await assertFails(getDoc(doc(carolDb(), "threads", "t1", "messages", "m1")));
  });
});

describe("ratings (read public, write server-only)", () => {
  it("are world-readable", async () => {
    await assertSucceeds(getDoc(doc(anonDb(), "ratings", "r1")));
  });
  it("cannot be written by clients", async () => {
    await assertFails(setDoc(doc(bobDb(), "ratings", "r2"), { raterId: BOB, rateeId: ALICE, stars: 5 }));
  });
});

describe("reports (fully server-mediated)", () => {
  it("cannot be read by clients (even admins go through the server)", async () => {
    await assertFails(getDoc(doc(bobDb(), "reports", "rep1")));
  });
  it("cannot be created by clients", async () => {
    await assertFails(setDoc(doc(bobDb(), "reports", "rep2"), { reporterId: BOB, status: "open" }));
  });
});

describe("saved items (owner-only)", () => {
  it("lets a user write & read their own saved items", async () => {
    await assertSucceeds(setDoc(doc(bobDb(), "saved", BOB, "items", "l1"), { listingId: "l1" }));
    await assertSucceeds(getDoc(doc(bobDb(), "saved", BOB, "items", "l1")));
  });
  it("FORBIDS reading or writing another user's saved items", async () => {
    await assertFails(setDoc(doc(carolDb(), "saved", BOB, "items", "l1"), { listingId: "l1" }));
    await assertFails(getDoc(doc(carolDb(), "saved", BOB, "items", "x")));
  });
});

describe("counties reference data", () => {
  it("is world-readable but not client-writable", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "counties", "montserrado"), { name: "Montserrado" });
    });
    await assertSucceeds(getDoc(doc(anonDb(), "counties", "montserrado")));
    await assertFails(setDoc(doc(bobDb(), "counties", "x"), { name: "X" }));
  });
});

describe("rateLimits (server-only counters)", () => {
  it("cannot be read or written by clients", async () => {
    await assertFails(getDoc(doc(bobDb(), "rateLimits", `${BOB}__message`)));
    await assertFails(setDoc(doc(bobDb(), "rateLimits", `${BOB}__message`), { count: 0 }));
  });
});

// Keep a reference so unused-import lint never trips if a block is commented out.
void deleteDoc;

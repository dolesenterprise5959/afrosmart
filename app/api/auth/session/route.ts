import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth/constants";

// POST: exchange a freshly-minted Firebase ID token (from phone OTP sign-in)
// for an httpOnly session cookie. The cookie is what the server trusts going
// forward — see lib/auth/dal.ts.
export async function POST(request: Request) {
  let idToken: unknown;
  try {
    ({ idToken } = await request.json());
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof idToken !== "string" || !idToken) {
    return Response.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    const auth = adminAuth();
    // Verify the ID token is genuine before minting a long-lived session.
    await auth.verifyIdToken(idToken);
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    (await cookies()).set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to create session:", error);
    return Response.json({ error: "Could not create session" }, { status: 401 });
  }
}

// DELETE: log out by clearing the session cookie.
export async function DELETE() {
  (await cookies()).delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}

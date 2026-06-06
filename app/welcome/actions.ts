"use server";

import { verifySession } from "@/lib/auth/dal";
import { setUserName } from "@/lib/firestore/users";

export async function saveNameAction(input: {
  firstName: string;
  lastName: string;
}): Promise<{ ok?: true; error?: string }> {
  const session = await verifySession();
  const first = (input.firstName ?? "").trim();
  if (!first) return { error: "Please enter your first name." };
  if (first.length > 40) return { error: "That name is too long." };
  await setUserName(session.uid, first, input.lastName ?? "", session.phone);
  return { ok: true };
}

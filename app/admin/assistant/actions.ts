"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth/dal";
import { saveKnowledgeEntry, deleteKnowledgeEntry } from "@/lib/firestore/assistant";

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || `kb-${Date.now()}`;
}

export async function saveEntryAction(form: FormData): Promise<{ error?: string; ok?: boolean }> {
  await verifyAdmin();
  const id = String(form.get("id") || "").trim() || slug(String(form.get("title") || ""));
  const title = String(form.get("title") || "").trim();
  const answer = String(form.get("answer") || "").trim();
  const keywords = String(form.get("keywords") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const quickReplies = String(form.get("quickReplies") || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (title.length < 3 || answer.length < 5) return { error: "Title and answer are required." };
  await saveKnowledgeEntry({ id, title, keywords, answer, quickReplies });
  revalidatePath("/admin/assistant");
  return { ok: true };
}

export async function deleteEntryAction(id: string): Promise<void> {
  await verifyAdmin();
  await deleteKnowledgeEntry(id);
  revalidatePath("/admin/assistant");
}

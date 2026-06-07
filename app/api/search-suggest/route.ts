import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/firestore/listings";

// Lightweight listing index for search autocomplete. Fetched once by the client,
// then filtered locally for instant (<200ms) suggestions.
export const revalidate = 60;

export async function GET() {
  const items = await getSearchIndex();
  return NextResponse.json(items, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}

import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/firestore/listings";

// Lightweight listing index for search autocomplete. Fetched once by the client,
// then filtered locally for instant (<200ms) suggestions. Dynamic so it can't get
// stuck serving a stale ISR cache; freshness is bounded by the getSearchIndex data
// cache (30s) plus a short CDN window.
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getSearchIndex();
  return NextResponse.json(items, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" },
  });
}

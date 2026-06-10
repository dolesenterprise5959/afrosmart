"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

import { Share2, Check } from "lucide-react";
// Share a listing via the native share sheet (mobile) with a copy-link fallback.
export function ShareButton({
  title,
  path,
  className,
}: {
  title: string;
  path: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.origin + path : path;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${title} · AfroSmart`, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Button onClick={share} variant="outline" size="lg" className={className}>
      {copied ? <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4" /> Link copied</span> : <span className="inline-flex items-center gap-1.5"><Share2 className="h-4 w-4" /> Share</span>}
    </Button>
  );
}

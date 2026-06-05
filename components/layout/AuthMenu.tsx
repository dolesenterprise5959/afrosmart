"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { logout } from "@/lib/firebase/auth-client";
import { Button } from "@/components/ui/Button";

export function AuthMenu() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="h-9 w-16 animate-pulse rounded-full bg-surface" />;
  }

  if (!user) {
    return (
      <Button href="/login" variant="outline" size="sm">
        Login
      </Button>
    );
  }

  async function handleLogout() {
    await logout();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard"
        className="hidden text-sm font-medium text-foreground hover:text-brand sm:inline"
      >
        Account
      </Link>
      <Button onClick={handleLogout} variant="ghost" size="sm">
        Log out
      </Button>
    </div>
  );
}

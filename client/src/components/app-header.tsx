"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { user, status, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Link
          href={status === "authenticated" ? "/dashboard" : "/"}
          className="text-lg font-bold tracking-tight hover:opacity-80"
        >
          AI Travel Planner
        </Link>

        {status === "loading" ? null : user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.name ?? user.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

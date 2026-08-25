"use client";

import { useAuth } from "@/components/providers/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { user, status } = useAuth();

  if (status === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome{user?.name ? `, ${user.name}` : ""} 👋
          </CardTitle>
          <CardDescription>
            You are signed in as {user?.email}. Trip planning arrives in the next
            phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder dashboard — trips CRUD lands in Phase 2.
        </CardContent>
      </Card>
    </main>
  );
}

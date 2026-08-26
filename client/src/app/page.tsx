"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      {status === "authenticated" ? (
        <Loader2 className="size-6 animate-spin text-primary" />
      ) : (
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight">
              AI Travel Planner
            </CardTitle>
            <CardDescription className="text-base">
              Tell us where you want to go — get a complete day-by-day
              itinerary with budget estimates and hotel picks, powered by AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Get started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

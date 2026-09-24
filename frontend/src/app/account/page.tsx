"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { SavedEstimatesList } from "@/components/account/saved-estimates-list";

export default function AccountPage() {
  const router = useRouter();
  const { user, status, logout } = useAuth();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">My Estimates</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user?.full_name.split(" ")[0]}.
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>

      <SavedEstimatesList />
    </section>
  );
}

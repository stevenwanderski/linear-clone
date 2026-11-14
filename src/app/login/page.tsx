"use client";

import { Suspense, use } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type SearchParams = Promise<{ error?: string }>;

// Better Auth sends failed sign-ins back here with ?error=...
function ErrorMessage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = use(searchParams);
  return error ? <p className="text-sm text-destructive">This account isn&apos;t allowed to sign in.</p> : null;
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-sidebar p-6">
      <Logo className="size-12" />
      <div className="text-center">
        <h1 className="text-xl font-semibold">Welcome to Happy Linear</h1>
        <p className="mt-1 text-sm text-muted-foreground">Projects and issues, without the noise.</p>
      </div>
      <Button
        size="lg"
        className="w-64"
        onClick={() =>
          authClient.signIn.social({ provider: "github", callbackURL: "/", errorCallbackURL: "/login" })
        }
      >
        Continue with GitHub
      </Button>
      <Suspense>
        <ErrorMessage searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

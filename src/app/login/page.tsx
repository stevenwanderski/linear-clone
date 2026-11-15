"use client";

import { Suspense, use } from "react";
import { Logo } from "@/components/logo";
import { GitHubSignInButton } from "@/components/github-sign-in-button";
import { appName } from "@/lib/brand";

type SearchParams = Promise<{ error?: string }>;

// Better Auth sends failed sign-ins back here with ?error=...
function ErrorMessage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = use(searchParams);
  return error ? <p className="text-sm text-destructive">Sign-in didn&apos;t work. Try again.</p> : null;
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-sidebar p-6">
      <Logo className="size-12" />
      <div className="text-center">
        <h1 className="text-xl font-semibold">Welcome to {appName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Projects and issues, without the noise.</p>
      </div>
      <GitHubSignInButton className="w-64" />
      <Suspense>
        <ErrorMessage searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

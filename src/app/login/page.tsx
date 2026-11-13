"use client";

import { Suspense, use } from "react";
import { authClient } from "@/lib/auth-client";

type SearchParams = Promise<{ error?: string }>;

// Better Auth sends failed sign-ins back here with ?error=...
function ErrorMessage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = use(searchParams);
  return error ? <p className="text-red-600">This account isn&apos;t allowed to sign in.</p> : null;
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Suspense>
        <ErrorMessage searchParams={searchParams} />
      </Suspense>
      <button
        className="rounded-md bg-black px-4 py-2 text-white"
        onClick={() =>
          authClient.signIn.social({ provider: "github", callbackURL: "/", errorCallbackURL: "/login" })
        }
      >
        Sign in with GitHub
      </button>
    </main>
  );
}

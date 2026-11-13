"use client";

import { use } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  // Better Auth sends failed sign-ins back here with ?error=...
  const { error } = use(searchParams);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      {error && <p className="text-red-600">This account isn&apos;t allowed to sign in.</p>}
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

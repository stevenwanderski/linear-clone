"use client";

import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <button
        className="rounded-md bg-black px-4 py-2 text-white"
        onClick={() => authClient.signIn.social({ provider: "github", callbackURL: "/" })}
      >
        Sign in with GitHub
      </button>
    </main>
  );
}

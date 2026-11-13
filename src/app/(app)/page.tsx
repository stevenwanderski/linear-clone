import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

// Temporary home page. Replaced by "My issues" in card 15.
async function CurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return <Link className="underline" href="/login">Sign in</Link>;
  return (
    <p>
      Signed in as {session.user.name} ({session.user.email}) · <SignOutButton />
    </p>
  );
}

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Happy Linear</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <CurrentUser />
      </Suspense>
    </main>
  );
}

import { cache } from "react";
import { betterAuth } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const isAllowed = (email: string) => allowedEmails.includes(email.toLowerCase());

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    // Returning false cancels the write, so the sign-in fails.
    user: {
      create: { before: async (user) => isAllowed(user.email) },
    },
    // Also checked on every new session, so removing an email from the list locks out an existing user.
    session: {
      create: {
        before: async (session, ctx) => {
          const user = await ctx?.context.internalAdapter.findUserById(session.userId);
          return !!user && isAllowed(user.email);
        },
      },
    },
  },
});

// For pages and server actions: the signed-in user, or a redirect to /login.
// The proxy only checks that a cookie exists; this checks it's a real session.
// cache() runs it once per request, so the sidebar and the page share one session lookup.
export const requireUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
});

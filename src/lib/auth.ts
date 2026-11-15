import { cache } from "react";
import { apiKey } from "@better-auth/api-key";
import { betterAuth } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [
    apiKey({
      defaultPrefix: "ll_", // makes Linear Lite keys easy to spot
      // The default (10 requests a day) would block the MCP server, which checks the key on every call.
      rateLimit: { enabled: false },
      // A leaked key stops working on its own. In seconds.
      keyExpiration: { defaultExpiresIn: 60 * 60 * 24 * 90 },
    }),
  ],
});

// For pages and server actions: the signed-in user, or a redirect to /login.
// The proxy only checks that a cookie exists; this checks it's a real session.
// cache() runs it once per request, so the sidebar and the page share one session lookup.
export const requireUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
});

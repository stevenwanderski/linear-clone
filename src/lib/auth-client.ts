import { createAuthClient } from "better-auth/react";

// Browser-side helpers (signIn, signOut) that call /api/auth on the current site.
export const authClient = createAuthClient();

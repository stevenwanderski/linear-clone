import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Handles every /api/auth/* request: sign-in redirect, GitHub callback, session, sign-out.
export const { GET, POST } = toNextJsHandler(auth);

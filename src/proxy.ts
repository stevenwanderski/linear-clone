import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Only checks that a session cookie exists (no DB). Pages still verify the session itself.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    // Visitors at "/" see the landing page at the same URL; signed-in users get the app there.
    if (request.nextUrl.pathname === "/") return NextResponse.rewrite(new URL("/welcome", request.url));
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  // Everything except the login and landing pages, auth API, MCP server (it checks API keys itself), and static files and images.
  matcher: ["/((?!login|welcome|api/auth|api/mcp|_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|svg|webp)$).*)"],
};

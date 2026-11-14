import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Only checks that a session cookie exists (no DB). Pages still verify the session itself.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  // Everything except the login page, auth API, MCP server (it checks API keys itself), and static files.
  matcher: ["/((?!login|api/auth|api/mcp|_next/static|_next/image|favicon.ico).*)"],
};

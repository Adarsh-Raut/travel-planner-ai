import { NextResponse } from "next/server";

// Cross-origin auth: the JWT cookie lives on the backend domain (Render),
// so the middleware can't see it. Auth is handled client-side by AuthProvider
// which calls GET /api/auth/me with credentials: "include".
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/trips/:path*"],
};

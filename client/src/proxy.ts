import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic presence check only: the API remains the source of truth for
// authorization. This just avoids flashing protected pages for logged-out users.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("token");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

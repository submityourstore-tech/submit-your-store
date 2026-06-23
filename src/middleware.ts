import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Permanent redirects for legacy URLs that were indexed but no longer match routes. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/home-services/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/home-services\//, "/hvac/");
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/home-services" || pathname === "/home-services/") {
    const url = request.nextUrl.clone();
    url.pathname = "/hvac/texas";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/hvac" || pathname === "/hvac/") {
    const url = request.nextUrl.clone();
    url.pathname = "/hvac/texas";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home-services/:path*", "/home-services", "/hvac", "/hvac/"],
};

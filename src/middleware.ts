import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token");
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isRootPath = request.nextUrl.pathname === "/";
  const isPublicPath = isLoginPage || isRootPath;

  // If user is on login page and has auth token, redirect to view-vendors
  if (isLoginPage && authToken) {
    return NextResponse.redirect(new URL("/view-vendors", request.url));
  }

  // If user is on a protected route and has no auth token, redirect to login
  if (!isPublicPath && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

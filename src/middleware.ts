import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token");
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isProtectedRoute = !isLoginPage && request.nextUrl.pathname !== "/";

  // If user is on login page and has auth token, redirect to view-vendors
  if (isLoginPage && authToken) {
    return NextResponse.redirect(new URL("/view-vendors", request.url));
  }

  // If user is on a protected route and has no auth token, redirect to login
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/issue-goods",
    "/view-bills",
    "/view-goods",
    "/view-issued-goods",
    "/view-vendors",
    "/login",
  ],
};

// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Create a response object that we'll modify and return
  const res = NextResponse.next();

  // Create a Supabase client specifically for this middleware
  const supabase = createMiddlewareClient({ req, res });

  try {
    // This will refresh the session if needed and set the auth cookie
    const { data } = await supabase.auth.getSession();

    // Add debug headers to help troubleshoot (these won't be visible to users)
    res.headers.set("x-middleware-cache", "no-cache");
    res.headers.set(
      "x-middleware-auth-status",
      data.session ? "authenticated" : "unauthenticated"
    );

    // Check if the request is for a protected route
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");

    // Auth-related routes that should redirect to dashboard if already logged in
    const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

    const isAuthRoute = authRoutes.some((route) =>
      req.nextUrl.pathname.startsWith(route)
    );

    // Special case for callback and reset-password routes
    const isSpecialAuthRoute =
      req.nextUrl.pathname.startsWith("/auth/callback") ||
      req.nextUrl.pathname.startsWith("/auth/reset-password");

    // If accessing a protected route without a session, redirect to login
    if (isProtectedRoute && !data.session) {
      console.log(
        "Middleware: Unauthenticated access to protected route, redirecting to login"
      );
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // If accessing regular auth routes with a session, redirect to dashboard
    if (isAuthRoute && !isSpecialAuthRoute && data.session) {
      console.log(
        "Middleware: Authenticated access to auth route, redirecting to dashboard"
      );
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } catch (error) {
    // If there's an error, log it but don't block the request
    console.error("Middleware auth error:", error);
  }

  return res;
}

export const config = {
  matcher: [
    // Match all paths except static files, images, favicon, and API routes
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};

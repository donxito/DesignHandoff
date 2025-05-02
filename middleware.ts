import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define auth pages and protected pages
  const authPages = ['/login', '/register', '/reset-password'];
  const protectedPages = ['/dashboard', '/dashboard/projects', '/dashboard/settings'];
  
  // Get the pathname from the request
  const path = req.nextUrl.pathname;
  
  // Check if the current path is an auth page or starts with a protected page path
  const isAuthPage = authPages.includes(path);
  const isProtectedPage = protectedPages.some(page => 
    path === page || path.startsWith(`${page}/`)
  );

  // If user is signed in and the current path is an auth page, redirect to dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If user is not signed in and the current path is a protected page, redirect to login
  if (!session && isProtectedPage) {
    // Store the original URL to redirect back after login
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/login', 
    '/register', 
    '/reset-password',
    '/auth/callback'
  ],
};
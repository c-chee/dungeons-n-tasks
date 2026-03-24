import { NextResponse } from 'next/server';


export function middleware(request) { // Run middleware before requests are processed

  const token = request.cookies.get('token')?.value; //  Read JWT token from cookies

  
  const { pathname } = request.nextUrl; // Get the requested path

  // -- Protect /account routes --
  if (!token && pathname.startsWith('/account')) {
    // If there is no token and the user is trying to access /account, redirect them to the login page    
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // -- Prevent logged-in users from visiting auth pages --
  // If the user already has a token and tries to go to /login or /register, redirect them to /account
  if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  // -- Allow request to continue --
  return NextResponse.next();
}

// Specifies which routes this middleware applies to
export const config = {
  matcher: ['/account/:path*', '/login', '/register'],
};
// /middleware.js (for route protection)

import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(req) {
  // Get token from cookies
  const token = req.cookies.get('token')?.value;
  
  // Check protected routes
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isFilesRoute = req.nextUrl.pathname.startsWith('/files') || 
                       (isApiRoute && req.nextUrl.pathname.startsWith('/api/files'));
  const isUsersRoute = isApiRoute && req.nextUrl.pathname.startsWith('/api/users');
  
  // Public routes - login, register, home
  const isPublicRoute = req.nextUrl.pathname === '/' || 
                       req.nextUrl.pathname === '/login' || 
                       req.nextUrl.pathname === '/register' ||
                       (isAuthRoute && !req.nextUrl.pathname.includes('/logout'));
  
  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check if token exists and is valid for protected routes
  if ((isDashboardRoute || isFilesRoute || isUsersRoute || 
      (isApiRoute && !isAuthRoute)) && (!token || !verifyToken(token))) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Token exists but user is trying to access login/register page
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register') && 
      token && verifyToken(token)) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
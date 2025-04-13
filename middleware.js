// /middleware.js - Updated version

import { NextResponse } from 'next/server';

// Do NOT import verifyToken - it uses Node.js features incompatible with Edge runtime
// import { verifyToken } from './lib/auth'; 

export function middleware(req) {
  // Get token from cookies or Authorization header
  const token = req.cookies.get('token')?.value || 
                req.headers.get('Authorization')?.replace('Bearer ', '');
  
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
  
  // Check if token exists (but don't verify it here - that will happen server-side)
  // This prevents Edge runtime from using Node.js features
  if ((isDashboardRoute || isFilesRoute || isUsersRoute || 
      (isApiRoute && !isAuthRoute)) && !token) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
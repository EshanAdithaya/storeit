// Updated RouteGuard.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const publicPaths = ['/login', '/register', '/'];

const RouteGuard = ({ children }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the path requires authentication
    const requiresAuth = !publicPaths.includes(router.pathname);
    
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (requiresAuth && !token) {
          // Redirect to login if trying to access a protected page without a token
          router.push('/login');
          return;
        }
        
        if (token) {
          // Only verify token if we need to (on protected routes or at login)
          if (requiresAuth || router.pathname === '/login' || router.pathname === '/register') {
            const response = await fetch('/api/auth/verify', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ token })
            });
            
            if (!response.ok && requiresAuth) {
              // If token is invalid and we're on a protected route, redirect to login
              localStorage.removeItem('auth_token');
              router.push('/login');
              return;
            }
            
            if (response.ok && (router.pathname === '/login' || router.pathname === '/register')) {
              // If token is valid and we're on a login/register page, redirect to dashboard
              router.push('/dashboard');
              return;
            }
          }
        }
        
        // Set authorized to true for rendering content
        setAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        if (requiresAuth) {
          router.push('/login');
        } else {
          setAuthorized(true);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router.pathname]);

  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : authorized ? (
    children
  ) : null;
};

export default RouteGuard;
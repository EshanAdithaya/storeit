// /components/RouteGuard.js - Updated version

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const publicPaths = ['/login', '/register', '/'];

const RouteGuard = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, loading, authChecked } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Don't do anything until auth check is complete
    if (!authChecked) return;
    
    // Check if the path requires authentication
    const requiresAuth = !publicPaths.includes(router.pathname);
    
    if (requiresAuth && !isAuthenticated) {
      // Redirect to login if trying to access a protected page without auth
      router.push('/dashboard');
    } else if (!requiresAuth && isAuthenticated && 
              (router.pathname === '/login' || router.pathname === '/register')) {
      // Redirect to dashboard if authenticated user tries to access login/register
      router.push('/dashboard');
    } else {
      setAuthorized(true);
    }
  }, [isAuthenticated, authChecked, router.pathname, router]);

  // Show loading state or the protected content
  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : authorized ? (
    children
  ) : null;
};

export default RouteGuard;
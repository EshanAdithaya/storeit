// /components/RouteGuard.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const publicPaths = ['/login', '/register', '/'];

const RouteGuard = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if the path requires authentication
    const requiresAuth = !publicPaths.includes(router.pathname);
    
    const authCheck = () => {
      if (requiresAuth && !isAuthenticated) {
        // Redirect to login if trying to access a protected page without auth
        router.push('/login');
      } else {
        // Check if we're on a login/register page with valid auth
        if (!requiresAuth && isAuthenticated && (router.pathname === '/login' || router.pathname === '/register')) {
          router.push('/dashboard');
        } else {
          setAuthorized(true);
        }
      }
    };

    // Execute auth check only after loading is complete
    if (!loading) {
      authCheck();
    }
  }, [isAuthenticated, loading, router.pathname, router]);

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
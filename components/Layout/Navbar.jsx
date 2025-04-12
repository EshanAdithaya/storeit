// /components/Layout/Navbar.jsx

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      // Just remove the token from localStorage
      localStorage.removeItem('auth_token');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              FileServer
            </Link>
            
            {!isLoading && user && (
              <div className="hidden md:flex space-x-4">
                <Link href="/dashboard" className="hover:text-gray-300">
                  Dashboard
                </Link>
                <Link href="/files" className="hover:text-gray-300">
                  My Files
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="hidden md:inline">Hello, {user.username}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                      Login
                    </Link>
                    <Link href="/register" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
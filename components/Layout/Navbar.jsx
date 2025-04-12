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
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
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
            <Link href="/">
              <a className="text-xl font-bold">FileServer</a>
            </Link>
            
            {!isLoading && user && (
              <div className="hidden md:flex space-x-4">
                <Link href="/dashboard">
                  <a className="hover:text-gray-300">Dashboard</a>
                </Link>
                <Link href="/files">
                  <a className="hover:text-gray-300">My Files</a>
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
                    <Link href="/login">
                      <a className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                        Login
                      </a>
                    </Link>
                    <Link href="/register">
                      <a className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
                        Register
                      </a>
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
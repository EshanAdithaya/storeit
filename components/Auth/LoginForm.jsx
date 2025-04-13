// /components/Auth/LoginForm.jsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const LoginForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Check for existing token on component mount
  useEffect(() => {
    console.log('LoginForm component mounted, checking for existing token');
    let isMounted = true; // Track if component is mounted for async operations
    
    const checkExistingToken = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        console.log(`Token in localStorage: ${token ? 'Present' : 'Not found'}`);
        
        if (token) {
          console.log('Existing token found, verifying...');
          // Don't set initialLoading again since it's already true
          
          try {
            console.log('Making API request to: /api/auth/verify');
            const response = await fetch('/api/auth/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ token })
            });
            
            console.log(`API response received with status: ${response.status}`);
            
            // Only proceed if component is still mounted
            if (!isMounted) return;
            
            if (response.ok) {
              console.log('Token is valid, redirecting to dashboard');
              router.push('/dashboard');
              return; // Exit early to prevent setting initialLoading = false
            } else {
              console.log('Token is invalid, removing from localStorage');
              localStorage.removeItem('auth_token');
            }
          } catch (error) {
            // Only proceed if component is still mounted
            if (!isMounted) return;
            
            console.error('Error verifying token:', error);
            console.log('Removing invalid token from localStorage');
            localStorage.removeItem('auth_token');
          }
        }
        
        // Only proceed if component is still mounted
        if (isMounted) {
          console.log('Initial token check completed');
          setInitialLoading(false);
        }
      } catch (error) {
        // Only proceed if component is still mounted
        if (isMounted) {
          console.error('Unexpected error during token check:', error);
          setInitialLoading(false);
        }
      }
    };
    
    checkExistingToken();
    
    // Log router events
    const handleRouteChangeStart = (url) => {
      console.log(`Navigation starting to: ${url}`);
    };
    
    const handleRouteChangeComplete = (url) => {
      console.log(`Navigation completed to: ${url}`);
    };
    
    const handleRouteChangeError = (err, url) => {
      console.error(`Navigation to ${url} failed:`, err);
    };
    
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);
    
    return () => {
      isMounted = false; // Prevent state updates after unmount
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
      console.log('LoginForm component unmounted');
    };
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field "${name}" changed to: ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted with data:', formData);
    setError('');
    setLoading(true);
    console.log('Loading state set to true');

    try {
      console.log('Sending login request to API...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log(`API response received with status: ${response.status}`);
      const data = await response.json();
      console.log('API response data parsed');

      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        console.error('Error response:', data);
        throw new Error(data.message || 'Login failed');
      }

      // Save token to localStorage
      console.log('Saving authentication token to localStorage');
      localStorage.setItem('auth_token', data.token);
      console.log('Token saved to localStorage');

      console.log('Login successful, redirecting to dashboard...');
      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error.message);
      setError(error.message);
    } finally {
      console.log('Loading state set to false');
      setLoading(false);
    }
  };

  console.log(`Rendering LoginForm component with states - loading: ${loading}, initialLoading: ${initialLoading}, error: ${error ? error : 'none'}`);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {initialLoading ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              onFocus={() => console.log('Username field focused')}
              onBlur={() => console.log('Username field blurred')}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              onFocus={() => console.log('Password field focused')}
              onBlur={() => console.log('Password field blurred')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              type="submit"
              disabled={loading}
              onClick={() => console.log('Login button clicked')}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
            
              < a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="/register"
              onClick={() => console.log('Register link clicked, navigating to /register')}
              >
              Register
            </a>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
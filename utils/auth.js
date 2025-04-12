// /utils/auth.js

// Function to get token from localStorage
export const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };
  
  // Function to set token in localStorage
  export const setAuthToken = (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  };
  
  // Function to remove token from localStorage
  export const removeAuthToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  };
  
  // Function to verify if user is authenticated
  export const isAuthenticated = async () => {
    const token = getAuthToken();
    
    if (!token) {
      return false;
    }
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      if (response.ok) {
        const data = await response.json();
        return { authenticated: true, user: data.user };
      }
      
      return false;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  };
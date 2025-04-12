// /utils/api.js

// Helper function to get the authentication token
export const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };
  
  // Helper function to make authenticated API requests
  export const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Handle authentication errors
    if (response.status === 401) {
      // Clear the invalid token
      localStorage.removeItem('auth_token');
      
      // If in browser, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      throw new Error('Authentication failed. Please log in again.');
    }
    
    return response;
  };
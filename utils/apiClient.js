// /utils/apiClient.js

import { getAuthToken } from './auth';

// Function to make authenticated API requests
export const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();

  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized errors
  if (response.status === 401) {
    // Clear token if it's invalid
    localStorage.removeItem('auth_token');
    // Redirect to login if we're in a browser context
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return response;
};
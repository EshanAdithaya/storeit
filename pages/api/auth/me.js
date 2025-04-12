// /pages/api/auth/me.js

import { verifyToken, getUserById } from '../../../lib/auth';

export default async function handler(req, res) {
  console.log('Current user (me) API request received');
  console.log(`Request method: ${req.method}`);
  
  if (req.method !== 'GET') {
    console.log(`Rejecting request with wrong method: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Processing request to get current user info');
  
  // Get token from cookies
  const token = req.cookies.token;
  console.log(`Token from cookies: ${token ? 'Present' : 'Not present'}`);
  
  if (!token) {
    console.log('No authentication token found in cookies');
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }
  
  // Verify token
  console.log('Verifying token...');
  const decoded = verifyToken(token);
  
  if (!decoded) {
    console.error('Token verification failed');
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
  
  console.log(`Token verified successfully for user ID: ${decoded.id}`);
  
  try {
    // Get user from database (to make sure it still exists)
    console.log(`Fetching user data from database for ID: ${decoded.id}`);
    const user = await getUserById(decoded.id);
    
    if (!user) {
      console.error(`User not found in database for ID: ${decoded.id}`);
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log(`User found: ID=${user.id}, username=${user.username}`);
    
    // Return user info
    console.log('Returning user information');
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

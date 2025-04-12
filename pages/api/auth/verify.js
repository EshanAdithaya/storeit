// /pages/api/auth/verify.js

import { verifyToken, getUserById } from '../../../lib/auth';

export default async function handler(req, res) {
  console.log('Token verification API request received');
  console.log(`Request method: ${req.method}`);
  
  if (req.method !== 'POST') {
    console.log(`Rejecting request with wrong method: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.body;
  
  if (!token) {
    console.log('No token provided for verification');
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    console.log('Verifying provided token');
    const decoded = await verifyToken(token);
    
    if (!decoded || !decoded.id) {
      console.error('Token verification failed: Invalid token');
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Verify the user still exists
    const user = await getUserById(decoded.id);
    
    if (!user) {
      console.error(`User not found in database for ID: ${decoded.id}`);
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log(`Token verified successfully for user: ${user.username}`);
    return res.status(200).json({ 
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
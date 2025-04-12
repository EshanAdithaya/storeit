// /pages/api/auth/me.js

import { verifyToken, getUserById } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get token from cookies
  const token = req.cookies.token;
  
  // Verify token
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    // Get user from database (to make sure it still exists)
    const user = await getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Return user info
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

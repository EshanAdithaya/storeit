// /pages/api/users/index.js

import { verifyToken } from '../../../lib/auth';
import db from '../../../lib/db';

export default async function handler(req, res) {
  // Verify user is authenticated
  const token = req.cookies.token;
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // GET - Search users (for file sharing)
  if (req.method === 'GET') {
    try {
      const { search } = req.query;
      
      if (!search || search.length < 2) {
        return res.status(400).json({ message: 'Search query must be at least 2 characters' });
      }
      
      // Search for users except the current user
      const [users] = await db.query(
        `SELECT id, username, email FROM users 
         WHERE id != ? AND (username LIKE ? OR email LIKE ?) 
         LIMIT 10`,
        [user.id, `%${search}%`, `%${search}%`]
      );
      
      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error searching users:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Other methods not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}

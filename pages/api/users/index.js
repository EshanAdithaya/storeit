// /pages/api/users/index.js

import { verifyToken } from '../../../lib/auth';
import db from '../../../lib/db';

export default async function handler(req, res) {
  console.log('Users API request received');
  console.log(`Request method: ${req.method}`);
  
  // Verify user is authenticated
  const token = req.cookies.token;
  console.log(`Auth token from cookies: ${token ? 'Present' : 'Not present'}`);
  
  const user = verifyToken(token);
  
  if (!user) {
    console.error('Authentication failed: Invalid or missing token');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  console.log(`User authenticated: ID=${user.id}, username=${user.username}`);
  
  // GET - Search users (for file sharing)
  if (req.method === 'GET') {
    console.log('Processing GET request to search users');
    try {
      const { search } = req.query;
      console.log(`Search query: "${search}"`);
      
      if (!search || search.length < 2) {
        console.log(`Search validation failed: Query too short (${search ? search.length : 0} characters)`);
        return res.status(400).json({ message: 'Search query must be at least 2 characters' });
      }
      
      // Search for users except the current user
      console.log(`Executing user search query for term: "${search}"`);
      console.log(`Excluding current user ID: ${user.id}`);
      
      const searchQuery = `SELECT id, username, email FROM users 
         WHERE id != ? AND (username LIKE ? OR email LIKE ?) 
         LIMIT 10`;
      const searchParams = [user.id, `%${search}%`, `%${search}%`];
      
      console.log(`Query: ${searchQuery}`);
      console.log(`Query parameters: [${user.id}, %${search}%, %${search}%]`);
      
      const [users] = await db.query(searchQuery, searchParams);
      
      console.log(`Search results found: ${users.length} users`);
      
      // Log found users (without exposing too much detail in logs)
      if (users.length > 0) {
        console.log('Users found:');
        users.forEach((foundUser, index) => {
          console.log(`  ${index + 1}. ID=${foundUser.id}, username=${foundUser.username}`);
        });
      } else {
        console.log(`No users found matching search term: "${search}"`);
      }
      
      console.log('User search completed successfully, returning results');
      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error searching users:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Other methods not allowed
  console.log(`Method ${req.method} not allowed for users API`);
  return res.status(405).json({ message: 'Method not allowed' });
}

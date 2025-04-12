// /pages/api/auth/login.js

import { verifyPassword, generateToken } from '../../../lib/auth';
import db from '../../../lib/db';

export default async function handler(req, res) {
  console.log('Login API request received');
  console.log(`Request method: ${req.method}`);
  
  if (req.method !== 'POST') {
    console.log(`Rejecting request with wrong method: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Processing login request');
  const { username, password } = req.body;
  console.log(`Login attempt for username: ${username}`);

  // Validate input
  if (!username || !password) {
    console.error('Login validation failed: Missing username or password');
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Find user by username
    console.log(`Querying database for user with username: ${username}`);
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      console.error(`Authentication failed: No user found with username ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`User found: ID=${users[0].id}, username=${users[0].username}`);
    const user = users[0];

    // Verify password
    console.log('Verifying password...');
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      console.error(`Authentication failed: Invalid password for user ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`Password verification successful for user: ${username}`);

    // Generate JWT token
    console.log(`Generating JWT token for user ID: ${user.id}`);
    const token = generateToken(user);
    console.log('JWT token generated successfully');

    // Set HTTP-only cookie with token
    console.log('Setting HTTP-only cookie with token');
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 24}`);
    console.log('Cookie set successfully');

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;
    console.log('Preparing response with user data (without password)');
    
    console.log(`Login successful for user: ${username}`);
    return res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login process failed with error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
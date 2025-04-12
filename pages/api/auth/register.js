// /pages/api/auth/register.js

import { hashPassword } from '../../../lib/auth';
import db from '../../../lib/db';

export default async function handler(req, res) {
  console.log('Registration API request received');
  console.log(`Request method: ${req.method}`);
  
  if (req.method !== 'POST') {
    console.log(`Rejecting registration request with wrong method: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Processing registration request');
  const { username, email, password } = req.body;
  console.log(`Registration attempt for username: ${username}, email: ${email}`);

  // Validate input
  if (!username || !email || !password) {
    console.error('Registration validation failed: Missing required fields');
    console.log(`Missing fields: ${!username ? 'username' : ''} ${!email ? 'email' : ''} ${!password ? 'password' : ''}`);
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    console.log(`Checking if username "${username}" or email "${email}" already exists in database`);
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      console.log('User already exists check failed');
      if (existingUsers[0].username === username) {
        console.log(`Username "${username}" already exists`);
      }
      if (existingUsers[0].email === email) {
        console.log(`Email "${email}" already exists`);
      }
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    console.log('User does not exist in database, proceeding with registration');

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');

    // Insert user into database
    console.log(`Inserting new user into database: username=${username}, email=${email}`);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    console.log(`User successfully inserted into database with ID: ${result.insertId}`);

    // Return success response without password
    console.log('Registration completed successfully');
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        username,
        email,
      },
    });
  } catch (error) {
    console.error('Registration process failed with error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
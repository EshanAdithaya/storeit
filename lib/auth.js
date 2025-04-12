// /lib/auth.js

import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import db from './db';

export async function hashPassword(password) {
  console.log('Hashing password...');
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    return hashedPassword;
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw error;
  }
}

export async function verifyPassword(password, hashedPassword) {
  console.log('Verifying password...');
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log(`Password verification ${isValid ? 'successful' : 'failed'}`);
    return isValid;
  } catch (error) {
    console.error('Password verification error:', error);
    throw error;
  }
}

export async function generateToken(user) {
  console.log(`Generating JWT token for user: ${user.username} (ID: ${user.id})`);
  
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email
  };

  try {
    // Create a secret key from your JWT_SECRET
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secure-jwt-secret-key'
    );

    // Create the token with jose
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);

    console.log('JWT token generated successfully');
    return token;
  } catch (error) {
    console.error('JWT token generation failed:', error);
    throw error;
  }
}

export async function verifyToken(token) {
  console.log('Verifying JWT token...');
  
  if (!token) {
    console.log('No token provided for verification');
    return null;
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secure-jwt-secret-key'
    );
    
    const { payload } = await jose.jwtVerify(token, secret);
    console.log(`Token verified successfully for user ID: ${payload.id}`);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

export async function getUserById(id) {
  console.log(`Fetching user data for ID: ${id}`);
  try {
    const [rows] = await db.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
    
    if (rows[0]) {
      console.log(`User found: ${rows[0].username}`);
    } else {
      console.log(`No user found with ID: ${id}`);
    }
    
    return rows[0] || null;
  } catch (error) {
    console.error(`Database error when fetching user ID ${id}:`, error);
    throw error;
  }
}
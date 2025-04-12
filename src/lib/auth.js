// /lib/auth.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '1d'
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
}

export async function getUserById(id) {
  const [rows] = await db.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

// /lib/fileStorage.js

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import db from './db';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function saveFile(file, userId) {
  const filename = `${uuidv4()}-${file.originalFilename.replace(/\s+/g, '-')}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  
  const fileBuffer = fs.readFileSync(file.filepath);
  fs.writeFileSync(filePath, fileBuffer);
  
  const [result] = await db.query(`
    INSERT INTO files (filename, original_filename, mime_type, size, path, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    filename,
    file.originalFilename,
    file.mimetype,
    file.size,
    `/uploads/${filename}`,
    userId
  ]);
  
  return {
    id: result.insertId,
    filename,
    originalFilename: file.originalFilename,
    mimeType: file.mimetype,
    size: file.size,
    path: `/uploads/${filename}`,
    userId
  };
}

export async function getFileById(id, userId = null) {
  let query = `
    SELECT f.* FROM files f
    LEFT JOIN file_shares fs ON f.id = fs.file_id
    WHERE f.id = ? AND (f.user_id = ? OR fs.user_id = ? OR f.public = 1)
  `;
  
  const [rows] = await db.query(query, [id, userId, userId]);
  return rows[0] || null;
}

export async function deleteFile(id, userId) {
  const file = await getFileById(id, userId);
  
  if (!file) {
    return { success: false, message: 'File not found or access denied' };
  }
  
  // Check if user has permission to delete (owner or admin share)
  if (file.user_id !== userId) {
    const [shareRows] = await db.query(
      'SELECT * FROM file_shares WHERE file_id = ? AND user_id = ? AND access_level = "admin"',
      [id, userId]
    );
    
    if (shareRows.length === 0) {
      return { success: false, message: 'You do not have permission to delete this file' };
    }
  }
  
  // Delete file from filesystem
  try {
    const filePath = path.join(process.cwd(), 'public', file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file from filesystem:', error);
  }
  
  // Delete from database
  await db.query('DELETE FROM files WHERE id = ?', [id]);
  
  return { success: true, message: 'File deleted successfully' };
}
// /lib/fileStorage.js

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import db from './db';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// Ensure upload directory exists
console.log(`Checking if upload directory exists: ${UPLOAD_DIR}`);
if (!fs.existsSync(UPLOAD_DIR)) {
  console.log(`Creating upload directory: ${UPLOAD_DIR}`);
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log('Upload directory created successfully');
} else {
  console.log('Upload directory already exists');
}

export async function saveFile(file, userId) {
  console.log(`Starting file save process for user ID: ${userId}`);
  console.log(`Original file details: name=${file.originalFilename}, type=${file.mimetype}, size=${file.size} bytes`);
  
  const filename = `${uuidv4()}-${file.originalFilename.replace(/\s+/g, '-')}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  console.log(`Generated unique filename: ${filename}`);
  console.log(`Target file path: ${filePath}`);
  
  try {
    console.log(`Reading file buffer from temporary location: ${file.filepath}`);
    const fileBuffer = fs.readFileSync(file.filepath);
    console.log(`Writing file buffer to destination: ${filePath}`);
    fs.writeFileSync(filePath, fileBuffer);
    console.log('File successfully written to disk');
    
    console.log('Inserting file record into database...');
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
    
    console.log(`File record created in database with ID: ${result.insertId}`);
    
    return {
      id: result.insertId,
      filename,
      originalFilename: file.originalFilename,
      mimeType: file.mimetype,
      size: file.size,
      path: `/uploads/${filename}`,
      userId
    };
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}

export async function getFileById(id, userId = null) {
  console.log(`Fetching file with ID: ${id} for user ID: ${userId || 'anonymous'}`);
  
  try {
    let query = `
      SELECT f.* FROM files f
      LEFT JOIN file_shares fs ON f.id = fs.file_id
      WHERE f.id = ? AND (f.user_id = ? OR fs.user_id = ? OR f.public = 1)
    `;
    
    console.log(`Executing database query to find file: ${query}`);
    console.log(`Query parameters: fileId=${id}, userId=${userId}, userId=${userId}`);
    
    const [rows] = await db.query(query, [id, userId, userId]);
    
    if (rows[0]) {
      console.log(`File found: ID=${rows[0].id}, name=${rows[0].original_filename}`);
      return rows[0];
    } else {
      console.log(`No file found with ID ${id} for user ${userId || 'anonymous'}`);
      return null;
    }
  } catch (error) {
    console.error(`Database error when fetching file ID ${id}:`, error);
    throw error;
  }
}

export async function deleteFile(id, userId) {
  console.log(`Attempting to delete file ID: ${id} by user ID: ${userId}`);
  
  try {
    console.log(`Checking if file exists and user has permission`);
    const file = await getFileById(id, userId);
    
    if (!file) {
      console.log(`File not found or access denied for file ID: ${id}`);
      return { success: false, message: 'File not found or access denied' };
    }
    
    // Check if user has permission to delete (owner or admin share)
    if (file.user_id !== userId) {
      console.log(`User ${userId} is not the owner of file ${id}, checking for admin share permissions`);
      
      const [shareRows] = await db.query(
        'SELECT * FROM file_shares WHERE file_id = ? AND user_id = ? AND access_level = "admin"',
        [id, userId]
      );
      
      if (shareRows.length === 0) {
        console.log(`User ${userId} does not have admin permissions to delete file ${id}`);
        return { success: false, message: 'You do not have permission to delete this file' };
      } else {
        console.log(`User ${userId} has admin share permissions to delete file ${id}`);
      }
    } else {
      console.log(`User ${userId} is the owner of file ${id}, deletion permitted`);
    }
    
    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), 'public', file.path);
      console.log(`Attempting to delete physical file at: ${filePath}`);
      
      if (fs.existsSync(filePath)) {
        console.log(`File exists at ${filePath}, deleting...`);
        fs.unlinkSync(filePath);
        console.log(`File successfully deleted from filesystem`);
      } else {
        console.log(`Physical file not found at ${filePath}`);
      }
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
      // Continue with database deletion even if file system deletion fails
    }
    
    // Delete from database
    console.log(`Deleting file record from database for ID: ${id}`);
    await db.query('DELETE FROM files WHERE id = ?', [id]);
    console.log(`Database record for file ID ${id} successfully deleted`);
    
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error(`Error in delete file process for ID ${id}:`, error);
    throw error;
  }
}

export async function updateFile(id, userId, updateData) {
  console.log(`Attempting to update file ID: ${id} by user ID: ${userId}`);
  console.log(`Update data:`, updateData);
  
  try {
    // Check permissions
    const file = await getFileById(id, userId);
    
    if (!file) {
      console.log(`File not found or access denied for file ID: ${id}`);
      return { success: false, message: 'File not found or access denied' };
    }
    
    // Check if user has permission to update (owner or write/admin share)
    if (file.user_id !== userId) {
      console.log(`User ${userId} is not the owner of file ${id}, checking for write/admin permissions`);
      
      const [shareRows] = await db.query(
        'SELECT * FROM file_shares WHERE file_id = ? AND user_id = ? AND (access_level = "write" OR access_level = "admin")',
        [id, userId]
      );
      
      if (shareRows.length === 0) {
        console.log(`User ${userId} does not have write permissions for file ${id}`);
        return { success: false, message: 'You do not have permission to update this file' };
      } else {
        console.log(`User ${userId} has write/admin permissions for file ${id}`);
      }
    } else {
      console.log(`User ${userId} is the owner of file ${id}, update permitted`);
    }
    
    // Prepare update query
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (['original_filename', 'public'].includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
        console.log(`Adding update for field ${key} with value: ${value}`);
      }
    }
    
    if (updates.length === 0) {
      console.log('No valid fields to update');
      return { success: false, message: 'No valid fields to update' };
    }
    
    values.push(id);
    
    const query = `UPDATE files SET ${updates.join(', ')} WHERE id = ?`;
    console.log(`Executing update query: ${query}`);
    
    await db.query(query, values);
    console.log(`File ID ${id} successfully updated in database`);
    
    return { success: true, message: 'File updated successfully' };
  } catch (error) {
    console.error(`Error updating file ID ${id}:`, error);
    throw error;
  }
}

export async function shareFile(fileId, ownerId, userId, accessLevel) {
  console.log(`Sharing file ID: ${fileId} owned by: ${ownerId} with user: ${userId} at access level: ${accessLevel}`);
  
  try {
    // Verify the file exists and requester is the owner
    const [fileRows] = await db.query('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, ownerId]);
    
    if (fileRows.length === 0) {
      console.log(`File not found or user ${ownerId} is not the owner of file ${fileId}`);
      return { success: false, message: 'File not found or you are not the owner' };
    }
    
    console.log(`File found and ownership verified for ID: ${fileId}`);
    
    // Verify the target user exists
    const [userRows] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    
    if (userRows.length === 0) {
      console.log(`Target user ID ${userId} not found`);
      return { success: false, message: 'Target user not found' };
    }
    
    console.log(`Target user verified for ID: ${userId}`);
    
    // Check if share already exists
    const [existingShare] = await db.query(
      'SELECT * FROM file_shares WHERE file_id = ? AND user_id = ?',
      [fileId, userId]
    );
    
    if (existingShare.length > 0) {
      console.log(`Updating existing share for file ${fileId} with user ${userId}`);
      await db.query(
        'UPDATE file_shares SET access_level = ? WHERE file_id = ? AND user_id = ?',
        [accessLevel, fileId, userId]
      );
      console.log(`Share successfully updated with access level: ${accessLevel}`);
    } else {
      console.log(`Creating new share for file ${fileId} with user ${userId}`);
      await db.query(
        'INSERT INTO file_shares (file_id, user_id, access_level) VALUES (?, ?, ?)',
        [fileId, userId, accessLevel]
      );
      console.log(`New share created with access level: ${accessLevel}`);
    }
    
    return { success: true, message: 'File shared successfully' };
  } catch (error) {
    console.error(`Error sharing file ID ${fileId}:`, error);
    throw error;
  }
}

export async function removeShare(fileId, ownerId, userId) {
  console.log(`Removing share for file ID: ${fileId} owned by: ${ownerId} from user: ${userId}`);
  
  try {
    // Verify the file exists and requester is the owner
    const [fileRows] = await db.query('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, ownerId]);
    
    if (fileRows.length === 0) {
      console.log(`File not found or user ${ownerId} is not the owner of file ${fileId}`);
      return { success: false, message: 'File not found or you are not the owner' };
    }
    
    console.log(`File found and ownership verified for ID: ${fileId}`);
    
    // Remove share
    const [result] = await db.query(
      'DELETE FROM file_shares WHERE file_id = ? AND user_id = ?',
      [fileId, userId]
    );
    
    if (result.affectedRows > 0) {
      console.log(`Share successfully removed for file ${fileId} from user ${userId}`);
      return { success: true, message: 'Share removed successfully' };
    } else {
      console.log(`No share found for file ${fileId} with user ${userId}`);
      return { success: false, message: 'Share not found' };
    }
  } catch (error) {
    console.error(`Error removing share for file ID ${fileId}:`, error);
    throw error;
  }
}
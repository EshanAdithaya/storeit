// /pages/api/files/share.js

import { verifyToken } from '../../../lib/auth';
import db from '../../../lib/db';
import { getFileById } from '../../../lib/fileStorage';

export default async function handler(req, res) {
  // Verify user is authenticated
  const token = req.cookies.token;
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // POST - Share a file with another user
  if (req.method === 'POST') {
    try {
      const { fileId, userId, accessLevel } = req.body;
      
      if (!fileId || !userId || !accessLevel) {
        return res.status(400).json({ message: 'File ID, user ID, and access level are required' });
      }
      
      // Check if file exists and current user is the owner
      const file = await getFileById(fileId, user.id);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found or access denied' });
      }
      
      if (file.user_id !== user.id) {
        return res.status(403).json({ message: 'Only the file owner can share the file' });
      }
      
      // Check if the target user exists
      const [userRows] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
      
      if (userRows.length === 0) {
        return res.status(404).json({ message: 'Target user not found' });
      }
      
      // Check if the file is already shared with this user
      const [existingShares] = await db.query(
        'SELECT * FROM file_shares WHERE file_id = ? AND user_id = ?',
        [fileId, userId]
      );
      
      if (existingShares.length > 0) {
        // Update existing share
        await db.query(
          'UPDATE file_shares SET access_level = ? WHERE file_id = ? AND user_id = ?',
          [accessLevel, fileId, userId]
        );
      } else {
        // Create new share
        await db.query(
          'INSERT INTO file_shares (file_id, user_id, access_level) VALUES (?, ?, ?)',
          [fileId, userId, accessLevel]
        );
      }
      
      return res.status(200).json({ message: 'File shared successfully' });
    } catch (error) {
      console.error('Error sharing file:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // DELETE - Remove file sharing
  if (req.method === 'DELETE') {
    try {
      const { fileId, userId } = req.body;
      
      if (!fileId || !userId) {
        return res.status(400).json({ message: 'File ID and user ID are required' });
      }
      
      // Check if file exists and current user is the owner
      const file = await getFileById(fileId, user.id);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found or access denied' });
      }
      
      if (file.user_id !== user.id) {
        return res.status(403).json({ message: 'Only the file owner can modify sharing' });
      }
      
      // Remove the share
      await db.query(
        'DELETE FROM file_shares WHERE file_id = ? AND user_id = ?',
        [fileId, userId]
      );
      
      return res.status(200).json({ message: 'File sharing removed successfully' });
    } catch (error) {
      console.error('Error removing file sharing:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Other methods not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
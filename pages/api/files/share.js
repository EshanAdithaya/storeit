// /pages/api/files/share.js

import { verifyToken } from '../../../lib/auth';
import db from '../../../lib/db';
import { getFileById } from '../../../lib/fileStorage';

export default async function handler(req, res) {
  console.log('File share API request received');
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
  
  // POST - Share a file with another user
  if (req.method === 'POST') {
    console.log('Processing POST request to share file');
    try {
      const { fileId, userId, accessLevel } = req.body;
      console.log(`Share request data: fileId=${fileId}, userId=${userId}, accessLevel=${accessLevel}`);
      
      if (!fileId || !userId || !accessLevel) {
        console.error('Invalid share request: Missing required fields');
        console.log(`Missing fields: ${!fileId ? 'fileId' : ''} ${!userId ? 'userId' : ''} ${!accessLevel ? 'accessLevel' : ''}`);
        return res.status(400).json({ message: 'File ID, user ID, and access level are required' });
      }
      
      // Check if file exists and current user is the owner
      console.log(`Checking if file exists and user has access: fileId=${fileId}, userId=${user.id}`);
      const file = await getFileById(fileId, user.id);
      
      if (!file) {
        console.error(`File not found or access denied: fileId=${fileId}`);
        return res.status(404).json({ message: 'File not found or access denied' });
      }
      
      console.log(`File found: ID=${file.id}, name=${file.original_filename}`);
      
      if (file.user_id !== user.id) {
        console.error(`Permission denied: User ${user.id} is not the owner of file ${fileId}`);
        return res.status(403).json({ message: 'Only the file owner can share the file' });
      }
      
      console.log(`Share permission verified: User ${user.id} is the owner of file ${fileId}`);
      
      // Check if the target user exists
      console.log(`Checking if target user exists: userId=${userId}`);
      const [userRows] = await db.query('SELECT id, username FROM users WHERE id = ?', [userId]);
      
      if (userRows.length === 0) {
        console.error(`Target user not found: userId=${userId}`);
        return res.status(404).json({ message: 'Target user not found' });
      }
      
      console.log(`Target user found: ID=${userRows[0].id}, username=${userRows[0].username}`);
      
      // Check if the file is already shared with this user
      console.log(`Checking if file is already shared with user: fileId=${fileId}, userId=${userId}`);
      const [existingShares] = await db.query(
        'SELECT * FROM file_shares WHERE file_id = ? AND user_id = ?',
        [fileId, userId]
      );
      
      if (existingShares.length > 0) {
        console.log(`Existing share found, updating access level to: ${accessLevel}`);
        // Update existing share
        await db.query(
          'UPDATE file_shares SET access_level = ? WHERE file_id = ? AND user_id = ?',
          [accessLevel, fileId, userId]
        );
        console.log(`Share updated successfully: fileId=${fileId}, userId=${userId}, accessLevel=${accessLevel}`);
      } else {
        console.log(`No existing share found, creating new share with access level: ${accessLevel}`);
        // Create new share
        await db.query(
          'INSERT INTO file_shares (file_id, user_id, access_level) VALUES (?, ?, ?)',
          [fileId, userId, accessLevel]
        );
        console.log(`Share created successfully: fileId=${fileId}, userId=${userId}, accessLevel=${accessLevel}`);
      }
      
      console.log(`File share operation completed successfully`);
      return res.status(200).json({ message: 'File shared successfully' });
    } catch (error) {
      console.error('Error sharing file:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // DELETE - Remove file sharing
  if (req.method === 'DELETE') {
    console.log('Processing DELETE request to remove file sharing');
    try {
      const { fileId, userId } = req.body;
      console.log(`Share removal request data: fileId=${fileId}, userId=${userId}`);
      
      if (!fileId || !userId) {
        console.error('Invalid share removal request: Missing required fields');
        console.log(`Missing fields: ${!fileId ? 'fileId' : ''} ${!userId ? 'userId' : ''}`);
        return res.status(400).json({ message: 'File ID and user ID are required' });
      }
      
      // Check if file exists and current user is the owner
      console.log(`Checking if file exists and user has access: fileId=${fileId}, userId=${user.id}`);
      const file = await getFileById(fileId, user.id);
      
      if (!file) {
        console.error(`File not found or access denied: fileId=${fileId}`);
        return res.status(404).json({ message: 'File not found or access denied' });
      }
      
      console.log(`File found: ID=${file.id}, name=${file.original_filename}`);
      
      if (file.user_id !== user.id) {
        console.error(`Permission denied: User ${user.id} is not the owner of file ${fileId}`);
        return res.status(403).json({ message: 'Only the file owner can modify sharing' });
      }
      
      console.log(`Share removal permission verified: User ${user.id} is the owner of file ${fileId}`);
      
      // Remove the share
      console.log(`Removing share: fileId=${fileId}, userId=${userId}`);
      const [result] = await db.query(
        'DELETE FROM file_shares WHERE file_id = ? AND user_id = ?',
        [fileId, userId]
      );
      
      console.log(`Share removal database result: ${result.affectedRows} rows affected`);
      
      if (result.affectedRows === 0) {
        console.log(`No share found to remove for fileId=${fileId}, userId=${userId}`);
      } else {
        console.log(`Share removed successfully: fileId=${fileId}, userId=${userId}`);
      }
      
      return res.status(200).json({ message: 'File sharing removed successfully' });
    } catch (error) {
      console.error('Error removing file sharing:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Other methods not allowed
  console.log(`Method ${req.method} not allowed for file share API`);
  return res.status(405).json({ message: 'Method not allowed' });
}
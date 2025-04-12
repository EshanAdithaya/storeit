// /pages/api/files/[id].js

import db from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';
import { getFileById, deleteFile } from '../../../lib/fileStorage';

export default async function handler(req, res) {
  // Verify user is authenticated
  const token = req.cookies.token;
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { id } = req.query;
  
  // GET - Get file details
  if (req.method === 'GET') {
    try {
      const file = await getFileById(id, user.id);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found or access denied' });
      }
      
      // Get owner information
      const [ownerResult] = await db.query(
        'SELECT id, username FROM users WHERE id = ?',
        [file.user_id]
      );
      
      // Get share information if any
      const [sharesResult] = await db.query(
        `SELECT fs.*, u.username 
         FROM file_shares fs
         JOIN users u ON fs.user_id = u.id
         WHERE fs.file_id = ?`,
        [id]
      );
      
      return res.status(200).json({
        file,
        owner: ownerResult[0] || null,
        shares: sharesResult
      });
    } catch (error) {
      console.error('Error fetching file details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // DELETE - Delete file
  if (req.method === 'DELETE') {
    try {
      const result = await deleteFile(id, user.id);
      
      if (!result.success) {
        return res.status(403).json({ message: result.message });
      }
      
      return res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // PATCH - Update file details (rename, change visibility)
  if (req.method === 'PATCH') {
    try {
      const { original_filename, public: isPublic } = req.body;
      
      // Check if file exists and user has access
      const file = await getFileById(id, user.id);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found or access denied' });
      }
      
      // Check if user has permission to update
      if (file.user_id !== user.id) {
        const [shareRows] = await db.query(
          'SELECT * FROM file_shares WHERE file_id = ? AND user_id = ? AND access_level IN ("write", "admin")',
          [id, user.id]
        );
        
        if (shareRows.length === 0) {
          return res.status(403).json({ message: 'You do not have permission to update this file' });
        }
      }
      
      // Update file details
      const updateFields = [];
      const updateParams = [];
      
      if (original_filename) {
        updateFields.push('original_filename = ?');
        updateParams.push(original_filename);
      }
      
      if (isPublic !== undefined && file.user_id === user.id) {
        updateFields.push('public = ?');
        updateParams.push(isPublic ? 1 : 0);
      }
      
      // If nothing to update
      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No valid fields to update' });
      }
      
      // Add file ID to params
      updateParams.push(id);
      
      // Execute update
      await db.query(
        `UPDATE files SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );
      
      // Fetch updated file
      const updatedFile = await getFileById(id, user.id);
      
      return res.status(200).json({
        message: 'File updated successfully',
        file: updatedFile
      });
    } catch (error) {
      console.error('Error updating file:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Other methods not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
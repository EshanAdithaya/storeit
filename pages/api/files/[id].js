// /pages/api/files/[id].js

import db from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';
import { getFileById, deleteFile } from '../../../lib/fileStorage';

export default async function handler(req, res) {
  console.log(`File API request received for file ID: ${req.query.id}`);
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
  const { id } = req.query;
  console.log(`Processing request for file ID: ${id}`);
  
  // GET - Get file details
  if (req.method === 'GET') {
    console.log(`Processing GET request for file ID: ${id}`);
    try {
      console.log(`Checking if file exists and user has access`);
      const file = await getFileById(id, user.id);
      
      if (!file) {
        console.log(`File not found or user ${user.id} doesn't have access to file ${id}`);
        return res.status(404).json({ message: 'File not found or access denied' });
      }
      
      console.log(`File found: ID=${file.id}, name=${file.original_filename}`);
      
      // Get owner information
      console.log(`Fetching owner information for file ${id}`);
      const [ownerResult] = await db.query(
        'SELECT id, username FROM users WHERE id = ?',
        [file.user_id]
      );
      console.log(`Owner information retrieved: ${ownerResult.length > 0 ? ownerResult[0].username : 'Not found'}`);
      
      // Get share information if any
      console.log(`Fetching share information for file ${id}`);
      const [sharesResult] = await db.query(
        `SELECT fs.*, u.username 
         FROM file_shares fs
         JOIN users u ON fs.user_id = u.id
         WHERE fs.file_id = ?`,
        [id]
      );
      console.log(`Found ${sharesResult.length} shares for file ${id}`);
      
      console.log(`File details request successful, returning data`);
      return res.status(200).json({
        file,
        owner: ownerResult[0] || null,
        shares: sharesResult
      });
    } catch (error) {
      console.error('Error fetching file details:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // DELETE - Delete file
  if (req.method === 'DELETE') {
    console.log(`Processing DELETE request for file ID: ${id}`);
    try {
      console.log(`Attempting to delete file ${id} by user ${user.id}`);
      const result = await deleteFile(id, user.id);
      
      if (!result.success) {
        console.log(`File deletion failed: ${result.message}`);
        return res.status(403).json({ message: result.message });
      }
      
      console.log(`File ${id} successfully deleted`);
      return res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // PATCH - Update file details (rename, change visibility)
  if (req.method === 'PATCH') {
    console.log(`Processing PATCH request for file ID: ${id}`);
    try {
      const { original_filename, public: isPublic } = req.body;
      console.log(`Update request with data:`, { original_filename, public: isPublic });
      
      // Check if file exists and user has access
      console.log(`Checking if file exists and user has access`);
      const file = await getFileById(id, user.id);
      
      if (!file) {
        console.log(`File not found or user ${user.id} doesn't have access to file ${id}`);
        return res.status(404).json({ message: 'File not found or access denied' });
      }
      console.log(`File found: ID=${file.id}, name=${file.original_filename}`);
      
      // Check if user has permission to update
      if (file.user_id !== user.id) {
        console.log(`User ${user.id} is not the owner of file ${id}, checking for write/admin permissions`);
        const [shareRows] = await db.query(
          'SELECT * FROM file_shares WHERE file_id = ? AND user_id = ? AND access_level IN ("write", "admin")',
          [id, user.id]
        );
        
        if (shareRows.length === 0) {
          console.log(`User ${user.id} does not have write/admin permissions for file ${id}`);
          return res.status(403).json({ message: 'You do not have permission to update this file' });
        }
        console.log(`User ${user.id} has write/admin permissions for file ${id}`);
      } else {
        console.log(`User ${user.id} is the owner of file ${id}`);
      }
      
      // Update file details
      console.log('Preparing update query');
      const updateFields = [];
      const updateParams = [];
      
      if (original_filename) {
        updateFields.push('original_filename = ?');
        updateParams.push(original_filename);
        console.log(`Adding filename update: ${original_filename}`);
      }
      
      if (isPublic !== undefined && file.user_id === user.id) {
        updateFields.push('public = ?');
        updateParams.push(isPublic ? 1 : 0);
        console.log(`Adding visibility update: ${isPublic ? 'public' : 'private'}`);
      }
      
      // If nothing to update
      if (updateFields.length === 0) {
        console.log('No valid fields to update');
        return res.status(400).json({ message: 'No valid fields to update' });
      }
      
      // Add file ID to params
      updateParams.push(id);
      
      // Execute update
      const updateQuery = `UPDATE files SET ${updateFields.join(', ')} WHERE id = ?`;
      console.log(`Executing update query: ${updateQuery}`);
      console.log('Query parameters:', updateParams);
      
      await db.query(updateQuery, updateParams);
      console.log(`Database update successful for file ${id}`);
      
      // Fetch updated file
      console.log(`Fetching updated file data`);
      const updatedFile = await getFileById(id, user.id);
      console.log(`Updated file retrieved: ${updatedFile.original_filename}`);
      
      console.log(`File update successful, returning updated data`);
      return res.status(200).json({
        message: 'File updated successfully',
        file: updatedFile
      });
    } catch (error) {
      console.error('Error updating file:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Other methods not allowed
  console.log(`Method ${req.method} not allowed for file API`);
  return res.status(405).json({ message: 'Method not allowed' });
}
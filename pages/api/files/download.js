// /pages/api/files/download.js

import fs from 'fs';
import path from 'path';
import { verifyToken } from '../../../lib/auth';
import { getFileById } from '../../../lib/fileStorage';

export default async function handler(req, res) {
  console.log('File download API request received');
  console.log(`Request method: ${req.method}`);
  
  if (req.method !== 'GET') {
    console.log(`Rejecting request with wrong method: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  console.log(`Download requested for file ID: ${id}`);
  
  if (!id) {
    console.error('Download request failed: No file ID provided');
    return res.status(400).json({ message: 'File ID is required' });
  }

  // Verify user is authenticated
  const token = req.cookies.token;
  console.log(`Auth token from cookies: ${token ? 'Present' : 'Not present'}`);
  
  const user = verifyToken(token);
  
  if (user) {
    console.log(`User authenticated: ID=${user.id}, username=${user.username}`);
  } else {
    console.log('No authenticated user, proceeding as anonymous user');
  }
  
  try {
    // Get file details
    console.log(`Fetching file data from database for ID: ${id}`);
    const file = await getFileById(id, user?.id);
    
    if (!file) {
      console.error(`File not found or access denied for ID: ${id}`);
      return res.status(404).json({ message: 'File not found or access denied' });
    }
    
    console.log(`File found: ID=${file.id}, name=${file.original_filename}, type=${file.mime_type}`);
    
    // Check if file is public or user has access
    if (!file.public && !user) {
      console.error(`Access denied: File is private and no user is authenticated`);
      return res.status(401).json({ message: 'Authentication required to access this file' });
    }
    
    // Log access type
    if (file.public) {
      console.log(`File access: Public file`);
    } else if (file.user_id === user.id) {
      console.log(`File access: Owner access`);
    } else {
      console.log(`File access: Shared access`);
    }
    
    // Get file path
    const filePath = path.join(process.cwd(), 'public', file.path);
    console.log(`Physical file path: ${filePath}`);
    
    // Check if file exists in the filesystem
    console.log(`Checking if file exists in filesystem`);
    if (!fs.existsSync(filePath)) {
      console.error(`Physical file not found at path: ${filePath}`);
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    console.log(`File exists in filesystem, preparing download`);
    
    // Set appropriate headers
    console.log(`Setting response headers for download`);
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_filename}"`);
    res.setHeader('Content-Type', file.mime_type);
    
    // Get file size for logging
    const stats = fs.statSync(filePath);
    console.log(`File size: ${stats.size} bytes`);
    
    // Stream the file
    console.log(`Starting file stream for download`);
    const fileStream = fs.createReadStream(filePath);
    
    // Log stream events
    fileStream.on('open', () => {
      console.log(`File stream opened successfully`);
    });
    
    fileStream.on('end', () => {
      console.log(`File stream completed for ${file.original_filename}`);
    });
    
    fileStream.on('error', (error) => {
      console.error(`File stream error:`, error);
    });
    
    // Handle response errors
    res.on('error', (error) => {
      console.error(`Response stream error:`, error);
    });
    
    // Pipe file to response
    console.log(`Piping file to response`);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
// /pages/api/files/download.js

import fs from 'fs';
import path from 'path';
import { verifyToken } from '../../../lib/auth';
import { getFileById } from '../../../lib/fileStorage';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'File ID is required' });
  }

  // Verify user is authenticated
  const token = req.cookies.token;
  const user = verifyToken(token);
  
  try {
    // Get file details
    const file = await getFileById(id, user?.id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found or access denied' });
    }
    
    // Check if file is public or user has access
    if (!file.public && !user) {
      return res.status(401).json({ message: 'Authentication required to access this file' });
    }
    
    // Get file path
    const filePath = path.join(process.cwd(), 'public', file.path);
    
    // Check if file exists in the filesystem
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_filename}"`);
    res.setHeader('Content-Type', file.mime_type);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
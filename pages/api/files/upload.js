// /pages/api/files/upload.js

import formidable from 'formidable';
import { verifyToken } from '../../../lib/auth';
import { saveFile } from '../../../lib/fileStorage';

// Disable body parsing for this route as we're using formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('File upload API request received');
  console.log(`Request method: ${req.method}`);
  
  if (req.method !== 'POST') {
    console.log(`Rejecting request with wrong method: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.cookies.token; // Fallback to cookie if header not present
  
  console.log(`Auth token source: ${authHeader ? 'Authorization header' : (token ? 'Cookie' : 'Not present')}`);
  console.log(`Auth token: ${token ? 'Present' : 'Not present'}`);
  
  try {
    // Using await with verifyToken since it now returns a Promise
    console.log('Verifying auth token...');
    const user = await verifyToken(token);
    
    if (!user || !user.id) {
      console.error('Authentication failed: Invalid or missing token');
      return res.status(401).json({ message: 'Authentication required. Please log in again.' });
    }
    
    console.log(`User authenticated: ID=${user.id}, username=${user.username}`);

    // Parse form with formidable
    console.log('Initializing formidable for file parsing');
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
      keepExtensions: true,
    });
    console.log('Formidable initialized with maxFileSize: 100MB');

    console.log('Beginning file parsing...');
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
        }
        console.log('Form parsing completed successfully');
        resolve([fields, files]);
      });
    });
    console.log('File parsing completed');

    // Check if file was uploaded
    if (!files.file) {
      console.error('No file found in upload request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Log file details
    const fileToUpload = files.file;
    console.log(`File received for upload: ${fileToUpload.originalFilename}`);
    console.log(`File details: size=${fileToUpload.size} bytes, type=${fileToUpload.mimetype}`);
    
    // Check any metadata or options from the form fields
    if (fields.isPublic) {
      console.log(`File visibility: Public (${fields.isPublic === 'true' ? 'true' : 'false'})`);
    }
    
    if (fields.description) {
      console.log(`File description provided: "${fields.description}"`);
    }
    
    // Save file to storage
    console.log(`Starting file save process for user ${user.id}...`);
    const savedFile = await saveFile(fileToUpload, user.id, {
      isPublic: fields.isPublic === 'true',
      description: fields.description
    });
    console.log(`File saved successfully: ID=${savedFile.id}, path=${savedFile.path}`);

    console.log('File upload process completed successfully');
    return res.status(201).json({
      message: 'File uploaded successfully',
      file: savedFile
    });
  } catch (error) {
    console.error('File upload error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      console.error('File size limit exceeded error');
      return res.status(413).json({ 
        message: 'File is too large',
        maxSize: '100MB'
      });
    }
    
    if (error.httpCode === 413) {
      console.error('Request entity too large error');
      return res.status(413).json({ 
        message: 'File is too large',
        maxSize: '100MB'
      });
    }
    
    if (error.code === 'ENOENT') {
      console.error('File system error: Could not find or access the file');
      return res.status(500).json({ message: 'Storage system error' });
    }
    
    if (error.code === 'EACCES') {
      console.error('File system error: Permission denied');
      return res.status(500).json({ message: 'Storage permission error' });
    }
    
    console.error('Unhandled file upload error');
    return res.status(500).json({ message: 'Internal server error' });
  }
}
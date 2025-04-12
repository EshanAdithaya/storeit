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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify user is authenticated
  const token = req.cookies.token;
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Parse form with formidable
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Check if file was uploaded
    if (!files.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save file to storage
    const savedFile = await saveFile(files.file, user.id);

    return res.status(201).json({
      message: 'File uploaded successfully',
      file: savedFile
    });
  } catch (error) {
    console.error('File upload error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File is too large' });
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// /pages/api/dashboard.js

import { verifyToken } from '../../lib/auth';
import db from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify user is authenticated
  const token = req.cookies.token;
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    // Get total files count
    const [totalFilesResult] = await db.query(
      `SELECT COUNT(*) as total 
       FROM files 
       WHERE user_id = ?`,
      [user.id]
    );
    
    // Get total storage used
    const [totalStorageResult] = await db.query(
      `SELECT SUM(size) as total 
       FROM files 
       WHERE user_id = ?`,
      [user.id]
    );
    
    // Get recent files
    const [recentFiles] = await db.query(
      `SELECT * 
       FROM files 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [user.id]
    );
    
    // Get shared files count
    const [sharedFilesResult] = await db.query(
      `SELECT COUNT(*) as total 
       FROM files f
       JOIN file_shares fs ON f.id = fs.file_id
       WHERE f.user_id = ?`,
      [user.id]
    );
    
    return res.status(200).json({
      totalFiles: totalFilesResult[0].total,
      totalStorage: totalStorageResult[0].total || 0,
      recentFiles,
      sharedFiles: sharedFilesResult[0].total
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
// /pages/api/dashboard.js

import { verifyToken } from '../../lib/auth';
import db from '../../lib/db';

export default async function handler(req, res) {
  console.log('Dashboard API request received');
  console.log(`Request method: ${req.method}`);
  
  if (req.method !== 'GET') {
    console.log(`Rejecting request with wrong method: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify user is authenticated
  const token = req.cookies.token;
  console.log(`Auth token from cookies: ${token ? 'Present' : 'Not present'}`);
  
  const user = verifyToken(token);
  
  if (!user) {
    console.error('Authentication failed: Invalid or missing token');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  console.log(`User authenticated: ID=${user.id}, username=${user.username}`);
  console.log('Processing dashboard data request');
  
  try {
    console.log('Fetching total files count...');
    // Get total files count
    const [totalFilesResult] = await db.query(
      `SELECT COUNT(*) as total 
       FROM files 
       WHERE user_id = ?`,
      [user.id]
    );
    console.log(`Total files count query completed: ${totalFilesResult[0].total} files`);
    
    console.log('Fetching total storage used...');
    // Get total storage used
    const [totalStorageResult] = await db.query(
      `SELECT SUM(size) as total 
       FROM files 
       WHERE user_id = ?`,
      [user.id]
    );
    const totalStorage = totalStorageResult[0].total || 0;
    console.log(`Total storage query completed: ${totalStorage} bytes (${(totalStorage / (1024 * 1024)).toFixed(2)} MB)`);
    
    console.log('Fetching recent files...');
    // Get recent files
    const [recentFiles] = await db.query(
      `SELECT * 
       FROM files 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [user.id]
    );
    console.log(`Recent files query completed: ${recentFiles.length} files retrieved`);
    
    // Log recent files details
    if (recentFiles.length > 0) {
      console.log('Recent files:');
      recentFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ID=${file.id}, name=${file.original_filename}, uploaded=${new Date(file.created_at).toISOString()}`);
      });
    } else {
      console.log('No recent files found');
    }
    
    console.log('Fetching shared files count...');
    // Get shared files count
    const [sharedFilesResult] = await db.query(
      `SELECT COUNT(*) as total 
       FROM files f
       JOIN file_shares fs ON f.id = fs.file_id
       WHERE f.user_id = ?`,
      [user.id]
    );
    console.log(`Shared files count query completed: ${sharedFilesResult[0].total} shared files`);
    
    console.log('All dashboard data fetched successfully');
    console.log('Dashboard stats summary:');
    console.log(`- Total files: ${totalFilesResult[0].total}`);
    console.log(`- Total storage: ${(totalStorage / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`- Recent files: ${recentFiles.length}`);
    console.log(`- Shared files: ${sharedFilesResult[0].total}`);
    
    console.log('Sending dashboard data response');
    return res.status(200).json({
      totalFiles: totalFilesResult[0].total,
      totalStorage: totalStorage,
      recentFiles,
      sharedFiles: sharedFilesResult[0].total
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Failed to fetch dashboard data');
    return res.status(500).json({ message: 'Internal server error' });
  }
}
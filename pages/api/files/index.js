// /pages/api/files/index.js

import db from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  // Verify user is authenticated
  const token = req.cookies.token;
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // GET - List files
  if (req.method === 'GET') {
    try {
      // Get query parameters for pagination and filtering
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      
      // Build query
      const baseQuery = `
        SELECT f.*, u.username as owner_name 
        FROM files f
        JOIN users u ON f.user_id = u.id
        LEFT JOIN file_shares fs ON f.id = fs.file_id
        WHERE (f.user_id = ? OR fs.user_id = ? OR f.public = 1)
      `;
      
      const countQuery = `
        SELECT COUNT(DISTINCT f.id) as total
        FROM files f
        LEFT JOIN file_shares fs ON f.id = fs.file_id
        WHERE (f.user_id = ? OR fs.user_id = ? OR f.public = 1)
      `;
      
      let finalQuery = baseQuery;
      let countParams = [user.id, user.id];
      let queryParams = [user.id, user.id];
      
      // Add search filtering if provided
      if (search) {
        finalQuery += ` AND (f.original_filename LIKE ? OR f.filename LIKE ?)`;
        countQuery += ` AND (f.original_filename LIKE ? OR f.filename LIKE ?)`;
        const searchParam = `%${search}%`;
        queryParams.push(searchParam, searchParam);
        countParams.push(searchParam, searchParam);
      }
      
      // Add pagination
      finalQuery += ` GROUP BY f.id ORDER BY f.created_at DESC LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
      
      // Execute queries
      const [files] = await db.query(finalQuery, queryParams);
      const [countResult] = await db.query(countQuery, countParams);
      
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);
      
      return res.status(200).json({
        files,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      });
    } catch (error) {
      console.error('Error fetching files:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Other methods not allowed on this endpoint
  return res.status(405).json({ message: 'Method not allowed' });
}